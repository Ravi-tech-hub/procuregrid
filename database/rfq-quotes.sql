-- =========================================================
-- ProcureGrid: RFQ Quotes table
-- Suppliers submit price quotes in response to buyer RFQs.
-- Run in Supabase SQL Editor AFTER rfq-foundation.sql
-- =========================================================

begin;

-- ---------------------------------------------------------
-- rfq_quotes status enum
-- ---------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'quote_status_enum'
  ) then
    create type public.quote_status_enum as enum (
      'submitted',
      'accepted',
      'rejected',
      'withdrawn'
    );
  end if;
end $$;

-- ---------------------------------------------------------
-- Main quotes table
-- ---------------------------------------------------------

create table if not exists public.rfq_quotes (
  id                    uuid primary key default gen_random_uuid(),

  -- Which RFQ this quote is for
  rfq_id                uuid not null references public.rfqs(id) on delete cascade,

  -- Which supplier is quoting
  supplier_company_id   uuid not null references public.companies(id) on delete cascade,
  submitted_by_user_id  uuid not null references auth.users(id) on delete restrict,

  -- Pricing
  unit_price            numeric(15, 4) not null check (unit_price > 0),
  currency              text not null default 'INR',
  total_price           numeric(15, 4),
  price_validity_days   integer not null default 30 check (price_validity_days > 0),

  -- Delivery
  lead_time_days        integer check (lead_time_days > 0),
  delivery_terms        text,
  payment_terms         text,

  -- Offer detail
  specifications_offered text,
  notes                 text,

  -- Status lifecycle
  status                public.quote_status_enum not null default 'submitted',

  -- Timestamps
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- One quote per supplier per RFQ
  unique (rfq_id, supplier_company_id)
);

-- Indexes
create index if not exists rfq_quotes_rfq_id_idx
  on public.rfq_quotes (rfq_id, created_at desc);

create index if not exists rfq_quotes_supplier_idx
  on public.rfq_quotes (supplier_company_id, created_at desc);

comment on table public.rfq_quotes is
  'Supplier quotations submitted in response to buyer RFQs.';

comment on column public.rfq_quotes.specifications_offered is
  'Free-text description of what exactly the supplier is offering (may differ slightly from RFQ spec).';

-- ---------------------------------------------------------
-- Updated_at trigger
-- ---------------------------------------------------------

drop trigger if exists rfq_quotes_set_updated_at on public.rfq_quotes;
create trigger rfq_quotes_set_updated_at
before update on public.rfq_quotes
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- Auto-increment quote_count on rfqs when a new quote lands
-- ---------------------------------------------------------

create or replace function public.increment_rfq_quote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.rfqs
  set quote_count = quote_count + 1
  where id = new.rfq_id;
  return new;
end;
$$;

drop trigger if exists rfq_quotes_increment_count on public.rfq_quotes;
create trigger rfq_quotes_increment_count
after insert on public.rfq_quotes
for each row execute function public.increment_rfq_quote_count();

-- Decrement on delete / withdraw
create or replace function public.decrement_rfq_quote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.rfqs
  set quote_count = greatest(0, quote_count - 1)
  where id = old.rfq_id;
  return old;
end;
$$;

drop trigger if exists rfq_quotes_decrement_count on public.rfq_quotes;
create trigger rfq_quotes_decrement_count
after delete on public.rfq_quotes
for each row execute function public.decrement_rfq_quote_count();

-- ---------------------------------------------------------
-- RLS — rfq_quotes
-- ---------------------------------------------------------

alter table public.rfq_quotes enable row level security;
alter table public.rfq_quotes force row level security;

-- SELECT: supplier sees own quotes; buyer sees quotes on their RFQs
drop policy if exists rfq_quotes_select on public.rfq_quotes;
create policy rfq_quotes_select
on public.rfq_quotes for select
to authenticated
using (
  -- Supplier can see quotes they submitted
  public.is_company_member(supplier_company_id, auth.uid())
  or
  -- Buyer can see all quotes on their own RFQs
  exists (
    select 1 from public.rfqs r
    where r.id = rfq_quotes.rfq_id
      and public.is_company_member(r.company_id, auth.uid())
  )
);

-- INSERT: any authenticated supplier member can submit a quote
drop policy if exists rfq_quotes_insert on public.rfq_quotes;
create policy rfq_quotes_insert
on public.rfq_quotes for insert
to authenticated
with check (
  public.is_company_member(supplier_company_id, auth.uid())
  and submitted_by_user_id = auth.uid()
);

-- UPDATE: supplier can update their own quote (withdraw, revise)
drop policy if exists rfq_quotes_update on public.rfq_quotes;
create policy rfq_quotes_update
on public.rfq_quotes for update
to authenticated
using (public.is_company_member(supplier_company_id, auth.uid()))
with check (public.is_company_member(supplier_company_id, auth.uid()));

-- DELETE: supplier can delete their own quote
drop policy if exists rfq_quotes_delete on public.rfq_quotes;
create policy rfq_quotes_delete
on public.rfq_quotes for delete
to authenticated
using (public.is_company_member(supplier_company_id, auth.uid()));

grant select, insert, update, delete on public.rfq_quotes to authenticated;

commit;
