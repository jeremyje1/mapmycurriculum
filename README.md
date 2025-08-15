# Curriculum Map Tool (Monorepo)

Early-stage implementation of a policy‑aware curriculum mapping & compliance engine.

## Structure
- `state-packs/` versioned regulatory RulePacks (e.g. `US-TX/2025.09`).
- `packages/state-packs` loader + Zod validation for packs.
- `packages/domain` snapshot + metrics (in progress).
- `prisma/` data model (currently using SQLite locally).
- `demo-data/` CSVs for seeding/import examples.

## Quick Start
```bash
pnpm install
export DATABASE_URL='file:./dev.db'
pnpm dlx prisma migrate dev --name init
pnpm dlx prisma db seed
pnpm test
```

## Validate a RulePack
```bash
pnpm state:validate US-TX 2025.09
```

## Planned Next Steps
1. Rule engine package (JSONLogic) + evaluations.
2. Snapshot DB integration.
3. API endpoints & workers.
4. CSV import pipeline & UI.
5. Evidence PDF generation.

## Vercel Deployment
A minimal `vercel.json` is included. Once a web app (e.g. `apps/web`) exists, Vercel will detect the framework. For now it will build with `pnpm build`.

### Deploy Flow
```bash
git init
git add .
git commit -m "chore: initial commit"
git remote add origin git@github.com:YOUR_ORG/curriculum-map-tool.git
git push -u origin main
```
Then import into Vercel and set `DATABASE_URL` (or use a managed Postgres).

## Environment Variables
See `.env.example` for required values as functionality grows.

## License
TBD.
