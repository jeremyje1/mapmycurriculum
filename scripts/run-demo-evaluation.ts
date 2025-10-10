#!/usr/bin/env tsx
import path from 'path';
import { loadRulePack } from '@cmt/state-packs';
import { buildSnapshot, evaluateRulePack, loadProgramDataFromCsvs } from '../packages/domain';

interface SummaryRow {
  total: number;
  passed: number;
  failed: number;
}

function computeSummary(counts: { passed: number; total: number }): SummaryRow {
  return {
    total: counts.total,
    passed: counts.passed,
    failed: counts.total - counts.passed
  };
}

function summarizeResults<T extends { passed: boolean }>(results: T[]): SummaryRow {
  const passed = results.filter(result => result.passed).length;
  return computeSummary({ total: results.length, passed });
}

function formatMetrics(snapshot: Awaited<ReturnType<typeof buildSnapshot>>) {
  const metrics = snapshot.metrics;
  return {
    'Program SCH': metrics.program.totalCredits,
    'Core SCH': metrics.core.totalCredits,
    'PLO Mastery %': `${metrics.outcomes.ploMasteryCoveragePct}%`,
    'Max Term SCH': metrics.termplan.maxTermCredits,
    'Business FOSC Gaps': metrics.transfer.businessFOSC.missingCount
  };
}

async function main() {
  const [, , programCodeArg, stateArg, versionArg, dataRootArg] = process.argv;
  const programCode = programCodeArg ?? 'BUS-AA-TX';
  const state = stateArg ?? 'US-TX';
  const version = versionArg ?? '2025.09';
  const dataRoot = dataRootArg ? path.resolve(dataRootArg) : path.resolve(process.cwd(), 'demo-data');

  const rulePack = await loadRulePack(state, version);
  const programData = await loadProgramDataFromCsvs({ programCode, rootDir: dataRoot });
  const snapshot = await buildSnapshot(programData, rulePack);
  const evaluation = evaluateRulePack(snapshot, rulePack);

  console.log(`RulePack: ${rulePack.meta.state}/${rulePack.meta.version} – ${rulePack.meta.title}`);
  console.log(`Program: ${snapshot.program.code} (${snapshot.program.catalogYear}) – ${snapshot.program.name}`);
  console.log('');

  console.log('Key Metrics');
  console.table(formatMetrics(snapshot));

  const summary = {
    Program: summarizeResults(evaluation.program),
    Courses: summarizeResults(evaluation.courses),
    'Term Plans': summarizeResults(evaluation.termPlans)
  };

  console.log('Rule Summary');
  console.table(summary);

  const failures = [
    ...evaluation.program,
    ...evaluation.courses,
    ...evaluation.termPlans
  ].filter(result => !result.passed);

  if (failures.length === 0) {
    console.log('✅ All rules passed.');
  } else {
    console.log('❌ Failing Rules');
    for (const failure of failures) {
      console.log(`- [${failure.severity}] ${failure.ruleId} (${failure.scope}) on ${failure.targetLabel}`);
      console.log(`  Description: ${failure.description}`);
      if (failure.remediation) {
        console.log(`  Remediation: ${failure.remediation}`);
      }
      if (failure.details?.error) {
        console.log(`  Error: ${failure.details.error}`);
      }
    }
  }
}

main().catch(error => {
  console.error('Evaluation run failed:', error);
  process.exit(1);
});
