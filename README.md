# naano-clone

Brand and creator sides of [naano.com](https://www.naano.com), rebuilt from observed usage.

## Setup

Seed data lives in `prisma/seed.ts` only. It is not hardcoded in pages.

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000

| Command | What it does |
| --- | --- |
| `npm run db:seed` | Wipes tables and reloads the demo fixture |
| `npm run db:reset` | Runs migrations from scratch, then seeds |

Re-run seed or reset before recording a walkthrough so wallet, collaborations, and messages start clean.

**Brand demo (after seed):** `demo@naano.clone` / `demo1234`  
Skips onboarding and lands on `/brand` (workspace **Relayed**, empty wallet, 12 creators, starter draft brief, NaanoBot thread, 0 collaborations). Extra **active** campaigns exist for the creator Opportunities feed and also appear under Relayed Campaigns.

**Creator demo (after seed):** `creator@naano.clone` / `demo1234`  
Skips onboarding and lands on `/creator` (Maya Chen marketplace profile, open opportunities, NaanoBot, empty collaborations until you apply or a brand books).

**New brand signup:** `/signup` → `/register?role=saas` → `/onboarding-brand` → `/brand`

**New creator signup:** `/signup` → `/register?role=influencer` → `/onboarding` → `/creator`

## Database (SQLite ↔ Postgres)

Connection is always via `DATABASE_URL` in `.env` (see `.env.example`). The Prisma schema and app code are written to stay swappable:

- No raw SQL (`$queryRaw` / `$executeRaw`)
- No provider-specific `@db.*` column types
- Lists/JSON stored as `String` and parsed in app code
- Booleans, `DateTime`, and `cuid()` ids only

**Local (default):** `provider = "sqlite"` and `DATABASE_URL="file:./dev.db"`.

**Vercel (Neon or Supabase):** SQLite will not persist on the serverless filesystem. Switch before deploy:

1. Create a free Postgres database (Neon or Supabase).
2. In `prisma/schema.prisma`, set `provider = "postgresql"`.
3. Set `DATABASE_URL` to the **pooled** connection string in the Vercel project env.
4. Optionally set `DIRECT_URL` to the **direct** (non-pooled) URL and add `directUrl = env("DIRECT_URL")` under `datasource db` so `prisma migrate` is reliable with poolers.
5. Set `SESSION_SECRET` to a long random string.
6. Apply schema on the empty Postgres DB, then seed:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   Existing SQLite migration SQL under `prisma/migrations/` is for local SQLite. For a clean Postgres baseline you can `db push` (demo-friendly) or regenerate migrations after switching the provider. Do not reuse the SQLite migration files as-is against Postgres.

Local SQLite and hosted Postgres can coexist as long as each environment has the matching `provider` + `DATABASE_URL` pair.

## Scope

- **Brand + creator sides.** Creator signup, onboarding, and dashboard are included; payments and OAuth stay mocked.
- **Auth:** email/password only. No real LinkedIn/Google OAuth.
- **Payments:** fake wallet top-ups and booking debits on the brand side. Creator withdraw / Stripe / bank connect are UI stubs.
- **AI:** onboarding website analysis, campaign “Create with AI”, and creator “Copy for my AI” are mocked or copy-prompt only. No model calls.
- **Pixel Naano:** install CTA only. No real tracking script.
- **Integrations / MCP:** Settings UI is present; MCP server and pixel install are not real backends.

## Cut / stub inventory

| Item | Status |
| --- | --- |
| Campaign “Create with AI” | Stub page (does not generate a brief) |
| Campaign “Start from your link” | Stub page (URL field disabled) |
| Campaign “Launch free with the Naano team” | Link-out to Cal.com stub |
| Pixel Naano “Install the pixel” | Disabled button |
| Persistent chat (“What would you like to see?”) | Stub — does not call a model |
| Settings | Profile, Audience, Team invite, and Integrations UI are built |
| Book a call / setup call | Opens `https://cal.com`, not the live Naano scheduler URL |
| Integrations MCP server | UI + copyable URL only — no real MCP server |
| Pixel Naano install | Shown as “Not installed”; no script injected |
| Team invites | Stored in DB; no real email send |
| EN/FR language toggle | Not built (English only) |
| Multi-brand workspace switcher | Real create + switch; new workspace runs onboarding |
| Notifications bell | Empty stub menu |
| Creator LinkedIn/Google OAuth | Disabled buttons — use email |
| Creator LinkedIn scrape | Mock profile from pasted URL |
| Creator withdraw / Stripe / bank | Non-functional stubs |
| Creator affiliate payouts | Static mock UI |
| Creator “Add LinkedIn experience” | Stub |

## Assumptions

- After **Book** / **Add and continue**: confirmation notice, then **Collaborations**. Not confirmed on the live site.
- **Onboarding step 3** was not captured on live Naano. This rebuild shows a short “marketplace is ready” screen, then Overview.
- Booking is **wallet-funded**. Insufficient funds block the booking; the wallet cannot go negative.
- **Direct Book** books at the listed price and does **not** attach a campaign brief. **Negotiate** can attach a campaign via the Campaign dropdown. Messages campaign filter only shows threads whose booking linked that brief.
- Creator message threads open at **`invitation_sent`** (when the brand books/offers). Creator **Apply** creates an `invitation_received` collaboration and thread so both sides see it.
- Results reach/clicks are **mocked**; attribution rows use creators you actually booked.
- Collaborations has the core table and status tabs. Campaign filter, search, and tab counts were deferred.
- Website analysis progress is mocked (~16s), not a live crawl.
- Creator Opportunities list open (`active`) campaigns only; Relayed’s original starter brief stays `draft` for the brand demo.
