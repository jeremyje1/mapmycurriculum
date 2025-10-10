-- Compliance Monitoring Tables
-- Run this SQL in Supabase SQL Editor to create tables for automated compliance monitoring

-- ============================================
-- COMPLIANCE MONITOR RUNS TABLE
-- ============================================
-- Stores summary of each weekly compliance check run

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

COMMENT ON TABLE compliance_monitor_runs IS 'Weekly compliance monitoring run summaries';
COMMENT ON COLUMN compliance_monitor_runs.total_programs IS 'Total number of programs evaluated';
COMMENT ON COLUMN compliance_monitor_runs.compliant_count IS 'Programs passing all rules';
COMMENT ON COLUMN compliance_monitor_runs.warning_count IS 'Programs with non-critical issues';
COMMENT ON COLUMN compliance_monitor_runs.critical_count IS 'Programs with critical compliance failures';
COMMENT ON COLUMN compliance_monitor_runs.duration_ms IS 'Execution time in milliseconds';

-- ============================================
-- COMPLIANCE SNAPSHOTS TABLE
-- ============================================
-- Historical tracking of program compliance status over time

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

COMMENT ON TABLE compliance_snapshots IS 'Historical compliance snapshots for each program';
COMMENT ON COLUMN compliance_snapshots.status IS 'Overall compliance status: compliant, warning, or critical';
COMMENT ON COLUMN compliance_snapshots.rules_evaluated IS 'Number of rules checked (default: 4)';
COMMENT ON COLUMN compliance_snapshots.rules_passed IS 'Number of rules passed';
COMMENT ON COLUMN compliance_snapshots.snapshot_data IS 'Full compliance data at time of evaluation';

-- ============================================
-- COMPLIANCE ALERTS TABLE
-- ============================================
-- Critical compliance issues requiring attention

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

COMMENT ON TABLE compliance_alerts IS 'Compliance alerts for programs with issues';
COMMENT ON COLUMN compliance_alerts.alert_type IS 'Type of compliance issue detected';
COMMENT ON COLUMN compliance_alerts.severity IS 'Alert severity: warning or critical';
COMMENT ON COLUMN compliance_alerts.rule_failed IS 'Specific rule that failed';
COMMENT ON COLUMN compliance_alerts.acknowledged IS 'Whether alert has been reviewed';
COMMENT ON COLUMN compliance_alerts.acknowledged_by IS 'User ID who acknowledged the alert';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_compliance_monitor_runs_date 
  ON compliance_monitor_runs(run_date DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_program 
  ON compliance_snapshots(program_id);

CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_run 
  ON compliance_snapshots(run_id);

CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_created 
  ON compliance_snapshots(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_status 
  ON compliance_snapshots(status);

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_program 
  ON compliance_alerts(program_id);

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity 
  ON compliance_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_acknowledged 
  ON compliance_alerts(acknowledged);

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_created 
  ON compliance_alerts(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE compliance_monitor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for cron job)
CREATE POLICY "Service role full access to compliance_monitor_runs"
  ON compliance_monitor_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to compliance_snapshots"
  ON compliance_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to compliance_alerts"
  ON compliance_alerts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view data
CREATE POLICY "Authenticated users can view compliance_monitor_runs"
  ON compliance_monitor_runs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view compliance_snapshots"
  ON compliance_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view compliance_alerts"
  ON compliance_alerts FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can acknowledge alerts
CREATE POLICY "Authenticated users can acknowledge alerts"
  ON compliance_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after creating tables to verify setup

SELECT 
  'compliance_monitor_runs' AS table_name,
  COUNT(*) AS row_count
FROM compliance_monitor_runs
UNION ALL
SELECT 
  'compliance_snapshots',
  COUNT(*)
FROM compliance_snapshots
UNION ALL
SELECT 
  'compliance_alerts',
  COUNT(*)
FROM compliance_alerts;

-- Expected: 0 rows in each table (tables are empty but created successfully)
