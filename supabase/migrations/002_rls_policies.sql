-- RLS policies for Revision Portal

-- Profiles: users can read/update own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Organizations: members can read their org
create policy "organizations_select_member" on public.organizations
  for select using (
    id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
    or public.current_user_role() in ('developer', 'admin')
  );

-- Projects: org members and devs can read
create policy "projects_select" on public.projects
  for select using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
    or public.current_user_role() in ('developer', 'admin')
  );

create policy "projects_admin_all" on public.projects
  for all using (public.current_user_role() = 'admin');

-- Revision requests
create policy "revisions_select" on public.revision_requests
  for select using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
    or public.current_user_role() in ('developer', 'admin')
  );

create policy "revisions_insert_client" on public.revision_requests
  for insert with check (
    public.current_user_role() in ('client_editor', 'client_viewer', 'developer', 'admin')
  );

create policy "revisions_update" on public.revision_requests
  for update using (
    public.current_user_role() in ('developer', 'admin')
    or (submitted_by = auth.uid() and status = 'draft')
  );

-- Revision items
create policy "revision_items_select" on public.revision_items
  for select using (
    revision_id in (select id from public.revision_requests)
  );

create policy "revision_items_modify_dev" on public.revision_items
  for all using (public.current_user_role() in ('developer', 'admin'));

-- Attachments
create policy "attachments_select" on public.revision_attachments
  for select using (
    revision_id in (select id from public.revision_requests)
  );

create policy "attachments_insert" on public.revision_attachments
  for insert with check (true);

-- Events (audit log)
create policy "events_select" on public.revision_events
  for select using (
    public.current_user_role() in ('developer', 'admin')
    or revision_id in (
      select id from public.revision_requests where submitted_by = auth.uid()
    )
  );

create policy "events_insert" on public.revision_events
  for insert with check (true);

-- Exports
create policy "exports_select" on public.revision_exports
  for select using (
    public.current_user_role() in ('developer', 'admin')
    or revision_id in (
      select id from public.revision_requests where submitted_by = auth.uid()
    )
  );

create policy "exports_insert_dev" on public.revision_exports
  for insert with check (public.current_user_role() in ('developer', 'admin'));

-- Clarification messages
create policy "messages_select" on public.clarification_messages
  for select using (
    revision_id in (select id from public.revision_requests)
    and (is_internal = false or public.current_user_role() in ('developer', 'admin'))
  );

create policy "messages_insert" on public.clarification_messages
  for insert with check (true);

-- Templates: readable by all authenticated
create policy "templates_select" on public.revision_templates
  for select using (true);

-- Storage bucket policies (apply via Supabase dashboard or storage migration)
-- revision-attachments/{org_id}/{project_id}/{revision_id}/{file_id}.ext
