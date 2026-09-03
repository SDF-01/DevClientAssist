# DevClientAssist

Client revision portal for [Airmen Voice](https://github.com/SDF-01/DevClientAssist). Clients write change notes in their own words, format them in ChatGPT, and send a structured brief to developers.

Live site: [revision-portal-eight.vercel.app](https://revision-portal-eight.vercel.app)

The product UI is branded **Dev Generator**.

## What it does

Clients submit revision requests in four steps:

1. **Write** informal notes about what should change.
2. **Ask ChatGPT** using a generated prompt that asks for a `.toon` file, then paste that file back.
3. **Pictures** (optional) with captions and annotations.
4. **Review** and send the request to the developer inbox.

Developers and admins use `/admin` to triage requests on a kanban or table, add internal notes, export agent-ready `.toon` briefs, and manage the organization.

## Stack

- React 19 + TypeScript + Vite
- React Router
- Tailwind CSS 4
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Vercel for hosting

## Access

Sign-in uses Supabase magic links. Only `mandrewschaeffer@gmail.com` can create an account automatically. Anyone else who tries to register is added to a pending queue. The owner approves or denies those requests from `/admin/org`. Approved emails can then request a sign-in link.

`mandrewschaeffer@gmail.com` is the site owner and is always treated as an admin. Inbox (`/admin`) and organization admin (`/admin/org`) require an internal role (`developer` or `admin`).

After a user clicks **Confirm your email address**, Supabase must send them back to this app, not `http://localhost:3000`. Set these values in [Authentication → URL Configuration](https://supabase.com/dashboard/project/vfarnwwsmygmldjjdpqz/auth/url-configuration):

- **Site URL:** `https://revision-portal-eight.vercel.app`
- **Redirect URLs:**
  - `https://revision-portal-eight.vercel.app/**`
  - `http://localhost:5173/**`

If an email template uses `{{ .SiteURL }}` in the confirm link, change it to `{{ .RedirectTo }}` so the app-supplied callback is used. Then request a new sign-in link. Old confirm emails that already point at localhost will keep failing.

## Local setup

Prerequisites: Node.js 20+ and npm.

```bash
git clone https://github.com/SDF-01/DevClientAssist.git
cd DevClientAssist
cp .env.example .env
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Without Supabase env vars it still starts and uses a local fallback store.

## Environment variables

Copy `.env.example` and fill in values. Never commit a real `.env`.

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | For cloud data | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For cloud data | Supabase anon/public key |
| `VITE_GITHUB_WEBHOOK_URL` | Optional | Webhook for GitHub / Cursor agent handoff |
| `VITE_ANALYTICS_ENABLED` | Optional | Set `true` to enable client analytics |
| `VITE_SITE_URL` | Optional | Public origin used in auth emails. Use the live Vercel URL in production. |

Optional model rewrite lives in the `structure-revision` Edge Function. Set `OPENAI_API_KEY` as a **Supabase function secret**, not a `VITE_` variable. A model key in `VITE_` would ship to the browser.

The `notify-team` function can post Slack alerts when `SLACK_WEBHOOK_URL` is set as a function secret.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Lint `src` with ESLint |

## App routes

| Path | Audience | Purpose |
|---|---|---|
| `/` | Clients | Landing and how-it-works |
| `/submit` | Clients | New revision wizard |
| `/requests` | Clients | Submitted requests |
| `/requests/:id` | Clients | Request status, clarifications, receipt |
| `/admin` | Developers / admins | Inbox (kanban or table) |
| `/admin/revisions/:id` | Developers / admins | Review, notes, exports |
| `/admin/org` | Admins | Organization settings |

## Backend

SQL migrations are in `supabase/migrations/`:

1. `001_initial_schema.sql` — orgs, profiles, projects, revision requests, items, comments, attachments
2. `002_rls_policies.sql` — row-level security
3. `003_demo_anon_policies_and_storage.sql` — demo access and `revision-attachments` storage
4. `004_airmen_voice_only.sql` — keeps Airmen Voice as the active project

Edge Functions:

- `structure-revision` — optional OpenAI rewrite of informal notes into a structured brief
- `notify-team` — optional Slack notification on submit

Apply migrations and deploy functions from the [Supabase CLI](https://supabase.com/docs/guides/cli) against your project.

## Deployment

The app is a Vite SPA on Vercel. `vercel.json` rewrites non-asset routes to `index.html` so client-side routing works.

Set the same `VITE_*` variables in the Vercel project. Production deploys from `main` on GitHub.

## License

No license file is published yet. All rights reserved.
