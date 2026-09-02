-- Allow anonymous demo access for client intake MVP

create policy "projects_select_public" on public.projects
  for select using (true);

create policy "revisions_select_public" on public.revision_requests
  for select using (true);

create policy "revisions_insert_public" on public.revision_requests
  for insert with check (true);

create policy "revisions_update_public" on public.revision_requests
  for update using (true);

create policy "revision_items_all_public" on public.revision_items
  for all using (true) with check (true);

create policy "attachments_all_public" on public.revision_attachments
  for all using (true) with check (true);

create policy "events_all_public" on public.revision_events
  for all using (true) with check (true);

create policy "exports_all_public" on public.revision_exports
  for all using (true) with check (true);

create policy "messages_all_public" on public.clarification_messages
  for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('revision-attachments', 'revision-attachments', true)
on conflict (id) do nothing;

create policy "storage_public_read" on storage.objects
  for select using (bucket_id = 'revision-attachments');

create policy "storage_public_insert" on storage.objects
  for insert with check (bucket_id = 'revision-attachments');

create policy "storage_public_update" on storage.objects
  for update using (bucket_id = 'revision-attachments');

create policy "storage_public_delete" on storage.objects
  for delete using (bucket_id = 'revision-attachments');
