#!/usr/bin/env tsx
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDemoData } from '../src/demo-data';
import { buildSnapshot } from '../src/snapshot';
import { evaluateSnapshot } from '../src/evaluator';
import { loadRulePack } from '@cmt/state-packs';

async function main() {
  console.log('🚀 Demo Curriculum Evaluation\n');

  // Determine the repository root - when running from packages/domain
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, '../../..');
  console.log(`Repository root: ${repoRoot}\n`);
  
  // Change to repo root so loadRulePack can find state-packs
  process.chdir(repoRoot);

  // Load demo data
  console.log('📚 Loading demo data from CSV files...');
  const demoDataDir = path.join(repoRoot, 'demo-data');
  const demoData = await loadDemoData(demoDataDir);
  
  console.log(`  ✓ Loaded ${demoData.programs.length} programs`);
  console.log(`  ✓ Loaded ${demoData.courses.length} courses`);
  console.log(`  ✓ Loaded ${demoData.termPlans.length} term plan entries`);
  console.log(`  ✓ Loaded ${demoData.outcomes.length} learning outcomes`);
  console.log(`  ✓ Loaded ${demoData.alignments.length} alignments\n`);

  // Load Texas RulePack
  console.log('📋 Loading Texas RulePack (US-TX/2025.09)...');
  const rulePack = await loadRulePack('US-TX', '2025.09');
  console.log(`  ✓ Loaded ${rulePack.meta.title}`);
  console.log(`  ✓ Program rules: ${rulePack.rules.program.length}`);
  console.log(`  ✓ Course rules: ${rulePack.rules.course.length}`);
  console.log(`  ✓ Term plan rules: ${rulePack.rules.termPlan.length}\n`);

  // Build snapshot from demo data
  console.log('🔨 Building program snapshot...');
  
  // Find the program code
  const program = demoData.programs[0];
  console.log(`  Program: ${program.name} (${program.code})`);
  
  // Build course list from demo data
  const courses = demoData.courses.map(c => ({
    id: `${c.subject}-${c.number}`,
    subject: c.subject,
    number: c.number,
    title: c.title,
    credits: c.credits,
    coreArea: c.coreArea,
    cip: c.cip
  }));

  // Build term plans from demo data
  const termPlansByTerm = new Map<number, { courseIds: string[]; credits: number }>();
  for (const tp of demoData.termPlans.filter(t => t.programCode === program.code)) {
    if (!termPlansByTerm.has(tp.term)) {
      termPlansByTerm.set(tp.term, { courseIds: [], credits: 0 });
    }
    const termData = termPlansByTerm.get(tp.term)!;
    const courseId = `${tp.subject}-${tp.number}`;
    termData.courseIds.push(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      termData.credits += course.credits;
    }
  }

  const termPlans = Array.from(termPlansByTerm.entries()).map(([termNumber, data]) => ({
    termNumber,
    courseIds: data.courseIds,
    credits: data.credits
  }));

  // Build outcomes from demo data
  const plos = demoData.outcomes
    .filter(o => o.type === 'PLO' && o.ownerCode === program.code)
    .map(o => ({
      id: o.code,
      code: o.code,
      description: o.description
    }));

  const clos = demoData.outcomes
    .filter(o => o.type === 'CLO')
    .map(o => ({
      id: o.code,
      courseId: o.ownerCode.replace(' ', '-'), // Convert "ACCT 2301" to "ACCT-2301"
      code: o.code,
      level: o.level,
      description: o.description
    }));

  // Build alignments from demo data
  const alignments = demoData.alignments
    .filter(a => a.programCode === program.code)
    .map(a => ({
      ploId: a.ploCode,
      cloId: a.cloCode,
      level: a.level,
      weight: a.weight
    }));

  // Calculate metrics
  const coreAreaBreakdown: Record<string, { credits: number; courses: string[] }> = {};
  const coreAreaCredits: Record<string, number> = {};
  let coreTotalCredits = 0;
  
  courses.forEach(c => {
    if (c.coreArea) {
      coreTotalCredits += c.credits;
      if (!coreAreaBreakdown[c.coreArea]) {
        coreAreaBreakdown[c.coreArea] = { credits: 0, courses: [] };
        coreAreaCredits[c.coreArea] = 0;
      }
      coreAreaBreakdown[c.coreArea].credits += c.credits;
      coreAreaBreakdown[c.coreArea].courses.push(`${c.subject}${c.number}`);
      coreAreaCredits[c.coreArea] += c.credits;
    }
  });

  const foundationSubjects = new Set(['ACCT', 'ECON', 'BUSI', 'BCIS', 'MATH', 'SPCH']);
  const offeredSubjects = new Set(courses.map(c => c.subject));
  const missing = Array.from(foundationSubjects).filter(s => !offeredSubjects.has(s));

  const ploMasteryByPlo = new Set(
    alignments.filter(a => a.level === 'M').map(a => a.ploId)
  );
  const ploMasteryCoveragePct = plos.length ? Math.round((ploMasteryByPlo.size / plos.length) * 100) : 0;

  const metrics = {
    program: {
      totalCredits: courses.reduce((sum, c) => sum + c.credits, 0),
      maxTermCredits: Math.max(...termPlans.map(t => t.credits), 0)
    },
    core: {
      totalCredits: coreTotalCredits,
      areaCredits: coreAreaCredits,
      areaBreakdown: coreAreaBreakdown
    },
    transfer: {
      businessFOSC: {
        missing,
        missingCount: missing.length,
        complete: missing.length === 0
      }
    },
    outcomes: {
      ploMasteryCoveragePct
    }
  };

  const snapshot = {
    programVersionId: `${program.code}-${program.catalogYear}`,
    courses,
    termPlans,
    outcomes: {
      plos,
      clos,
      alignments
    },
    datasets: rulePack.datasets,
    metrics
  };

  console.log(`  ✓ Snapshot created with ${snapshot.courses.length} courses, ${snapshot.termPlans.length} terms\n`);

  // Evaluate
  console.log('⚖️  Evaluating program against Texas rules...\n');
  const report = evaluateSnapshot(snapshot, rulePack);

  // Display results
  console.log('📊 Evaluation Results:');
  console.log(`  Total rules evaluated: ${report.summary.total}`);
  console.log(`  ✓ Passed: ${report.summary.passed}`);
  console.log(`  ✗ Failed: ${report.summary.failed}`);
  console.log(`    - Errors: ${report.summary.errors}`);
  console.log(`    - Warnings: ${report.summary.warnings}`);
  console.log(`    - Info: ${report.summary.info}\n`);

  // Show failed rules
  const failedResults = report.results.filter(r => !r.passed);
  if (failedResults.length > 0) {
    console.log('❌ Failed Rules:');
    for (const result of failedResults) {
      console.log(`  [${result.severity}] ${result.ruleId}: ${result.description}`);
      if (result.message) {
        console.log(`    Message: ${result.message}`);
      }
      if (result.remediation) {
        console.log(`    Remediation: ${result.remediation}`);
      }
    }
  } else {
    console.log('✅ All rules passed!');
  }

  console.log(`\n✨ Evaluation complete at ${report.timestamp}`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
