-- Add the Features starter template next to Bug Fix Report.

insert into public.revision_templates (name, description, template_text, category)
select
  'Features',
  'Ask for a new feature or capability',
  '- Name the feature
- What the user should be able to do
- Where it should appear in the app
- What the finished result should look like
- Leave the rest of the app as it is',
  'functionality'
where not exists (
  select 1 from public.revision_templates where name = 'Features'
);
