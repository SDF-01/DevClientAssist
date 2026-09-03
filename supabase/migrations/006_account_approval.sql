-- Only the site owner can create an account immediately.
-- Everyone else must be approved from the admin queue.

create table if not exists public.account_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_email text
);

alter table public.account_requests enable row level security;

create or replace function public.is_approved_email(check_email text)
returns boolean
language sql
stable
as $$
  select public.is_site_owner(check_email)
    or exists (
      select 1
      from public.account_requests
      where email = lower(trim(coalesce(check_email, '')))
        and status = 'approved'
    );
$$;

create or replace function public.get_account_access(check_email text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_site_owner(check_email) then 'approved'
    when exists (
      select 1 from public.account_requests
      where email = lower(trim(coalesce(check_email, ''))) and status = 'approved'
    ) then 'approved'
    when exists (
      select 1 from public.account_requests
      where email = lower(trim(coalesce(check_email, ''))) and status = 'denied'
    ) then 'denied'
    when exists (
      select 1 from public.account_requests
      where email = lower(trim(coalesce(check_email, ''))) and status = 'pending'
    ) then 'pending'
    else 'none'
  end;
$$;

create or replace function public.request_account_access(request_email text, request_name text default '')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(trim(coalesce(request_email, '')));
  current_status text;
begin
  if normalized = '' or position('@' in normalized) = 0 then
    raise exception 'invalid_email';
  end if;

  if public.is_site_owner(normalized) then
    insert into public.account_requests (email, full_name, status, reviewed_at, reviewer_email)
    values (normalized, trim(coalesce(request_name, '')), 'approved', now(), normalized)
    on conflict (email) do update set status = 'approved';
    return 'approved';
  end if;

  select status into current_status
  from public.account_requests
  where email = normalized;

  if current_status is not null then
    return current_status;
  end if;

  insert into public.account_requests (email, full_name, status)
  values (normalized, trim(coalesce(request_name, '')), 'pending');

  return 'pending';
end;
$$;

create or replace function public.review_account_access(target_email text, next_status text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(trim(coalesce(target_email, '')));
begin
  if not public.is_site_owner(auth.jwt() ->> 'email') then
    raise exception 'not_authorized';
  end if;

  if next_status not in ('approved', 'denied') then
    raise exception 'invalid_status';
  end if;

  update public.account_requests
  set
    status = next_status,
    reviewed_at = now(),
    reviewer_email = lower(coalesce(auth.jwt() ->> 'email', ''))
  where email = normalized;

  if not found then
    raise exception 'request_not_found';
  end if;

  return next_status;
end;
$$;

create or replace function public.reject_unapproved_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_approved_email(new.email) then
    return new;
  end if;

  raise exception 'account_not_approved'
    using hint = 'This email must be approved by the site owner before an account can be created.';
end;
$$;

drop trigger if exists reject_unapproved_signup on auth.users;
create trigger reject_unapproved_signup
  before insert on auth.users
  for each row execute function public.reject_unapproved_signup();

drop policy if exists account_requests_owner_select on public.account_requests;
create policy account_requests_owner_select on public.account_requests
  for select using (public.is_site_owner(auth.jwt() ->> 'email'));

drop policy if exists account_requests_owner_update on public.account_requests;
create policy account_requests_owner_update on public.account_requests
  for update using (public.is_site_owner(auth.jwt() ->> 'email'));

grant execute on function public.is_approved_email(text) to anon, authenticated;
grant execute on function public.get_account_access(text) to anon, authenticated;
grant execute on function public.request_account_access(text, text) to anon, authenticated;
grant execute on function public.review_account_access(text, text) to authenticated;
revoke all on function public.reject_unapproved_signup() from public, anon, authenticated;

insert into public.account_requests (email, full_name, status, reviewed_at, reviewer_email)
values (
  'mandrewschaeffer@gmail.com',
  'Site Owner',
  'approved',
  now(),
  'mandrewschaeffer@gmail.com'
)
on conflict (email) do update set
  status = 'approved',
  reviewed_at = excluded.reviewed_at;
