-- =========================================================
-- ProcureGrid: Extend catalog_items for supplier product specs
-- Run in Supabase SQL Editor AFTER signup-storage-foundation.sql
-- =========================================================

begin;

alter table public.catalog_items
  add column if not exists product_slug   text,
  add column if not exists category_slug  text,
  add column if not exists specifications text,
  add column if not exists min_order_qty  numeric(15, 4),
  add column if not exists unit           text not null default 'Pcs',
  add column if not exists price_range    text;

comment on column public.catalog_items.product_slug is
  'Matches slug in rfq-product-data.ts, e.g. cement, tmt-bar.';
comment on column public.catalog_items.specifications is
  'Newline-separated Key: Value lines of capabilities, e.g. "Grade: Fe 500D\nBrand: TATA Tiscon".';
comment on column public.catalog_items.price_range is
  'Optional human-readable price range, e.g. "₹850–₹1,200 per Bag".';

commit;
