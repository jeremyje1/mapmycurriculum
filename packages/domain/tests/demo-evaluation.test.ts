import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';
import { loadRulePack } from '@cmt/state-packs';
import { buildSnapshot, evaluateRulePack, loadProgramDataFromCsvs } from '../src';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../../..');
const demoDataRoot = path.resolve(repoRoot, 'demo-data');

describe('demo evaluation', () => {
  it('passes the Texas demo RulePack', async () => {
    const pack = await loadRulePack('US-TX', '2025.09');
    const programData = await loadProgramDataFromCsvs({
      programCode: 'BUS-AA-TX',
      rootDir: demoDataRoot
    });
    const snapshot = await buildSnapshot(programData, pack);
    const evaluation = evaluateRulePack(snapshot, pack);

    const failures = [
      ...evaluation.program,
      ...evaluation.courses,
      ...evaluation.termPlans
    ].filter(result => !result.passed);

    expect(failures).toHaveLength(0);
    expect(snapshot.metrics.program.totalCredits).toBeGreaterThan(0);
    expect(snapshot.metrics.core.totalCredits).toBeGreaterThan(0);
  });
});
