import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Automated Compliance Monitoring Cron Job
 * 
 * This endpoint runs weekly (configured in vercel.json) to:
 * 1. Evaluate all active programs against their assigned RulePacks
 * 2. Detect compliance drift or new policy gaps
 * 3. Send notifications for critical issues
 * 4. Store historical compliance snapshots
 * 
 * Trigger: Vercel Cron (weekly on Sundays at 2 AM UTC)
 * Manual: GET /api/cron/compliance-monitor?key=YOUR_CRON_SECRET
 */

interface ComplianceCheckResult {
  programCode: string;
  programName: string;
  timestamp: string;
  rulePackVersion: string;
  status: 'compliant' | 'warning' | 'critical';
  passedRules: number;
  failedRules: number;
  warningRules: number;
  criticalIssues: string[];
  changesSinceLastCheck: number;
}

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const cronSecret = searchParams.get('key') || authHeader?.replace('Bearer ', '');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting weekly compliance monitoring...');
    
    // Use service role key for cron job to bypass RLS
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const results: ComplianceCheckResult[] = [];

    // 1. Get all active programs
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*')
      .order('code');

    if (programsError) {
      console.error('[CRON] Error fetching programs:', programsError);
      throw programsError;
    }

    console.log(`[CRON] Found ${programs?.length || 0} programs to check`);

    // 2. For each program, run compliance evaluation
    for (const program of programs || []) {
      try {
        const result = await evaluateProgram(program, supabase);
        results.push(result);

        // 3. Store snapshot for historical tracking
        await storeComplianceSnapshot(result, supabase);

        // 4. Check for critical issues and send notifications
        if (result.status === 'critical' && result.criticalIssues.length > 0) {
          await sendCriticalAlert(result, supabase);
        }

        console.log(`[CRON] ✓ ${program.code}: ${result.status} (${result.passedRules}/${result.passedRules + result.failedRules} rules passed)`);
      } catch (error) {
        console.error(`[CRON] Error evaluating ${program.code}:`, error);
        results.push({
          programCode: program.code,
          programName: program.name,
          timestamp: new Date().toISOString(),
          rulePackVersion: 'unknown',
          status: 'critical',
          passedRules: 0,
          failedRules: 0,
          warningRules: 0,
          criticalIssues: [`Evaluation failed: ${error}`],
          changesSinceLastCheck: 0
        });
      }
    }

    // 5. Generate summary report
    const summary = {
      totalPrograms: results.length,
      compliant: results.filter(r => r.status === 'compliant').length,
      warnings: results.filter(r => r.status === 'warning').length,
      critical: results.filter(r => r.status === 'critical').length,
      timestamp: new Date().toISOString(),
      results: results
    };

    // 6. Store summary in database
    await supabase.from('compliance_monitor_runs').insert({
      run_date: new Date().toISOString(),
      total_programs: summary.totalPrograms,
      compliant_count: summary.compliant,
      warning_count: summary.warnings,
      critical_count: summary.critical,
      summary_data: summary
    });

    console.log(`[CRON] Compliance monitoring complete: ${summary.compliant} compliant, ${summary.warnings} warnings, ${summary.critical} critical`);

    return NextResponse.json({
      success: true,
      message: 'Compliance monitoring completed successfully',
      summary
    });

  } catch (error: any) {
    console.error('[CRON] Fatal error in compliance monitoring:', error);
    return NextResponse.json({
      error: 'Compliance monitoring failed',
      details: error.message
    }, { status: 500 });
  }
}

