-- =========================================================
-- ProcureGrid RFQ Foundation
-- Creates the rfqs, rfq_documents tables, Storage bucket,
-- and full RLS policies following the existing tenant pattern.
--
-- Run this in Supabase SQL Editor after signup-storage-foundation.sql
-- =========================================================

begin;

-- ---------------------------------------------------------
-- RFQ visibility enum
-- ---------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'rfq_visibility_enum'
  ) then
    create type public.rfq_visibility_enum as enum (
      'public',
      'private',
      'selected'
    );
  end if;
end $$;

-- ---------------------------------------------------------
-- RFQ status enum
-- ---------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'rfq_status_enum'
  ) then
    create type public.rfq_status_enum as enum (
      'draft',
      'open',
      'closed',
      'cancelled',
      'awarded'
    );
  end if;
end $$;

-- ---------------------------------------------------------
-- Main RFQs table
-- ---------------------------------------------------------

create table if not exists public.rfqs (
  id                    uuid primary key default gen_random_uuid(),

  -- Ownership
  company_id            uuid not null references public.companies(id) on delete cascade,
  created_by_user_id    uuid not null references auth.users(id) on delete restrict,

  -- RFQ number (human-readable, auto-generated)
  rfq_number            text unique not null
                          default 'RFQ-' || to_char(now(), 'YYYYMMDD') || '-' ||
                                  upper(substring(gen_random_uuid()::text from 1 for 6)),

  -- Core fields (all required by acceptance criteria)
  category              text not null,
  product_name          text not null,
  quantity              numeric(15, 4) not null check (quantity > 0),
  unit                  text not null default 'Pcs',
  delivery_location     text not null,
  expected_delivery_date date not null,
  specifications        text not null,

  -- Visibility
  visibility            public.rfq_visibility_enum not null default 'public',

  -- Optional: comma-separated supplier names/emails when visibility = 'selected'
  selected_suppliers    text,

  -- Status lifecycle
  status                public.rfq_status_enum not null default 'open',

  -- Metadata
  quote_count           integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  closed_at             timestamptz,
  expires_at            timestamptz
);

-- Indexes
create index if not exists rfqs_company_id_idx
  on public.rfqs (company_id, created_at desc);

create index if not exists rfqs_status_visibility_idx
  on public.rfqs (status, visibility, created_at desc);

create index if not exists rfqs_category_idx
  on public.rfqs (category);

comment on table public.rfqs is
  'Buyer RFQs (Request For Quotation). Each row is one procurement requirement.';

comment on column public.rfqs.rfq_number is
  'Auto-generated human-readable RFQ reference number, e.g. RFQ-20260712-A3F9C1.';

comment on column public.rfqs.selected_suppliers is
  'Comma-separated supplier names or emails. Only relevant when visibility = ''selected''.';

-- ---------------------------------------------------------
-- RFQ documents table (uploaded supporting files)
-- ---------------------------------------------------------

create table if not exists public.rfq_documents (
  id              uuid primary key default gen_random_uuid(),
  rfq_id          uuid not null references public.rfqs(id) on delete cascade,
  company_id      uuid not null references public.companies(id) on delete cascade,

  -- Storage references
  storage_bucket  text not null,
  storage_path    text not null unique,

  -- File metadata
  original_name   text not null,
  mime_type       text,
  file_size_bytes bigint,

  -- Display
  display_name    text,
  sort_order      integer not null default 0,

  created_at      timestamptz not null default now()
);

create index if not exists rfq_documents_rfq_id_idx
  on public.rfq_documents (rfq_id, sort_order);

comment on table public.rfq_documents is
  'Supporting documents and images attached to an RFQ.';

-- ---------------------------------------------------------
-- Updated_at trigger (reuses existing function)
-- ---------------------------------------------------------

drop trigger if exists rfqs_set_updated_at on public.rfqs;
create trigger rfqs_set_updated_at
before update on public.rfqs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- RLS — RFQs
-- Buyers can manage their own company's RFQs.
-- Public RFQs are visible to all authenticated users
-- (suppliers need to see them to quote).
-- ---------------------------------------------------------

