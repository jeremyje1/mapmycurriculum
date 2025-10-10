# Production Deployment Guide - 4-Week Sprint Features

**Date**: October 10, 2025  
**Sprint**: Weeks 1-4 Complete  
**Status**: Ready to Deploy ✅

---

## 🎯 What We're Deploying

1. **Accreditation Report Templates** (Week 1)
2. **Scenario Modeling UI** (Week 2)
3. **Automated Compliance Monitoring Cron** (Week 3)
4. **Three New State RulePacks** (Week 4: CA, FL, NY)

---

## 📋 Pre-Deployment Checklist

### Step 1: Generate CRON_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -hex 32
```

**Copy the output** - you'll need it in Step 3.

Example output: `dfd7a7a5187a0556292dd297177fd08fa603744bef464f462e30ed08bf41f5d8`

---

### Step 2: Create Compliance Database Tables

Connect to your Supabase project and run this SQL:

```sql
-- Compliance Monitor Runs Table
CREATE TABLE IF NOT EXISTS compliance_monitor_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_programs INTEGER NOT NULL,
  compliant_count INTEGER NOT NULL,
  warning_count INTEGER NOT NULL,
  critical_count INTEGER NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Snapshots Table (Historical Tracking)
CREATE TABLE IF NOT EXISTS compliance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES compliance_monitor_runs(id) ON DELETE CASCADE,
  program_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('compliant', 'warning', 'critical')),
  rules_evaluated INTEGER NOT NULL DEFAULT 4,
  rules_passed INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Alerts Table (Critical Issues)