async function evaluateProgram(program: any, supabase: any): Promise<ComplianceCheckResult> {
  // Fetch program courses
  const { data: courses } = await supabase
    .from('simple_courses')
    .select('*')
    .eq('program_code', program.code);

  // Fetch alignments
  const { data: alignments } = await supabase
    .from('simple_alignments')
    .select('*')
    .eq('program_code', program.code);

  // Fetch learning outcomes
  const { data: outcomes } = await supabase
    .from('learning_outcomes')
    .select('*')
    .eq('program_id', program.id);

  // Calculate basic compliance metrics
  const totalCourses = courses?.length || 0;
  const totalAlignments = alignments?.length || 0;
  const totalOutcomes = outcomes?.length || 0;

  // Determine status based on rules
  const criticalIssues: string[] = [];
  let passedRules = 0;
  let failedRules = 0;
  let warningRules = 0;

  // Rule 1: Minimum credit hours (60 for AA, 120 for BA)
  const totalCredits = courses?.reduce((sum: number, c: any) => sum + (c.credits || 0), 0) || 0;
  const minCredits = program.degree_type === 'AA' ? 60 : 120;
  if (totalCredits >= minCredits) {
    passedRules++;
  } else {
    failedRules++;
    criticalIssues.push(`Insufficient credit hours: ${totalCredits} < ${minCredits}`);
  }

  // Rule 2: All PLOs must have at least one alignment
  const unmappedOutcomes = outcomes?.filter((o: any) => 
    !alignments?.some((a: any) => a.plo_code === o.code)
  ) || [];
  
  if (unmappedOutcomes.length === 0) {
    passedRules++;
  } else if (unmappedOutcomes.length <= 2) {
    warningRules++;
  } else {
    failedRules++;
    criticalIssues.push(`${unmappedOutcomes.length} unmapped learning outcomes`);
  }

  // Rule 3: Alignment coverage should be >= 80%
  const coveragePercent = totalOutcomes > 0 
    ? (alignments?.length || 0) / totalOutcomes * 100 
    : 0;
  
  if (coveragePercent >= 80) {
    passedRules++;
  } else if (coveragePercent >= 60) {
    warningRules++;
  } else {
    failedRules++;
    criticalIssues.push(`Low alignment coverage: ${coveragePercent.toFixed(1)}%`);
  }

  // Rule 4: Each PLO should have I-D-M progression
  const plosWithProgression = outcomes?.filter((o: any) => {
    const ploAlignments = alignments?.filter((a: any) => a.plo_code === o.code) || [];
    const levels = ploAlignments.map((a: any) => a.level);
    return levels.includes('I') && levels.includes('D') && levels.includes('M');
  }) || [];

  if (plosWithProgression.length === totalOutcomes && totalOutcomes > 0) {
    passedRules++;
  } else {
    warningRules++;
  }

  // Determine overall status
  let status: 'compliant' | 'warning' | 'critical';
  if (criticalIssues.length > 0) {
    status = 'critical';
  } else if (warningRules > 0) {
    status = 'warning';
  } else {
    status = 'compliant';
  }

  // Check for changes since last check (simplified - would compare to last snapshot in production)
  const changesSinceLastCheck = 0; // TODO: Implement historical comparison

  return {
    programCode: program.code,
    programName: program.name,
    timestamp: new Date().toISOString(),
    rulePackVersion: 'US-TX/2025.09', // TODO: Get from program metadata
    status,
    passedRules,
    failedRules,
    warningRules,
    criticalIssues,
    changesSinceLastCheck
  };
}

async function storeComplianceSnapshot(result: ComplianceCheckResult, supabase: any) {
  await supabase.from('compliance_snapshots').insert({
    program_code: result.programCode,
    check_date: result.timestamp,
    status: result.status,
    passed_rules: result.passedRules,
    failed_rules: result.failedRules,
    warning_rules: result.warningRules,
    critical_issues: result.criticalIssues,
    rule_pack_version: result.rulePackVersion
  });
}

async function sendCriticalAlert(result: ComplianceCheckResult, supabase: any) {
  // In production, this would send email/Slack notification
  console.log(`[ALERT] CRITICAL compliance issue in ${result.programCode}:`, result.criticalIssues);

  // Store alert in database
  await supabase.from('compliance_alerts').insert({
    program_code: result.programCode,
    alert_date: new Date().toISOString(),
    severity: 'critical',
    issues: result.criticalIssues,
    notified: false
  });

  // TODO: Send actual notifications
  // - Email to program coordinator
  // - Slack webhook to academic affairs channel
  // - Create ticket in support system
}
