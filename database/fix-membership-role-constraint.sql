-- Align legacy company_memberships role checks with the current role model.
-- Run this once in the Supabase SQL Editor.

begin;

alter table public.company_memberships
  drop constraint if exists company_memberships_role_check;

-- Preserve existing supplier memberships created under older schemas.
update public.company_memberships
set role = 'supplier_operator'
where role::text in ('supplier_admin', 'supplier_sales');

alter table public.company_memberships
  add constraint company_memberships_role_check
  check (
    role::text in (
      'company_admin',
      'buyer_procurement',
      'buyer_finance',
      'supplier_operator'
    )
  );

commit;

-- Confirm the active constraint definition.
select
  conname,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.company_memberships'::regclass
  and conname = 'company_memberships_role_check';
