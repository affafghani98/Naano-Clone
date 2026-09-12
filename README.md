# naano-clone

Brand and creator sides of [naano.com](https://www.naano.com), rebuilt from observed usage.

## Setup

Seed data lives in `prisma/seed.ts` only. It is not hardcoded in pages.

```bash
cp .env.example .env
# Fill DATABASE_URL + DIRECT_URL with Neon pooled + direct URLs
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000

| Command | What it does |
| --- | --- |
| `npm run db:seed` | Wipes tables and reloads the demo fixture |
| `npm run db:reset` | Runs migrations from scratch, then seeds |

Re-run seed or reset before recording a walkthrough so wallet, collaborations, and messages start clean.

**Brand demo (after seed):** On `/login`, click **Brand demo** (instant) or sign in as `demo@naano.clone` / `demo1234` → `/brand`  
Workspace **Relayed**, empty wallet, 12 creators, starter draft brief, NaanoBot, 0 collaborations. Extra **active** campaigns exist for creator Opportunities.

**Creator demo (after seed):** On `/login`, click **Creator demo** or `creator@naano.clone` / `demo1234` → `/creator`  
Maya Chen profile, open opportunities, NaanoBot.

**New brand signup:** `/signup` → `/register?role=saas` → email + password → `/onboarding-brand` → `/brand`  
Starter brief is published as **active**. Seeded Relayed still keeps its original draft brief plus separate active campaigns.

**New creator signup:** `/signup` → `/register?role=influencer` → email + password → `/onboarding` → `/creator`

**One email, one role:** Brand and creator accounts must use different emails. Signing up as the other role with an existing email is rejected.

## Database (Postgres / Neon)

Connection is always via `DATABASE_URL` + `DIRECT_URL` in `.env` (see `.env.example`). The Prisma schema and app code are provider-agnostic for app queries:

- No raw SQL (`$queryRaw` / `$executeRaw`)
- No provider-specific `@db.*` column types
- Lists/JSON stored as `String` and parsed in app code
- Booleans, `DateTime`, and `cuid()` ids only

**Provider:** `postgresql` in `prisma/schema.prisma`.

**Neon URL roles:**

| Env var | Use | Neon string |
| --- | --- | --- |
| `DATABASE_URL` | App / Prisma Client (runtime) | **Pooled** (`…-pooler…`). Add `sslmode=require&pgbouncer=true&connect_timeout=15` |
| `DIRECT_URL` | `prisma migrate` | **Direct** (no `-pooler`). Add `sslmode=require` |

**Vercel env:** set `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, plus `GROQ_API_KEY` as needed. Then apply schema and seed against Neon (from your machine, with those URLs in `.env` or exported):

```bash
npx prisma migrate deploy
npm run db:seed
```

`migrate deploy` applies `prisma/migrations/` (Postgres baseline). Seed wipes demo tables and reloads Relayed + Maya fixtures.

Do **not** run the old SQLite `file:./dev.db` URL against this schema — local dev should use Neon (or another Postgres) with the same `DATABASE_URL` / `DIRECT_URL` pair.

## Scope

- **Brand + creator sides.** Creator signup, onboarding, and dashboard are included; payments and OAuth stay mocked.
- **Auth:** email + password (bcrypt hashes in the DB). No OAuth, no email OTP. Seeded demos also have instant login buttons on `/login`.
- **Payments:** fake wallet top ups and booking/application debits on the brand side. Creator earnings credit on accept; withdraw is a demo ledger move (no bank).
- **AI:** Page chat + brand/creator onboarding drafts use Groq. Campaign “Create with AI” and “Copy for my AI” stay stubbed/copy-only. Without `GROQ_API_KEY`, onboarding falls back to labeled generic profiles.
- **Pixel Naano:** install CTA only. No real tracking script.
- **Integrations / MCP:** Settings UI is present; MCP server and pixel install are not real backends.

## Cut / stub inventory

| Item | Status |
| --- | --- |
| Campaign “Create with AI” | Real: Groq drafts a brief, then opens campaign detail |
| Campaign “Start from your link” | Demo only (disabled) |
| Campaign “Launch free with the Naano team” | Demo only (Cal.com link) |
| Pixel Naano “Install the pixel” | Demo only (disabled) |
| Page chat | Real via Groq |
| Notifications bell | Real in-app events (apply, accept, book, message) |
| Integrations MCP server | UI only, labeled demo only |
| Pixel Naano install | Demo only |
| Creator withdraw | Demo wallet withdraw (no bank) |
| Creator earnings | Real from accepted collabs / bookings |
| Collaborations search / campaign filter / tab counts | Real |
| Creator “Copy for my AI” | Real clipboard prompt from campaign fields |

## Assumptions

- After **Book** / **Add and continue**: confirmation notice, then **Collaborations**. Not confirmed on the live site.
- **Onboarding step 3** was not captured on live Naano. This rebuild shows a short “marketplace is ready” screen, then Overview.
- Booking is **wallet-funded**. Insufficient funds block the booking; the wallet cannot go negative. Creator decline refunds the brand wallet.
- **Direct Book** books at the listed price and does **not** attach a campaign brief. **Negotiate** can attach a campaign via the Campaign dropdown. Messages campaign filter only shows threads whose booking linked that brief.
- Creator message threads open at **`invitation_sent`** (when the brand books/offers). Creator **Apply** creates an `invitation_received` collaboration and thread so both sides see it. Brand Accept / Creator Accept move the collab to `active`.
- One email is either brand or creator (not both). Demo accounts use separate emails.
- Auth uses email + password (bcrypt). Demo accounts also use instant buttons on `/login`.
- Results reach/clicks are **mocked**; attribution rows use creators you actually booked.
- Collaborations has the core table and status tabs. Campaign filter, search, and tab counts were deferred.
- Website analysis progress is mocked (~16s), not a live crawl.
- Creator Opportunities list open (`active`) campaigns only; Relayed’s original starter brief stays `draft` for the brand demo. Fresh brand onboarding creates an **active** starter brief.
