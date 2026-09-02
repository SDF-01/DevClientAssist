-- Restrict active projects to Airmen Voice only

update public.projects
set is_active = false
where slug <> 'airmen-voice';

insert into public.projects (organization_id, name, slug, description, github_repo, default_branch, is_active)
values (
  '00000000-0000-0000-0000-000000000001',
  'Airmen Voice',
  'airmen-voice',
  'Voice and communication platform for airmen',
  null,
  'main',
  true
)
on conflict (organization_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true;
