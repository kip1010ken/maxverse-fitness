# CLAUDE.md — Maxverse Fitness

## Project Overview
Maxverse Fitness is a web application for a personal training business based in Nairobi, Kenya. Core goals:
- Client outreach and engagement
- Sell fitness plans (3 tier plans)
- Offer virtual personal training
- Offer meal plans
- Sell supplements and gym wear
- WhatsApp integration for quick client engagement
- show case clients progress, i.e before and after

## Tech Stack
- Frontend: React 18 + TypeScript, built with Vite
- Routing: react-router-dom
- Styling: Tailwind CSS (custom tokens in tailwind.config.js — charcoal/bone/flame/moss/steel palette, Anton/Work Sans/IBM Plex Mono type)
- Backend: Node.js via Netlify Functions (serverless)
- Database: Neon (serverless Postgres) — use @neondatabase/serverless driver for connection efficiency in serverless functions, not a traditional pg pool
- Auth: Clerk — phone number + SMS OTP as primary sign-in (enable Kenya on Clerk's SMS allowlist; not enabled by default). Session JWTs verified in Netlify Functions.
- Payments: M-Pesa Daraja API
- Messaging: wa.me deep link for now (src/services/whatsapp.ts); migrate to WhatsApp Business Platform API when automating outreach
- Hosting: Netlify

## Conventions
- Language: TypeScript throughout, strict mode on
- Components: PascalCase, one component per file, in src/components/
- Pages: PascalCase, in src/pages/, wired up in src/App.tsx
- Formatting: (add Prettier config if desired)
- Commit style: Conventional Commits, e.g. `feat:`, `fix:`
- Branch naming: `feature/xyz`, `fix/xyz`

## Architecture Notes
- Keep client-facing pages (plans, meal plans, supplements & gym wear storefront) separate from admin/coach dashboard
- WhatsApp integration should be an isolated service/module so it can be swapped or extended independently
- Payment flows (plan purchases, supplement sales and gym wear ) should be isolated from unrelated business logic for easier auditing
- Netlify Functions have execution time limits — fine for typical API calls, but scheduled/long-running work (e.g. WhatsApp broadcast reminders) should use Netlify Scheduled Functions rather than a synchronous request

## Build & Run Commands
```bash
npm install

# Frontend only (no Netlify Functions — fine for pure UI work)
npm run dev

# Full stack, including Netlify Functions (plans, orders, admin, etc.)
npx netlify-cli dev

npm run build           # typecheck + production build
npm run typecheck       # frontend + functions, no build
npm test                # vitest

# Apply a SQL file in db/ against DATABASE_URL (source .env first)
set -a && source .env && set +a
npm run db:migrate -- db/004_indexes.sql
```

## Hard Rules
- Never commit API keys, WhatsApp Business tokens, Daraja API credentials, or Clerk secret keys — use environment variables
- M-Pesa Daraja callbacks must be validated server-side before marking any order/payment as complete — never trust client-reported payment status
- Always validate and sanitize client-submitted data (meal plan forms, contact forms) before storing
- Prefer accessibility-friendly components (this app will be used by a general public audience, not just developers)

## Response Style Preferences
- Be concise when explaining code changes — skip restating what wasn't touched
- Favor small, reviewable diffs over large rewrites unless explicitly asked for a refactor
