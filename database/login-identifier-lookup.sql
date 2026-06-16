-- =========================================================
-- ProcureGrid login account lookup helper
-- Purpose:
-- Allow the public login page to check whether an email or phone
-- account exists without exposing raw profile rows.
-- =========================================================

create or replace function public.login_identifier_exists(
  p_identifier_type text,
  p_identifier_value text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from auth.users u
    left join public.profiles p
      on p.id = u.id
    where (
      p_identifier_type = 'email'
      and (
        lower(u.email) = lower(trim(p_identifier_value))
        or p.contact_email = lower(trim(p_identifier_value))
      )
    ) or (
      p_identifier_type = 'phone'
      and (
        p.contact_phone_e164 = trim(p_identifier_value)
        or coalesce(u.raw_user_meta_data ->> 'phone', '') = trim(p_identifier_value)
        or lower(coalesce(u.email, '')) =
          'phone-' || regexp_replace(trim(p_identifier_value), '[^0-9]', '', 'g') || '@phone-auth.procuregrid.local'
      )
    )
  );
$$;

revoke all on function public.login_identifier_exists(text, text) from public;
grant execute on function public.login_identifier_exists(text, text) to anon, authenticated;
