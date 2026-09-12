# naano-clone

Brand/business side of [naano.com](https://www.naano.com), rebuilt from observed usage.

## Reset demo state

Seed data lives in `prisma/seed.ts` only. It is not hardcoded in pages.

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
```

To wipe the database and reload the demo account, creators, and starter brief:

```bash
npm run db:reset
```

`db:reset` runs migrations from scratch and then `prisma/seed.ts`. `npm run db:seed` alone also wipes tables and reloads the same fixture. Re-run either command before recording a walkthrough.

Demo login (after seed): `demo@naano.clone` / `demo1234`

```bash
npm run dev
```

Open http://localhost:3000 — marketing landing (logged out). Log in with the demo account to skip onboarding and land on `/brand`. New brand signup goes `/signup` → `/register?role=saas` → `/onboarding-brand`.

Website analysis is mocked (~16s progress, no live crawl).

## Assumptions

- After Book / Add and continue: confirmation toast, then Collaborations. Not confirmed on the live site.
- Onboarding step 3 was not captured on the live site. This rebuild shows a short “marketplace is ready” screen, then Overview.
- AI website analysis, payments, and Pixel Naano are mocked.
- Integrations / MCP are out of scope.
