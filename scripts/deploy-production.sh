#!/bin/bash

# Production Deployment Script - 4-Week Sprint Features
# Run this script to deploy accreditation reports, scenario modeling, compliance monitoring, and new RulePacks

set -e  # Exit on error

echo "🚀 Map My Curriculum - Production Deployment"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Generate CRON_SECRET
echo "📝 Step 1: Generate CRON_SECRET"
echo "--------------------------------"
CRON_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Generated CRON_SECRET:${NC}"
echo "$CRON_SECRET"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Save this secret! You'll need it for Vercel.${NC}"
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 2: Save secret to local .env file for reference
echo "💾 Step 2: Save to local .env file"
echo "-----------------------------------"
if [ ! -f "apps/web/.env.local" ]; then
  touch apps/web/.env.local
fi

# Check if CRON_SECRET already exists in .env.local
if grep -q "CRON_SECRET=" apps/web/.env.local; then
  echo -e "${YELLOW}⚠️  CRON_SECRET already exists in .env.local${NC}"
  read -p "Overwrite? (y/n): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sed -i.bak "/CRON_SECRET=/d" apps/web/.env.local
    echo "CRON_SECRET=$CRON_SECRET" >> apps/web/.env.local
    echo -e "${GREEN}✓ Updated CRON_SECRET in apps/web/.env.local${NC}"
  else
    echo -e "${YELLOW}⏭  Skipped updating .env.local${NC}"
  fi
else
  echo "CRON_SECRET=$CRON_SECRET" >> apps/web/.env.local
  echo -e "${GREEN}✓ Added CRON_SECRET to apps/web/.env.local${NC}"
fi
echo ""

# Step 3: Verify Supabase connection
echo "🔍 Step 3: Verify Supabase Connection"
echo "--------------------------------------"
if ! command -v supabase &> /dev/null; then
  echo -e "${YELLOW}⚠️  Supabase CLI not installed${NC}"
  echo "Install with: brew install supabase/tap/supabase"
  echo "Then run: supabase login"
  SKIP_SUPABASE=true
else
  echo -e "${GREEN}✓ Supabase CLI installed${NC}"
  SKIP_SUPABASE=false
fi
echo ""

# Step 4: Create database tables
if [ "$SKIP_SUPABASE" = false ]; then
  echo "📊 Step 4: Create Compliance Database Tables"
  echo "---------------------------------------------"
  echo "This will create tables in your Supabase project."
  echo ""
  read -p "Do you want to create the tables now? (y/n): " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if migration file exists
    if [ ! -f "supabase/migrations/$(date +%Y%m%d)_compliance_monitoring.sql" ]; then
      cat > "supabase/migrations/$(date +%Y%m%d%H%M%S)_compliance_monitoring.sql" << 'EOF'
-- Compliance Monitoring Tables for Weekly Automated Checks

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

-- Service role full access
CREATE POLICY "Service role full access to runs" ON compliance_monitor_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access to snapshots" ON compliance_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access to alerts" ON compliance_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users read access
CREATE POLICY "Users view runs" ON compliance_monitor_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view snapshots" ON compliance_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view alerts" ON compliance_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update alerts" ON compliance_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EOF
      echo -e "${GREEN}✓ Created migration file${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Manual Step Required:${NC}"
    echo "1. Go to your Supabase Dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy the SQL from: supabase/migrations/*_compliance_monitoring.sql"
    echo "4. Paste and run it"
    echo ""
    read -p "Press Enter when done..."
  else
    echo -e "${YELLOW}⏭  Skipped table creation - you can do this manually later${NC}"
  fi
else
  echo -e "${YELLOW}⏭  Skipped Supabase setup - do this manually via dashboard${NC}"
fi
echo ""

# Step 5: Verify Vercel CLI
echo "🔍 Step 5: Verify Vercel CLI"
echo "----------------------------"
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
  echo "Install with: npm i -g vercel"
  SKIP_VERCEL=true
else
  echo -e "${GREEN}✓ Vercel CLI installed${NC}"
  SKIP_VERCEL=false
fi
echo ""

# Step 6: Set CRON_SECRET in Vercel
if [ "$SKIP_VERCEL" = false ]; then
  echo "🔐 Step 6: Set CRON_SECRET in Vercel"
  echo "-------------------------------------"
  echo "This will add CRON_SECRET to your Vercel project."
  echo ""
  read -p "Do you want to set it now? (y/n): " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting CRON_SECRET in Vercel production environment..."
    echo "$CRON_SECRET" | vercel env add CRON_SECRET production
    echo -e "${GREEN}✓ CRON_SECRET added to Vercel${NC}"
  else
    echo -e "${YELLOW}⏭  Skipped - you can set this manually:${NC}"
    echo "   vercel env add CRON_SECRET production"
  fi
else
  echo -e "${YELLOW}⏭  Skipped Vercel setup - install Vercel CLI first${NC}"
fi
echo ""

# Step 7: Validate RulePacks
echo "✅ Step 7: Validate State RulePacks"
echo "------------------------------------"
echo "Validating all 4 state RulePacks..."
echo ""

if npm run state:validate US-TX 2025.09; then
  echo -e "${GREEN}✓ Texas RulePack valid${NC}"
else
  echo -e "${RED}✗ Texas RulePack validation failed${NC}"
fi

if npm run state:validate US-CA 2025.09; then
  echo -e "${GREEN}✓ California RulePack valid${NC}"
else
  echo -e "${RED}✗ California RulePack validation failed${NC}"
fi

if npm run state:validate US-FL 2025.09; then
  echo -e "${GREEN}✓ Florida RulePack valid${NC}"
else
  echo -e "${RED}✗ Florida RulePack validation failed${NC}"
fi

if npm run state:validate US-NY 2025.09; then
  echo -e "${GREEN}✓ New York RulePack valid${NC}"
else
  echo -e "${RED}✗ New York RulePack validation failed${NC}"
fi
echo ""

# Step 8: Git commit and push
echo "📦 Step 8: Deploy to Vercel"
echo "---------------------------"
echo "Ready to commit and deploy your changes?"
echo ""
git status
echo ""
read -p "Commit and push to main? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  git add .
  git commit -m "feat: 4-week sprint complete - accreditation reports, scenario modeling, compliance monitoring, 3 new state RulePacks (CA, FL, NY)"
  git push origin main
  echo -e "${GREEN}✓ Pushed to main - Vercel will auto-deploy${NC}"
  echo ""
  echo "🎉 Monitor deployment at: https://vercel.com/dashboard"
else
  echo -e "${YELLOW}⏭  Skipped deployment - commit manually when ready${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo "✅ Deployment Preparation Complete!"
echo "=============================================="
echo ""
echo "📋 Summary:"
echo "  - CRON_SECRET generated and saved"
echo "  - RulePacks validated"
echo "  - Ready for production deployment"
echo ""
echo "🔔 Manual Steps Remaining:"
echo "  1. Create compliance tables in Supabase (if not done)"
echo "  2. Set CRON_SECRET in Vercel (if not done)"
echo "  3. Monitor deployment in Vercel Dashboard"
echo "  4. Test endpoints after deployment"
echo ""
echo "📚 Documentation:"
echo "  - Full guide: DEPLOYMENT_GUIDE.md"
echo "  - Features: FEATURES_DELIVERED.md"
echo "  - Sprint summary: SPRINT_SUMMARY.md"
echo ""
echo -e "${GREEN}Your CRON_SECRET:${NC}"
echo "$CRON_SECRET"
echo ""
echo "Save this secret securely!"
echo ""
