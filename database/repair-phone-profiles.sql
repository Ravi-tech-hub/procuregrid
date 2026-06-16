-- Repair missing public.profiles rows for phone-created Auth users and ensure
-- future Auth users receive a profile automatically.
-- Run once in the Supabase SQL Editor.

begin;

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_identifier_type text;
  v_phone text;
  v_email text;
begin
  v_phone := nullif(
    coalesce(
      new.phone,
      new.raw_user_meta_data ->> 'phone',
      case
        when lower(coalesce(new.email, '')) like 'phone-%@phone-auth.procuregrid.local'
        then '+' || regexp_replace(split_part(new.email, '@', 1), '[^0-9]', '', 'g')
        else null
      end
    ),
    ''
  );

  v_identifier_type := case
    when new.raw_user_meta_data ->> 'auth_identifier_type' = 'phone'
      or v_phone is not null
      or lower(coalesce(new.email, '')) like 'phone-%@phone-auth.procuregrid.local'
    then 'phone'
    else 'email'
  end;

  v_email := case
    when v_identifier_type = 'email' then lower(new.email)
    else null
  end;

  insert into public.profiles (
    id,
    full_name,
    auth_identifier_type,
    contact_email,
    contact_phone_e164
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    v_identifier_type,
    v_email,
    case when v_identifier_type = 'phone' then v_phone else null end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function public.handle_new_auth_user_profile();

-- Backfill Auth users that currently have no public profile.
insert into public.profiles (
  id,
  full_name,
  auth_identifier_type,
  contact_email,
  contact_phone_e164
)
select
  u.id,
  nullif(u.raw_user_meta_data ->> 'full_name', ''),
  case
    when u.raw_user_meta_data ->> 'auth_identifier_type' = 'phone'
      or nullif(
        coalesce(
          u.phone,
          u.raw_user_meta_data ->> 'phone',
          case
            when lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
            then '+' || regexp_replace(split_part(u.email, '@', 1), '[^0-9]', '', 'g')
            else null
          end
        ),
        ''
      ) is not null
      or lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
    then 'phone'
    else 'email'
  end,
  case
    when u.raw_user_meta_data ->> 'auth_identifier_type' = 'phone'
      or nullif(
        coalesce(
          u.phone,
          u.raw_user_meta_data ->> 'phone',
          case
            when lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
            then '+' || regexp_replace(split_part(u.email, '@', 1), '[^0-9]', '', 'g')
            else null
          end
        ),
        ''
      ) is not null
      or lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
    then null
    else lower(u.email)
  end,
  case
    when u.raw_user_meta_data ->> 'auth_identifier_type' = 'phone'
      or nullif(
        coalesce(
          u.phone,
          u.raw_user_meta_data ->> 'phone',
          case
            when lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
            then '+' || regexp_replace(split_part(u.email, '@', 1), '[^0-9]', '', 'g')
            else null
          end
        ),
        ''
      ) is not null
      or lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
    then nullif(
      coalesce(
        u.phone,
        u.raw_user_meta_data ->> 'phone',
        case
          when lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
          then '+' || regexp_replace(split_part(u.email, '@', 1), '[^0-9]', '', 'g')
          else null
        end
      ),
      ''
    )
    else null
  end
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and (
    (
      u.raw_user_meta_data ->> 'auth_identifier_type' = 'phone'
      and nullif(
        coalesce(
          u.phone,
          u.raw_user_meta_data ->> 'phone',
          case
            when lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
            then '+' || regexp_replace(split_part(u.email, '@', 1), '[^0-9]', '', 'g')
            else null
          end
        ),
        ''
      ) is not null
    )
    or (
      u.raw_user_meta_data ->> 'auth_identifier_type' <> 'phone'
      and u.email is not null
    )
    or (
      u.raw_user_meta_data ->> 'auth_identifier_type' is null
      and u.email is not null
    )
  )
on conflict (id) do nothing;

commit;

-- Verify phone Auth users and their public profile rows.
select
  u.id,
  u.email as auth_email,
  coalesce(u.phone, u.raw_user_meta_data ->> 'phone') as auth_phone,
  p.auth_identifier_type,
  p.contact_email,
  p.contact_phone_e164
from auth.users u
left join public.profiles p on p.id = u.id
where
  u.raw_user_meta_data ->> 'auth_identifier_type' = 'phone'
  or lower(coalesce(u.email, '')) like 'phone-%@phone-auth.procuregrid.local'
order by u.created_at desc;
