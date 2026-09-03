-- Whitelist the site owner as admin for UI JWT checks and RLS.

create or replace function public.is_site_owner(check_email text)
returns boolean
language sql
stable
as $$
  select lower(trim(coalesce(check_email, ''))) = 'mandrewschaeffer@gmail.com';
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select case
    when public.is_site_owner(auth.jwt() ->> 'email') then 'admin'
    else coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'client_editor')
  end;
$$;

grant execute on function public.is_site_owner(text) to anon, authenticated;
grant execute on function public.current_user_role() to anon, authenticated;

create or replace function public.assign_owner_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_site_owner(new.email) then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
      'role', 'admin',
      'organization_id', '00000000-0000-0000-0000-000000000001'
    );
  end if;
  return new;
end;
$$;

create or replace function public.sync_owner_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_owner(new.email) then
    return new;
  end if;

  insert into public.profiles (id, email, full_name, role, organization_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'admin',
    '00000000-0000-0000-0000-000000000001'
  )
  on conflict (id) do update set
    email = excluded.email,
    role = 'admin',
    organization_id = excluded.organization_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (
    '00000000-0000-0000-0000-000000000001',
    new.id,
    'admin'
  )
  on conflict (organization_id, user_id) do update set
    role = 'admin';

  return new;
end;
$$;

drop trigger if exists assign_owner_privileges_before_user on auth.users;
create trigger assign_owner_privileges_before_user
  before insert or update of email, raw_app_meta_data on auth.users
  for each row execute function public.assign_owner_privileges();

drop trigger if exists sync_owner_profile_after_user on auth.users;
create trigger sync_owner_profile_after_user
  after insert or update of email on auth.users
  for each row execute function public.sync_owner_profile();

revoke all on function public.assign_owner_privileges() from public, anon, authenticated;
revoke all on function public.sync_owner_profile() from public, anon, authenticated;

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
  'role', 'admin',
  'organization_id', '00000000-0000-0000-0000-000000000001'
)
where public.is_site_owner(email);

insert into public.profiles (id, email, full_name, role, organization_id)
select
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  'admin',
  '00000000-0000-0000-0000-000000000001'
from auth.users
where public.is_site_owner(email)
on conflict (id) do update set
  email = excluded.email,
  role = 'admin',
  organization_id = excluded.organization_id;

insert into public.organization_members (organization_id, user_id, role)
select
  '00000000-0000-0000-0000-000000000001',
  id,
  'admin'
from auth.users
where public.is_site_owner(email)
on conflict (organization_id, user_id) do update set
  role = 'admin';
