## 🎉 Go‑Live Checklist - UPDATED FOR PRODUCTION

**Production URL**: https://platform.mapmycurriculum.com  
**Status**: ✅ 2/3 Steps Complete  
**Last Updated**: October 10, 2025

---

## ✅ Completed Steps

### 1. ✅ Domain Configuration
- **Custom Domain**: platform.mapmycurriculum.com
- **DNS**: CNAME configured and propagated
- **SSL**: Active (HTTPS working)
- **Status**: LIVE ✅

### 2. ✅ Stripe Webhook 
- **Endpoint**: https://platform.mapmycurriculum.com/api/stripe/webhook
- **Webhook ID**: we_1SGm3QCzPgWh4DF8EkrsPWDP
- **Secret**: whsec_dlgXiaEY3kpI4CGYDQyW5j5El9TLZAD2
- **Events**: checkout.session.completed, customer.subscription.*, invoice.*
- **Vercel Env**: Updated and deployed ✅

### 3. 🔄 Supabase Auth Configuration (IN PROGRESS)
**Dashboard opened at**: https://supabase.com/dashboard/project/dsxiiakytpufxsqlimkf/auth/url-configuration

**Required Configuration**:
- [ ] Site URL: `https://platform.mapmycurriculum.com`
- [ ] Add redirect URLs:
  - `https://platform.mapmycurriculum.com/**`
  - `https://platform.mapmycurriculum.com/auth/callback`
  - `https://platform.mapmycurriculum.com/auth/confirm`
- [ ] Keep development URLs for local testing
- [ ] Save changes

---

## 📋 Environment Variables (Vercel Production)

### ✅ Currently Configured

| Key | Value | Status |
|-----|-------|--------|
| DATABASE_URL | postgresql://... | ✅ Set |
| NEXT_PUBLIC_SUPABASE_URL | https://dsxiiakytpufxsqlimkf.supabase.co | ✅ Set |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGc... | ✅ Set |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGc... | ✅ Set |
| STRIPE_SECRET_KEY | sk_live_51RxXTa... | ✅ Set |
| STRIPE_WEBHOOK_SECRET | whsec_dlgXiaEY... | ✅ Updated |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | pk_live_... | ✅ Set |
| NEXT_PUBLIC_PRICE_ID | price_1SGk9KCzPgWh4DF8Vw8mAR5d | ✅ Set |
| NEXT_PUBLIC_APP_URL | platform.mapmycurriculum.com | ✅ Set |

Action: In Vercel run “Redeploy with existing variables” if any were added post-build.

### 2. Database Connectivity
Run `npx prisma migrate deploy` locally against the prod DATABASE_URL (or confirm Vercel build logs show successful migration). Then run a smoke query via Prisma Studio or a simple read endpoint.

### 3. Stripe Test Purchase (Live OR Test Mode)
1. (Test Mode) Switch Stripe to test; temporarily set TEST keys in a preview environment *not* production OR use Live keys for real flow.
2. From marketing site, click “Get Started” → `/signup`.
3. Select a self‑serve plan (e.g., School Starter) and submit form with a test card (4242 4242 4242 4242 if test mode).
4. Complete checkout → should redirect to `.../signup/success?session_id=...` (current implementation). Confirm webhook logs show `checkout.session.completed` and user/institution created.
5. (If future enhancement) If tier start page is `/assessment/start?tier=<plan>`, verify redirect points there. Current code: success page only—documented for follow‑up.

### 4. Stripe Webhook
In Stripe Dashboard → Developers → Webhooks: endpoint URL must be `https://app.northpathstrategies.org/api/stripe/webhook`. Events: `checkout.session.completed`, `customer.subscription.updated`. Confirm recent deliveries succeeded (200) and logs contain `[stripe] subscription.updated` for plan changes.

### 5. Onboarding Templates Download
1. Navigate to `/assessment/onboarding`.
2. Scroll to “Data Import Templates”.
3. Verify each download works (HTTP 200, file content / headers):
   - /templates/org_units.csv
   - /templates/positions.csv
   - /templates/people.csv
   - /templates/systems_inventory.csv

### 6. PDF Generator Smoke Test
1. Ensure dev/prod function deployed: `/api/report/generate`.
2. Run (adjust domain if needed):
```bash
curl -X POST https://app.northpathstrategies.org/api/report/generate \
  -H "Content-Type: application/json" \
  -d '{"answers":{"organizationalStructure":"Traditional hierarchy","teamCollaboration":7,"digitizationLevel":6},"scores":{"organizationalHealth":7.2,"efficiencyScore":6.8,"aiReadinessScore":5.5,"overallScore":6.5,"riskLevel":"Medium"},"options":{"includeRecommendations":true,"includeCharts":true,"templateStyle":"executive","organizationName":"Sample Org","reportTitle":"Assessment Report"}}' \
  --output assessment-smoke.pdf
```
3. Open `assessment-smoke.pdf` → verify pages: summary, answers, recommendations, charts placeholder, footer.

### 7. Enterprise Power BI Panel (If Enabled)
Reference `PowerBI-Embed-Prod.md`:
1. Confirm service principal workspace access.
2. Validate all Power BI env vars set.
3. Hit planned embed token endpoint (to be implemented) or placeholder if not yet coded.
4. Visit `/enterprise/dashboard` authenticated user (mock via localStorage for now) and ensure no SSR error; panel loads or placeholder message appears.

### 8. Access Control & Feature Flags
1. Enterprise dashboard: unauthenticated view shows CTA (no redirect). Authenticated mock displays metrics cards.
2. Verify self‑serve plans limited to those with `checkout: true` in `plans.ts`.

### 9. Logging & Error Monitoring
1. Check Vercel logs after test purchase & PDF generation for errors.
2. Ensure no unhandled promise rejections.

### 10. Final Security Sweep
1. `.env` local file NOT committed (verify git status clean).
2. Stripe & OpenAI keys only in Vercel secure config.
3. Power BI client secret stored as encrypted secret.

### Sign‑Off
- [ ] Env vars complete
- [ ] Stripe checkout + webhook ok
- [ ] Templates downloadable
- [ ] PDF generator outputs valid file
- [ ] (Optional) Power BI embedding verified / deferred note
- [ ] No critical errors in logs

---
Post‑Go‑Live Follow‑Ups:
1. Implement real auth & plan gating middleware.
2. Add embed token endpoint for Power BI.
3. Redirect success to tier start page once built.
4. Harden PDF generator (streaming, auth, caching).