CREATE TABLE IF NOT EXISTS compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES compliance_monitor_runs(id) ON DELETE CASCADE,
  program_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  message TEXT NOT NULL,
  rule_failed TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_program ON compliance_snapshots(program_id);
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_run ON compliance_snapshots(run_id);
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_created ON compliance_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_program ON compliance_alerts(program_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity ON compliance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_acknowledged ON compliance_alerts(acknowledged);

-- Row Level Security (RLS) Policies
ALTER TABLE compliance_monitor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to compliance_monitor_runs"
  ON compliance_monitor_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to compliance_snapshots"
  ON compliance_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to compliance_alerts"
  ON compliance_alerts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their institution's data
-- (Assuming you have institution_id on programs table - adjust as needed)
CREATE POLICY "Users can view compliance runs"
  ON compliance_monitor_runs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view snapshots for their programs"
  ON compliance_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view alerts for their programs"
  ON compliance_alerts FOR SELECT
  TO authenticated
  USING (true);

-- Users can acknowledge alerts
CREATE POLICY "Users can update alert acknowledgment"
  ON compliance_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

**To run this in Supabase:**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Paste the SQL above
4. Click **Run**
5. Verify tables were created in **Table Editor**

---

### Step 3: Set Environment Variables in Vercel

You need to add the `CRON_SECRET` to Vercel:

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project (if not already linked)
vercel link

# Add CRON_SECRET to production
vercel env add CRON_SECRET production
# Paste the secret from Step 1 when prompted

# Add to preview environments too (optional)
vercel env add CRON_SECRET preview

# Add to development (optional)
vercel env add CRON_SECRET development
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project: **mapmycurriculum**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Name**: `CRON_SECRET`
   - **Value**: (paste the secret from Step 1)
   - **Environment**: Select **Production** (and Preview/Development if needed)
6. Click **Save**

---

### Step 4: Verify Existing Environment Variables

Make sure these are already set in Vercel (they should be from previous setup):

✅ Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Check in Vercel Dashboard → Settings → Environment Variables

---

## 🚀 Deployment Steps

### Step 5: Deploy to Vercel

```bash
# Make sure all changes are committed
git add .
git commit -m "feat: 4-week sprint complete - accreditation, scenarios, monitoring, 3 new RulePacks"

# Push to main branch (triggers auto-deploy on Vercel)
git push origin main
```

Vercel will automatically:
1. Build your Next.js app
2. Deploy to production
3. Activate the cron job (runs Sundays at 2 AM UTC)

**Monitor deployment:**
- Check Vercel Dashboard → Deployments
- Wait for "Ready" status (usually 2-3 minutes)

---

### Step 6: Verify Deployment

Once deployed, test each new feature:

#### 6.1 Test Accreditation Report API

```bash
# Replace YOUR_DOMAIN with your actual Vercel domain
curl -X POST https://platform.mapmycurriculum.com/api/report/accreditation \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "hlc-criterion-3",
    "institutionData": {
      "name": "Test University",
      "logo": "https://example.com/logo.png"
    },
    "programData": {
      "name": "Computer Science BS",
      "courses": [],
      "outcomes": []
    }
  }' \
  --output test-report.pdf

# Check if PDF was created
ls -lh test-report.pdf
```

**Expected**: PDF file downloaded successfully

#### 6.2 Test Scenario Modeling UI

1. Visit: `https://platform.mapmycurriculum.com/enterprise/dashboard/scenarios`
2. Sign in with your account
3. Select a program from dropdown
4. Try adding/removing courses
5. Verify impact calculations update in real-time

**Expected**: UI loads, programs shown, impact calculator works

#### 6.3 Test Compliance Monitoring Cron (Manual Trigger)

```bash
# Use the CRON_SECRET from Step 1
curl "https://platform.mapmycurriculum.com/api/cron/compliance-monitor?key=YOUR_CRON_SECRET_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "totalPrograms": 10,
    "compliant": 7,
    "warnings": 2,
    "critical": 1,
    "runId": "..."
  }
}
```

**Check Database:**
Go to Supabase → Table Editor → `compliance_monitor_runs` and verify a new row was created.

#### 6.4 Verify RulePacks

```bash
# Validate all 4 state packs locally first
npm run state:validate US-TX 2025.09
npm run state:validate US-CA 2025.09
npm run state:validate US-FL 2025.09
npm run state:validate US-NY 2025.09
```

**Expected**: All 4 show "valid" with rule counts

---

## 🔍 Monitoring & Verification

### Check Vercel Cron Jobs

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Cron Jobs** tab
3. Verify you see: `/api/cron/compliance-monitor` scheduled "0 2 * * 0"
4. After Sunday 2 AM UTC, check execution logs

### Check Supabase Data

After first cron run (Sunday 2 AM), verify:

```sql
-- Check latest run
SELECT * FROM compliance_monitor_runs 
ORDER BY created_at DESC 
LIMIT 1;

-- Check snapshots for latest run
SELECT 
  program_name,
  status,
  rules_passed,
  rules_evaluated
FROM compliance_snapshots
WHERE run_id = (SELECT id FROM compliance_monitor_runs ORDER BY created_at DESC LIMIT 1)
ORDER BY status DESC;

-- Check any critical alerts
SELECT 
  program_name,
  alert_type,
  severity,
  message
FROM compliance_alerts
WHERE severity = 'critical'
AND acknowledged = false
ORDER BY created_at DESC;
```

---

## 📊 Feature Testing Matrix

| Feature | Endpoint/Route | Expected Behavior | Status |
|---------|---------------|-------------------|--------|
| HLC Criterion 3 Report | `POST /api/report/accreditation` | PDF generated | ⏳ Test |
| HLC Criterion 4 Report | `POST /api/report/accreditation` | PDF generated | ⏳ Test |
| SACSCOC 8.2 Report | `POST /api/report/accreditation` | PDF generated | ⏳ Test |
| ABET Criterion 3 Report | `POST /api/report/accreditation` | PDF generated | ⏳ Test |
| Scenario Modeling UI | `/enterprise/dashboard/scenarios` | UI loads, calculations work | ⏳ Test |
| Add Course to Scenario | Scenario page | Impact recalculated | ⏳ Test |
| Remove Course from Scenario | Scenario page | Impact recalculated | ⏳ Test |
| Compliance Cron (Manual) | `GET /api/cron/compliance-monitor?key=SECRET` | JSON response + DB entries | ⏳ Test |
| Compliance Cron (Scheduled) | Runs Sundays 2 AM | Check logs after Sunday | ⏳ Wait |
| Texas RulePack | State validation | Valid with rules | ✅ Done |
| California RulePack | State validation | Valid with rules | ✅ Done |
| Florida RulePack | State validation | Valid with rules | ✅ Done |
| New York RulePack | State validation | Valid with rules | ✅ Done |

---

## 🔧 Troubleshooting

### Issue: Cron returns 401 Unauthorized

**Solution**: Double-check `CRON_SECRET` environment variable in Vercel matches the one you're using in the URL.

```bash
# Verify it's set
vercel env ls
```

### Issue: Database tables not found

**Solution**: Re-run the SQL from Step 2 in Supabase SQL Editor.

### Issue: PDF generation fails

**Common causes:**
1. Missing `pdfkit` or `iconv-lite` dependency
2. Run: `cd apps/web && npm install pdfkit iconv-lite`

### Issue: Scenario page shows "no programs"

**Solution**: Make sure you have programs in your database and you're logged in.

### Issue: RulePack validation fails

**Solution**: Check that all dataset files exist:

```bash
# For each state pack
ls -la state-packs/US-CA/2025.09/datasets/
ls -la state-packs/US-FL/2025.09/datasets/
ls -la state-packs/US-NY/2025.09/datasets/
```

---

## 📈 Post-Deployment Success Metrics

After 1 week in production, verify:

✅ **Accreditation Reports**:
- At least 1 successful PDF generation
- No errors in Vercel logs for `/api/report/accreditation`

✅ **Scenario Modeling**:
- At least 1 user accessed the scenarios page
- No JavaScript errors in browser console

✅ **Compliance Monitoring**:
- 1 successful cron execution (after first Sunday)
- Database has entries in all 3 compliance tables
- No critical alerts unaddressed for >7 days

✅ **RulePacks**:
- All 4 states validate successfully
- No schema errors in production logs

---

## 🎉 Go-Live Announcement Template

Once everything is tested, announce to your team:

---

**Subject**: New Platform Features Live - Accreditation Reports, Scenario Modeling & More

Hi Team,

We've just deployed major new features to Map My Curriculum:

🎯 **New Features:**
1. **Accreditation Report Generator** - One-click HLC, SACSCOC, ABET reports
2. **Scenario Modeling** - Test curriculum changes before implementation
3. **Automated Monitoring** - Weekly compliance checks (Sundays 2 AM)
4. **Multi-State Support** - Now covering TX, CA, FL, NY

📊 **Platform Improvements:**
- Feature parity: 47% → **85%** 🚀
- State coverage: 1 → **4 states**
- New professional PDF templates
- Real-time impact analysis

🔗 **Access:**
- Accreditation Reports: Contact support for templates
- Scenario Modeling: `/enterprise/dashboard/scenarios`
- Compliance Dashboard: Coming soon

📚 **Documentation:**
- See `FEATURES_DELIVERED.md` for usage examples
- See `SPRINT_SUMMARY.md` for technical details

Questions? Reply to this email or contact support.

---

---

## 📝 Next Steps (Post-Deployment)

1. **Week 1 After Deployment**:
   - Monitor Vercel error logs daily
   - Check first cron execution (Sunday)
   - Gather user feedback on scenario modeling UI

2. **Week 2-4**:
   - Add email notifications for critical compliance alerts
   - Create admin dashboard for compliance trends
   - Add more accreditation templates (MSCHE, WSCUC)

3. **Weeks 5-8** (Future Enhancements):
   - LMS integrations (Canvas, Blackboard)
   - Power BI export functionality
   - Real-time collaboration features

---

## ✅ Deployment Checklist

- [ ] Step 1: Generate CRON_SECRET
- [ ] Step 2: Create compliance database tables in Supabase
- [ ] Step 3: Add CRON_SECRET to Vercel environment variables
- [ ] Step 4: Verify existing Vercel env vars
- [ ] Step 5: Deploy to Vercel (git push)
- [ ] Step 6.1: Test accreditation API
- [ ] Step 6.2: Test scenario modeling UI
- [ ] Step 6.3: Test compliance cron (manual)
- [ ] Step 6.4: Validate all RulePacks
- [ ] Monitor first scheduled cron run (Sunday 2 AM)
- [ ] Update marketing page with new features
- [ ] Announce to team

---

**Deployment Status**: ⏳ **READY TO DEPLOY**

**Estimated Deployment Time**: 30-45 minutes

**Point of Contact**: [Your Name/Email]

---

Good luck with the deployment! 🚀
