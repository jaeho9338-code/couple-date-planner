# Couple's Date Planner

A private, two-person date-log & planner web app — built as a real side project for personal use, sanitized here to show the architecture and workflow. All personal identifiers (names, photos, real dates, credentials) have been replaced with generic demo values.

**Stack:** Vite + React (SPA) · Supabase (Postgres + Realtime + Storage) · Gemini API · Vercel

## Features

- **Date log** — record where/when you went, with photos, mood tags, and a memo. A "1 year ago today" throwback surfaces past logs automatically.
- **Realtime sync** — either person's edits appear on the other's screen instantly via Supabase Realtime subscriptions, no refresh needed.
- **Planner** — a lightweight kanban-ish flow for date ideas (아이디어 → 확정 → 완료) plus a shared recurring/one-off schedule calendar.
- **AI recommendations** — free-text prompt ("비 오는 날 실내 데이트") → Gemini parses intent/conditions → filters a curated local spot dataset → ranks and returns picks, with a freeform-generation fallback when local data is too sparse.
- **Expense tracking** — simple shared spend log, categorized, summed by person.
- **Bucket list**, **anniversaries** with yearly repeat, and an optional photo-based **timetable** share between the two profiles (with a visibility toggle).

## Architecture

```
Browser (SPA)
  ├─ direct Supabase client calls (RLS: open read/write — see note below)
  │    reads/writes: date_logs, date_plans, expenses, anniversaries,
  │                  schedules, profiles, location_presets
  ├─ Supabase Realtime channel subscriptions per table
  └─ POST /api/recommend  ──►  Vercel serverless function
                                  └─ server/recommend.js (shared with local dev)
                                       ├─ Gemini call #1: parse prompt → structured intent
                                       ├─ local JSON dataset filter/rank
                                       └─ Gemini call #2: rank picks (or freeform fallback)
```

- **Client ↔ DB is direct**, not proxied through a backend — Supabase's row-level security is intentionally left open (`using (true) with check (true)`) since this is a private, two-user app gated by a shared password, not a multi-tenant product. See `supabase/setup.sql`.
- **The only server-side hop is the LLM call.** `GEMINI_API_KEY` never reaches the browser — `server/api-server.js` wraps the same `server/recommend.js` logic for local dev, and `api/recommend.js` wraps it as a Vercel function in production. One recommendation module, two thin transport layers.
- **Every Supabase-backed feature follows one hook shape**: `use<Table>.js` → `{ data, loading, refresh }`, with a `postgres_changes` subscription wired into a `useEffect` cleanup. New tables/features reuse this pattern rather than inventing a new one.
- **Full-screen overlays** (photo lightbox, profile settings, bottom sheets) render via `createPortal(..., document.body)` — nesting a `position: fixed` element inside a card that has a CSS `transform` on `:active` silently breaks fixed positioning, so portals are the standing convention for anything full-viewport.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase + Gemini keys
npm run dev                  # http://localhost:5173
```

Run `supabase/setup.sql` against a fresh Supabase project to create the schema, enable RLS, and turn on Realtime for the relevant tables. You'll also need a `profiles` table with two rows (ids `a` and `b` by default — see `src/components/ProfilePicker.jsx`) holding `nickname`, `avatar_url`, `timetable_url`, `timetable_visible`.

Deploy with the Vercel CLI directly (`vercel --prod`) — no GitHub integration required. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` (server-only, no `VITE_` prefix) as Vercel project environment variables.

## What's demo-value vs. real

- Shared password (`src/components/PasswordGate.jsx`), profile IDs, and the anniversary start date (`src/lib/dday.js`) are placeholder values — swap them for your own.
- `server/spots.json` / `server/home_ideas.json` are a small curated sample dataset for the recommendation engine, not a real production dataset.
