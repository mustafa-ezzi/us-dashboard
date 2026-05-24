# Us Dashboard

A private, mobile-first relationship dashboard for two — built from the [PRD](./UsDashboard_PRD.md).
Powered by Next.js + Supabase. Installable as a **PWA** with **push notifications**.

## Features

- **Home** — Days together, engagement timer, apologies, immaturity, mood preview, kind acts
- **Date Planner** — Plan dates with date, time, location (+ instant push to partner)
- **Mood** — Daily 1–5 check-in + 7-day chart
- **Couple Contract** — Rules + violation log
- **Settings** — Names, anniversary, engagement date, notifications
- **PWA** — Add to home screen (full-screen app)
- **Push** — Daily mood reminder + "date planned" alert to partner

## Tech

Next.js 15 · Supabase · Tailwind · Recharts · Web Push API

---

## Setup

### 1. Database

Run in Supabase **SQL Editor** (in order if upgrading an existing project):

1. [`supabase/schema.sql`](./supabase/schema.sql) — full schema (new projects)
2. [`supabase/migration-date-planner.sql`](./supabase/migration-date-planner.sql) — if you already ran the old schema
3. [`supabase/migration-push.sql`](./supabase/migration-push.sql) — push subscriptions + notification prefs

### 2. Auth users

Create both users in **Authentication → Users** (Auto Confirm on).

### 3. Environment variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page (**keep secret**, server only) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Run `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Same command output |
| `CRON_SECRET` | Any long random string |
| `CRON_TIMEZONE` | e.g. `Asia/Karachi` |

### 4. Run locally

```bash
npm install
npm run dev
```

### 5. Deploy (Vercel)

```bash
vercel
```

Add **all** env vars from `.env.local.example` in the Vercel dashboard.

**Security:** Only put real secrets in `.env.local` (gitignored). `.env.local.example` must use placeholders only — never commit private keys, service role, or cron secrets.

---

## If GitHub emailed you about exposed secrets

Real keys were accidentally committed in an earlier version of `.env.local.example`. Do this:

1. **Rotate Supabase service role** — Dashboard → Project Settings → API → regenerate `service_role` JWT → update `.env.local` and Vercel.
2. **Use new VAPID keys** — already rotated in your local `.env.local`; update the same values in Vercel.
3. **New `CRON_SECRET`** — update locally, on Vercel, and in cron-job.org.
4. **Commit the fixed** `.env.local.example` (placeholders only) and push.
5. Old keys may still exist in git history; treat them as compromised even after rotation.

The VAPID **public** key (`NEXT_PUBLIC_VAPID_*`) is safe to expose in the browser — GitHub flags the **private** key and service role.

---

## PWA — install on phone

**Android (Chrome):** Open the site → tap **Install app** banner (or menu → Install).

**iPhone (Safari):** Share → **Add to Home Screen**. Push works on iOS 16.4+ from the home-screen app only.

---

## Push notifications

### Enable (each person, once)

1. Install the PWA (home screen)
2. **Settings → Notifications → Enable**
3. Allow when the browser asks
4. Pick your daily reminder time

### What you'll receive

| Trigger | Notification |
|---|---|
| Daily at your chosen time | "Take 30 seconds — log your mood" |
| Partner plans a date | "Mustafa planned: Dinner — Fri, Jun 6 at 7:00 PM" |

Date-planned pushes are **instant**. Daily reminders need a cron job.

### Free daily cron (cron-job.org)

1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create a job:
   - **URL:** `https://YOUR-APP.vercel.app/api/cron/daily-reminders`
   - **Schedule:** Every hour at `:00`
   - **Request header:** `Authorization: Bearer YOUR_CRON_SECRET`
3. Set `CRON_TIMEZONE=Asia/Karachi` in Vercel env (match where you live)

The cron checks each user's reminder time and sends only when it matches.

---

## Cost

**$0** for two users on Supabase + Vercel free tiers.

---

Happy birthday, Ummehani.
