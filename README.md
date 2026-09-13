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

Scan the QR code with Expo Go, or press `a`/`i` for an emulator/simulator. By default the app
talks to the deployed API (`extra.apiUrl` in `apps/mobile/app.json`,
https://tasreeh-hub-api-ashen.vercel.app). To use a local API instead, create `apps/mobile/.env` with
`EXPO_PUBLIC_API_URL=http://localhost:3000` (use your machine's LAN IP on a physical device).

## Demoing the SLA escalation flow

A request is deliberately seeded overdue (see the seed script output for its number). Trigger
the sweep manually instead of waiting on real cron timing:

```bash
curl http://localhost:3000/api/cron/sla-check -H "x-cron-secret: $CRON_SECRET"
```

Then log in as `admin@tasreeh.sa` to see the escalation notification.

## Deploying

- `apps/api` is live at https://tasreeh-hub-api-ashen.vercel.app (Vercel project `tasreeh-hub-api`,
  root directory `apps/api`, env vars set in the project). `vercel.json` runs the SLA-check cron
  once a day (the Hobby plan limit); trigger it manually for demos as shown above.
- Deploy from a clean export of the pushed commit: on the Hobby plan Vercel blocks CLI deploys
  whose git commit author doesn't match the account, so run `vercel deploy --prod` from a
  `git archive HEAD` copy that includes the `.vercel` folder.
- Check a deployment with `BASE_URL=https://tasreeh-hub-api-ashen.vercel.app pnpm --filter @tasreeh/api smoke-test`.
- The app itself is also live as a website at https://tasreeh-hub.vercel.app (Vercel project
  `tasreeh-hub`); opening the API's root URL redirects there. Rebuild it with
  `EXPO_PUBLIC_API_URL=https://tasreeh-hub-api-ashen.vercel.app pnpm --filter @tasreeh/mobile export:web`
  and deploy the `apps/mobile/web-deploy` folder. The post-export step renames `node_modules` and
  `.pnpm` asset folders, which Vercel would otherwise skip (fonts would 404 and the app would
  hang on its loading spinner).
- `apps/mobile` ships to the stores via EAS Build/Submit when ready; for the hackathon demo the
  website or `expo start` + Expo Go is enough.
