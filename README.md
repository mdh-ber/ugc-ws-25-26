# UGC Campaign (JamSocial Simplified)

A minimal full‑stack monorepo inspired by your JamSocial project, refocused into a **UGC campaign tracking platform**.

## What it does
- **Creators** get tracked links
- System records **clicks → sign-ups/conversions**
- **Rewards** calculated from performance
- **Admins** view dashboards & campaign analytics

## Repo layout
- `web/` — Next.js + Tailwind (Creator & Admin dashboards)
- `api/` — TypeScript API (auth, tracking, analytics)
- `shared/` — shared TypeScript types/constants

## Quick start (skeleton)
This is a starter structure with placeholder files. Add your real logic where marked.

```bash
npm install
npm run dev
```

## Key endpoints (suggested)
- `POST /auth/login`
- `POST /tracking/click`
- `POST /tracking/conversion`
- `GET  /admin/analytics`

Generated: 2026-02-05
