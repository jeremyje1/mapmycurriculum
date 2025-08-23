Deployment Guide (Single Project Canonical)
=================================================

Canonical Vercel Project
------------------------
Project Name: mapmycurriculum  
Project ID: prj_QU1rgcx0nUnqu97KLM8BB1zQukVF  
Org ID: team_QA8FWwyv4aS6uI6vpiVfRCgE

DO NOT use / link to the legacy/accidental project: mapmycurriculum-web (it has no env vars and causes failing pnpm workspace builds).

Why Builds Were Failing
-----------------------
1. Repo contains a `pnpm-lock.yaml`, so when linked to the wrong project (no custom install/build commands) Vercel auto-selected `pnpm install` at the monorepo root.
2. That triggered workspace resolution (packages, Cypress, zod, etc.) and the registry fetch bug (ERR_INVALID_THIS) repeatedly; deploy timed out.
3. Correct project specifies custom commands in `vercel.json`:
   - `installCommand`: `npm --prefix apps/web install`
   - `buildCommand`: `npm --prefix apps/web run build`
   This scopes installation to the web app only, bypassing pnpm + extraneous workspace deps.

Current Setup Summary
---------------------
`vercel.json` (root) pins the build to `apps/web` and avoids pnpm entirely.  
`apps/web/vercel.json` is minimal (framework autodetect).

Environment Variables (Production)
----------------------------------
Set only on the canonical project (mapmycurriculum):
```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY (prod + preview)
STRIPE_WEBHOOK_SECRET (prod)
STRIPE_WEBHOOK_SIGNING_SECRET (all env)
NEXT_PUBLIC_PRICE_* (pricing IDs)
DATABASE_URL
```

Duplicate Project Cleanup
-------------------------
If you have confirmed nothing points to `mapmycurriculum-web`, delete it:
1. Via Dashboard: Settings → Danger Zone → Delete Project.
2. Or CLI (irreversible):
   ```bash
   vercel project rm mapmycurriculum-web
   ```
   (Run only after verifying you are linked to the correct project: `cat .vercel/project.json`).

Relinking Safely
----------------
If the repo ever becomes linked to the wrong project again:
```bash
vercel link --project mapmycurriculum --yes
cat .vercel/project.json   # verify projectId = prj_QU1rgcx0nUnqu97KLM8BB1zQukVF
```

Force a Clean Production Deploy
-------------------------------
```bash
vercel deploy --prod --force
```
Expected log lines should show the custom `installCommand` (`npm --prefix apps/web install`) — NOT `pnpm install`.

If You Intend to Use pnpm Later
-------------------------------
1. Remove / simplify custom commands in `vercel.json`.
2. Ensure all workspace packages needed by `apps/web` are published or marked as external.
3. Confirm registry reliability (the earlier ERR_INVALID_THIS appeared transient / environment‑specific).

Quick Verification Checklist
----------------------------
[ ] `cat .vercel/project.json` shows canonical projectId.  
[ ] `vercel env ls` lists pricing + Stripe vars (not empty).  
[ ] Deployment logs show `npm --prefix apps/web install`.  
[ ] Domain `mapmycurriculum.com` assigned only to canonical project.  
[ ] `mapmycurriculum-web` deleted (or clearly labeled DO NOT USE) in dashboard.

Troubleshooting
---------------
Symptom: Build log starts with `pnpm install` and ERR_INVALID_THIS loops → Wrong project link. Relink + redeploy.  
Symptom: Missing pricing env vars at runtime → You deployed the empty project or forgot to promote env vars to Production scope.  
Symptom: Prisma client mismatch errors → Ensure `postinstall` runs only inside `apps/web` (current config already does this).

Revision History
----------------
2025-08-23: Document created after identifying duplicate project confusion causing failed builds.
