# naano-clone

Brand/business side of [naano.com](https://www.naano.com), rebuilt from observed usage 

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

**Demo login (after seed):** `demo@naano.clone` / `demo1234`  
Skips onboarding and lands on `/brand` (workspace **Relayed**, empty wallet, 12 creators, starter brief, NaanoBot thread, 0 collaborations).

**New brand signup:** `/signup` → `/register?role=saas` → `/onboarding-brand` → `/brand`

## Scope

- **Brand side only.** Creator signup and creator dashboard are not built.
- **Auth:** email/password only. No real LinkedIn/Google OAuth.
- **Payments:** fake wallet top-ups and booking debits. No payment processor.
- **AI:** onboarding website analysis and campaign “Create with AI” are mocked or stubbed. No model calls.
- **Pixel Naano:** install CTA only. No real tracking script.
- **Integrations / MCP:** out of scope. Not built.

## Cut / stub inventory

| Item | Status |
| --- | --- |
| Campaign “Create with AI” | Stub page (does not generate a brief) |
| Campaign “Start from your link” | Stub page (URL field disabled) |
| Campaign “Launch free with the Naano team” | Link-out to Cal.com stub |
| Pixel Naano “Install the pixel” | Disabled button |
| Persistent chat (“What would you like to see?”) | Stub — does not call a model |
| Settings | Placeholder page |
| Book a call / setup call | Opens `https://cal.com`, not the live Naano scheduler URL |
| Integrations | Menu item labeled out of scope |
| EN/FR language toggle | Not built (English only) |
| Multi-brand workspace switcher | Workspace name is a label only |
| Notifications bell | Empty stub menu |

## Assumptions

- After **Book** / **Add and continue**: confirmation notice, then **Collaborations**. Not confirmed on the live site.
- **Onboarding step 3** was not captured on live Naano. This rebuild shows a short “marketplace is ready” screen, then Overview.
- Booking is **wallet-funded**. Insufficient funds block the booking; the wallet cannot go negative.
- **Direct Book** books at the listed price and does **not** attach a campaign brief. **Negotiate** can attach a campaign via the Campaign dropdown. Messages campaign filter only shows threads whose booking linked that brief.
- Creator message threads open at **`invitation_sent`** (when the brand books/offers). Live Naano’s copy says the thread opens when the creator accepts; this rebuild has no creator accept flow, so threads open on send so the demo loop is visible.
- Results reach/clicks are **mocked**; attribution rows use creators you actually booked.
- Collaborations has the core table and status tabs. Campaign filter, search, and tab counts were deferred.
- Website analysis progress is mocked (~16s), not a live crawl.