alter table public.rfqs enable row level security;
alter table public.rfqs force row level security;

-- SELECT: own company's RFQs always visible; public/open RFQs visible to all authenticated
drop policy if exists rfqs_select_own on public.rfqs;
create policy rfqs_select_own
on public.rfqs for select
to authenticated
using (
  -- Members of the company that created the RFQ can always see it
  public.is_company_member(company_id, auth.uid())
  or
  -- All authenticated users can see public open RFQs (suppliers need this to quote)
  (visibility = 'public' and status = 'open')
);

-- INSERT: any active member of the company can create RFQs
drop policy if exists rfqs_insert_member on public.rfqs;
create policy rfqs_insert_member
on public.rfqs for insert
to authenticated
with check (
  public.is_company_member(company_id, auth.uid())
  and created_by_user_id = auth.uid()
);

-- UPDATE: only admins can update (status changes, edits)
drop policy if exists rfqs_update_admin on public.rfqs;
create policy rfqs_update_admin
on public.rfqs for update
to authenticated
using (public.is_company_admin(company_id, auth.uid()))
with check (public.is_company_admin(company_id, auth.uid()));

-- DELETE: only admins can delete
drop policy if exists rfqs_delete_admin on public.rfqs;
create policy rfqs_delete_admin
on public.rfqs for delete
to authenticated
using (public.is_company_admin(company_id, auth.uid()));

grant select, insert, update, delete on public.rfqs to authenticated;

-- ---------------------------------------------------------
-- RLS — RFQ documents
-- ---------------------------------------------------------

alter table public.rfq_documents enable row level security;
alter table public.rfq_documents force row level security;

-- SELECT: company members can see their RFQ documents
drop policy if exists rfq_documents_select_member on public.rfq_documents;
create policy rfq_documents_select_member
on public.rfq_documents for select
to authenticated
using (public.is_company_member(company_id, auth.uid()));

-- INSERT: any company member can upload documents to their own RFQs
drop policy if exists rfq_documents_insert_member on public.rfq_documents;
create policy rfq_documents_insert_member
on public.rfq_documents for insert
to authenticated
with check (
  public.is_company_member(company_id, auth.uid())
  and exists (
    select 1 from public.rfqs r
    where r.id = rfq_documents.rfq_id
      and r.company_id = rfq_documents.company_id
  )
);

-- DELETE: admins can remove documents
drop policy if exists rfq_documents_delete_admin on public.rfq_documents;
create policy rfq_documents_delete_admin
on public.rfq_documents for delete
to authenticated
using (public.is_company_admin(company_id, auth.uid()));

grant select, insert, delete on public.rfq_documents to authenticated;

-- ---------------------------------------------------------
-- Storage bucket: rfq-documents
-- Path convention: company/{company_id}/rfq/{rfq_id}/{uuid}.{ext}
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rfq-documents',
  'rfq-documents',
  false,
  10485760,  -- 10 MB per file
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public            = excluded.public,
    file_size_limit   = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS

drop policy if exists rfq_documents_storage_select on storage.objects;
create policy rfq_documents_storage_select
on storage.objects for select
to authenticated
using (
  bucket_id = 'rfq-documents'
  and split_part(name, '/', 1) = 'company'
  and public.is_company_member((split_part(name, '/', 2))::uuid, auth.uid())
);

drop policy if exists rfq_documents_storage_insert on storage.objects;
create policy rfq_documents_storage_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'rfq-documents'
  and split_part(name, '/', 1) = 'company'
  and public.is_company_member((split_part(name, '/', 2))::uuid, auth.uid())
);

drop policy if exists rfq_documents_storage_delete on storage.objects;
create policy rfq_documents_storage_delete
on storage.objects for delete
to authenticated
using (
  bucket_id = 'rfq-documents'
  and split_part(name, '/', 1) = 'company'
  and public.is_company_admin((split_part(name, '/', 2))::uuid, auth.uid())
);

commit;
