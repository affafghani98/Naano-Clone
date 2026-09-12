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

**Vercel env:** set `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, plus Resend/Groq keys as needed. Then apply schema and seed against Neon (from your machine, with those URLs in `.env` or exported):

```bash
npx prisma migrate deploy
npm run db:seed
```

`migrate deploy` applies `prisma/migrations/` (Postgres baseline). Seed wipes demo tables and reloads Relayed + Maya fixtures.

Do **not** run the old SQLite `file:./dev.db` URL against this schema — local dev should use Neon (or another Postgres) with the same `DATABASE_URL` / `DIRECT_URL` pair.

## Scope

- **Brand + creator sides.** Creator signup, onboarding, and dashboard are included; payments and OAuth stay mocked.
- **Auth:** email + one-time 6-digit code via Resend (no passwords, no OAuth). Without `RESEND_API_KEY`, codes are printed in the server terminal. Seeded demos use instant login buttons on `/login`.
- **Payments:** fake wallet top-ups and booking debits on the brand side. Creator withdraw / Stripe / bank connect are UI stubs.
- **AI:** Page chat + brand/creator onboarding drafts use Groq. Campaign “Create with AI” and “Copy for my AI” stay stubbed/copy-only. Without `GROQ_API_KEY`, onboarding falls back to labeled generic profiles.
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
- One email is either brand or creator (not both). Demo accounts use separate emails.
- Auth uses email + one-time code (10-minute expiry, hashed at rest). Demo accounts use instant buttons on `/login`.
- Results reach/clicks are **mocked**; attribution rows use creators you actually booked.
- Collaborations has the core table and status tabs. Campaign filter, search, and tab counts were deferred.
- Website analysis progress is mocked (~16s), not a live crawl.
- Creator Opportunities list open (`active`) campaigns only; Relayed’s original starter brief stays `draft` for the brand demo. Fresh brand onboarding creates an **active** starter brief.
