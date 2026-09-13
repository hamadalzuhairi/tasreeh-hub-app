# تصريح | Tasreeh Hub

بوابة رقمية موحدة لتنظيم التواصل بين الإعلاميين والمتحدثين الرسميين الحكوميين — MVP.

## البنية

```
apps/api      Next.js API (deployed to Vercel) — auth, requests, SLA/escalation, reports, archive
apps/mobile   Expo (React Native) mobile app — Expo Router, matches the 12-screen mockup
packages/shared  Shared TypeScript types/constants used by both apps
docs/         Original idea document + UI mockup reference
```

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Backend environment

Copy `apps/api/.env.example` to `apps/api/.env` and fill in:

- `DATABASE_URL` — a Neon/Vercel Postgres connection string (create one at
  https://vercel.com/storage/postgres or https://neon.tech — free tier is enough for the MVP).
- `JWT_SECRET` — any long random string.
- `GEMINI_API_KEY` — a Gemini API key (https://aistudio.google.com/apikey), used server-side
  only for classifying/routing incoming requests. Never exposed to the mobile app. If left
  empty the app still works — it falls back to the user-picked type and a default department.
- `CRON_SECRET` — any long random string (Vercel sends it automatically as a bearer token to
  the cron route once set as an env var on the Vercel project).

### 3. Push the schema and seed demo data

```bash
pnpm db:push
pnpm db:seed
```

Seeded demo accounts (password for all: `Demo1234!`):

| Role | Email |
|---|---|
| Admin | admin@tasreeh.sa |
| Spokesperson (وزارة الصحة) | spokesperson1@tasreeh.sa |
| Journalist (primary demo account) | journalist@tasreeh.sa |
| Journalist (secondary) | journalist2@tasreeh.sa |

### 4. Run the backend

```bash
pnpm api:dev
```

Verify the core flow end-to-end:

```bash
pnpm --filter @tasreeh/api smoke-test
```

### 5. Run the mobile app

```bash
pnpm mobile:start
```

Scan the QR code with Expo Go, or press `a`/`i` for an emulator/simulator. If testing on a
physical device, update `extra.apiUrl` in `apps/mobile/app.json` to your machine's LAN IP
(not `localhost`) so the device can reach the API.

## Demoing the SLA escalation flow

A request is deliberately seeded overdue (see the seed script output for its number). Trigger
the sweep manually instead of waiting on real cron timing:

```bash
curl http://localhost:3000/api/cron/sla-check -H "x-cron-secret: $CRON_SECRET"
```

Then log in as `admin@tasreeh.sa` to see the escalation notification.

## Deploying

- `apps/api` deploys to Vercel as-is (`vercel.json` configures the SLA-check cron). Set the
  same env vars from `.env` in the Vercel project settings.
- `apps/mobile` ships via EAS Build/Submit when ready; for now `expo start` + Expo Go is enough
  for the hackathon demo.
