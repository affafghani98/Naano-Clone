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

For real email delivery, set `RESEND_API_KEY` in `.env` (see `.env.example`). Without it, login codes are logged to the terminal as `[naano-auth]`.

Open http://localhost:3000

| Command | What it does |
| --- | --- |
| `npm run db:seed` | Wipes tables and reloads the demo fixture |
| `npm run db:reset` | Runs migrations from scratch, then seeds |

Re-run seed or reset before recording a walkthrough so wallet, collaborations, and messages start clean.

**Brand demo (after seed):** On `/login`, click **Brand demo** (instant, no email code) → `/brand`  
Workspace **Relayed**, empty wallet, 12 creators, starter draft brief, NaanoBot, 0 collaborations. Extra **active** campaigns exist for creator Opportunities.

**Creator demo (after seed):** On `/login`, click **Creator demo** → `/creator`  
Maya Chen profile, open opportunities, NaanoBot.

**New brand signup:** `/signup` → `/register?role=saas` → email + 6-digit code → `/onboarding-brand` → `/brand`  
Starter brief is published as **active**. Seeded Relayed still keeps its original draft brief plus separate active campaigns.

**New creator signup:** `/signup` → `/register?role=influencer` → email + 6-digit code → `/onboarding` → `/creator`

**Same email, both roles:** Register the second role with the same email (verify via code), or use profile menu → Add creator profile / Add brand workspace. Login shows a role chooser when both exist.

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
- **Auth:** email + one-time 6-digit code via Resend (no passwords, no OAuth). Without `RESEND_API_KEY`, codes are printed in the server terminal. Seeded demos use instant login buttons on `/login`.
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
| Creator LinkedIn/Google OAuth | Removed — email signup only |
| Creator LinkedIn scrape | Mock profile from pasted URL |
| Creator withdraw / Stripe / bank | Empty-state panel (no dead Connect buttons) |
| Creator affiliate payouts | Static mock UI |
| Brand write-a-brief campaign create | Real — can publish to Opportunities |
| Brand publish/unpublish campaign | Real on campaign detail |
| Brand accept/decline applications | Real on Collaborations |
| Creator accept/decline bookings | Real on Collaborations (decline refunds wallet) |

## Assumptions

- After **Book** / **Add and continue**: confirmation notice, then **Collaborations**. Not confirmed on the live site.
- **Onboarding step 3** was not captured on live Naano. This rebuild shows a short “marketplace is ready” screen, then Overview.
- Booking is **wallet-funded**. Insufficient funds block the booking; the wallet cannot go negative. Creator decline refunds the brand wallet.
- **Direct Book** books at the listed price and does **not** attach a campaign brief. **Negotiate** can attach a campaign via the Campaign dropdown. Messages campaign filter only shows threads whose booking linked that brief.
- Creator message threads open at **`invitation_sent`** (when the brand books/offers). Creator **Apply** creates an `invitation_received` collaboration and thread so both sides see it. Brand Accept / Creator Accept move the collab to `active`.
- One email may hold both a brand workspace and a creator profile; login then shows `/choose-role`.
- Auth uses email + one-time code (10-minute expiry, hashed at rest). Demo accounts use instant buttons on `/login`.
- Results reach/clicks are **mocked**; attribution rows use creators you actually booked.
- Collaborations has the core table and status tabs. Campaign filter, search, and tab counts were deferred.
- Website analysis progress is mocked (~16s), not a live crawl.
- Creator Opportunities list open (`active`) campaigns only; Relayed’s original starter brief stays `draft` for the brand demo. Fresh brand onboarding creates an **active** starter brief.
