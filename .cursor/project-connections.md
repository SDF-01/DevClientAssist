# Project Connections

## GitHub

- Repository: https://github.com/SDF-01/DevClientAssist
- Default branch: `main`
- Owner: `SDF-01`

## Vercel

- Provider: Vercel
- Project: `revision-portal`
- Team: `weasel-werx`
- Production URL: https://revision-portal-eight.vercel.app
- Dashboard: https://vercel.com/weasel-werx/revision-portal
- Deploy mode: GitHub integration (auto-deploy on push to `main`)

## Environment Variables (Vercel)

Optional runtime variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GITHUB_WEBHOOK_URL`
- `VITE_ANALYTICS_ENABLED`
- `VITE_OPENAI_API_KEY`

## Protected Files

Do not commit:

- `.env`
- `.env.*` (except `.env.example`)
- `.vercel/`
- `node_modules/`
- `dist/`

## Manual Deploy Policy

Prefer GitHub push for production updates. Use `npx vercel deploy --prod` only when Git integration is unavailable.
