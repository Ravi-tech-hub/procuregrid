-- =========================================================
-- ProcureGrid Sprint 1: phone + email account identifiers
-- Run this in Supabase SQL Editor after the base Sprint 1 schema.
-- =========================================================

-- Track which identifier type each profile was created with.
alter table public.profiles
  add column if not exists auth_identifier_type text,
  add column if not exists contact_email text,
  add column if not exists contact_phone_e164 text;

-- Restrict identifier type values to the two supported auth modes.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_auth_identifier_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_auth_identifier_type_check
      check (
        auth_identifier_type is null
        or auth_identifier_type in ('email', 'phone')
      );
  end if;
end $$;

-- Keep the stored contact fields internally consistent.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_contact_identifier_consistency_check'
  ) then
    alter table public.profiles
      add constraint profiles_contact_identifier_consistency_check
      check (
        (auth_identifier_type is null and contact_email is null and contact_phone_e164 is null)
        or (auth_identifier_type = 'email' and contact_email is not null and contact_phone_e164 is null)
        or (auth_identifier_type = 'phone' and contact_phone_e164 is not null and contact_email is null)
      );
  end if;
end $$;

-- Enforce one profile row per email across the app layer.
create unique index if not exists profiles_contact_email_unique
  on public.profiles (lower(contact_email))
  where contact_email is not null;

-- Enforce one profile row per E.164 phone number across the app layer.
create unique index if not exists profiles_contact_phone_e164_unique
  on public.profiles (contact_phone_e164)
  where contact_phone_e164 is not null;

comment on column public.profiles.auth_identifier_type is
  'Primary auth identifier used at signup: email or phone.';

comment on column public.profiles.contact_email is
  'Normalized lowercase email used for email-based auth accounts.';

comment on column public.profiles.contact_phone_e164 is
  'Normalized E.164 phone number used for phone-based auth accounts.';
