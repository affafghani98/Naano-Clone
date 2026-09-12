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

## Assumptions

- After Book / Add and continue: confirmation toast, then Collaborations. Not confirmed on the live site.
- Onboarding step 3 goes to the brand Overview.
- AI website analysis, payments, and Pixel Naano are mocked.
- Integrations / MCP are out of scope.
