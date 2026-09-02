# Project Connections

## GitHub

- Repository: https://github.com/SDF-01/DevClientAssist
- Default branch: `main`
- Owner: `SDF-01`

## Vercel

- Provider: Vercel
- Project: `dev-client-assist`
- Team: `weasel-werx`
- Production URL: https://revision-portal-eight.vercel.app
- Note: `dev-client-assist.vercel.app` is owned by another Vercel project and does not serve this app.
- Team URL: https://dev-client-assist-weasel-werx.vercel.app (may require Vercel login if deployment protection is on)
- Dashboard: https://vercel.com/weasel-werx/dev-client-assist
- Deploy mode: GitHub integration (auto-deploy on push to `main`)

## Supabase

- Project: `DevClientAssist`
- Project ref: `vfarnwwsmygmldjjdpqz`
- Region: `ap-southeast-1`
- API URL: https://vfarnwwsmygmldjjdpqz.supabase.co
- Dashboard: https://supabase.com/dashboard/project/vfarnwwsmygmldjjdpqz
- Anon key: stored in Vercel env (`VITE_SUPABASE_ANON_KEY`), not committed

## Environment Variables (Vercel)

Configured in all environments (production, preview, development):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ANALYTICS_ENABLED=true`

Optional (not set):

- `VITE_GITHUB_WEBHOOK_URL`
- `VITE_OPENAI_API_KEY`

## Protected Files

Do not commit:

- `.env`
- `.env.local`
- `.vercel/`
- `node_modules/`
- `dist/`

## Manual Deploy Policy

Prefer GitHub push for production updates. Use `npx vercel deploy --prod` only when Git integration is unavailable.
