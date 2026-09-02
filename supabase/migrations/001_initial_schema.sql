-- Revision Portal initial schema

create extension if not exists "pgcrypto";

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Profiles linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'client_editor' check (role in ('client_viewer', 'client_editor', 'developer', 'admin')),
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Organization membership
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('client_viewer', 'client_editor', 'developer', 'admin')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- Projects (replaces static apps list)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  github_repo text,
  default_branch text default 'main',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

-- Revision requests
create table if not exists public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  submitted_by uuid references public.profiles(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in (
    'draft', 'submitted', 'in_review', 'needs_clarification',
    'approved', 'exported', 'in_progress', 'done', 'rejected'
  )),
  title text not null default 'Revision Request',
  raw_request text not null default '',
  structured_payload jsonb,
  internal_notes text,
  client_notes text,
  contact_name text,
  contact_email text,
  urgency text not null default 'medium' check (urgency in ('low', 'medium', 'high', 'critical')),
  due_date timestamptz,
  version integer not null default 1,
  parent_revision_id uuid references public.revision_requests(id) on delete set null,
  completeness_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

-- Parsed revision items
create table if not exists public.revision_items (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revision_requests(id) on delete cascade,
  order_index integer not null,
  category text not null,
  priority text not null,
  summary text not null,
  details text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Attachments metadata
create table if not exists public.revision_attachments (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revision_requests(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  caption text not null default '',
  annotation_data text,
  public_url text,
  created_at timestamptz not null default now()
);

-- Audit events
create table if not exists public.revision_events (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revision_requests(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Export artifacts
create table if not exists public.revision_exports (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revision_requests(id) on delete cascade,
  format text not null check (format in ('toon', 'markdown', 'json', 'pdf')),
  file_name text not null,
  content text,
  storage_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Clarification threads
create table if not exists public.clarification_messages (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revision_requests(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  is_internal boolean not null default false,
  message text not null,
  created_at timestamptz not null default now()
);

-- Revision templates
create table if not exists public.revision_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  template_text text not null,
  category text not null default 'other',
  created_at timestamptz not null default now()
);

-- Brand kits (optional)
create table if not exists public.project_brand_kits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  primary_color text,
  secondary_color text,
  font_family text,
  logo_url text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_revision_requests_org on public.revision_requests(organization_id);
create index if not exists idx_revision_requests_project on public.revision_requests(project_id);
create index if not exists idx_revision_requests_status on public.revision_requests(status);
create index if not exists idx_revision_events_revision on public.revision_events(revision_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists revision_requests_updated_at on public.revision_requests;
create trigger revision_requests_updated_at
  before update on public.revision_requests
  for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.revision_requests enable row level security;
alter table public.revision_items enable row level security;
alter table public.revision_attachments enable row level security;
alter table public.revision_events enable row level security;
alter table public.revision_exports enable row level security;
alter table public.clarification_messages enable row level security;
alter table public.revision_templates enable row level security;
alter table public.project_brand_kits enable row level security;

-- Helper: get user role from JWT app_metadata
create or replace function public.current_user_role()
returns text as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'client_editor');
$$ language sql stable;

-- Seed default org and projects for demo
insert into public.organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default-org')
on conflict (slug) do nothing;

insert into public.projects (organization_id, name, slug, description, github_repo, default_branch)
values
  ('00000000-0000-0000-0000-000000000001', 'Airmen Voice', 'airmen-voice', 'Voice and communication platform for airmen', null, 'main')
on conflict do nothing;

insert into public.revision_templates (name, description, template_text, category)
values
  ('Homepage Hero Update', 'Update hero section layout, copy, or imagery', '- Update the homepage hero section\n- Match attached reference screenshot\n- Keep existing navigation unchanged', 'ui'),
  ('Bug Fix Report', 'Report a broken feature or error', '- Describe the bug and steps to reproduce\n- Expected vs actual behavior\n- Priority: high', 'functionality'),
  ('Copy Change', 'Update text, labels, or messaging', '- Update the following copy:\n- Keep tone consistent with brand guidelines', 'content')
on conflict do nothing;
