import { describe, it, expect } from 'vitest';
import { computeMetrics } from '../src/metrics';

describe('computeMetrics', () => {
  it('calculates core metrics', () => {
    const courses = [
      { id: '1', subject: 'ENGL', number: '1301', title: 'Comp I', credits: 3, coreArea: 'COMM' },
      { id: '2', subject: 'MATH', number: '1325', title: 'Calc', credits: 3, coreArea: 'MATH' },
      { id: '3', subject: 'SPCH', number: '1315', title: 'Speech', credits: 3, coreArea: 'COMM' },
      { id: '4', subject: 'ACCT', number: '2301', title: 'Financial Accounting', credits: 3 },
      { id: '5', subject: 'ACCT', number: '2302', title: 'Managerial Accounting', credits: 3 },
      { id: '6', subject: 'ECON', number: '2301', title: 'Macro', credits: 3 },
      { id: '7', subject: 'ECON', number: '2302', title: 'Micro', credits: 3 },
      { id: '8', subject: 'BUSI', number: '1301', title: 'Business Principles', credits: 3 },
      { id: '9', subject: 'BCIS', number: '1305', title: 'Business Computer Apps', credits: 3 }
    ];
    const termPlans = [
      { termNumber: 1, courseIds: ['1','2','3'], credits: 9 },
      { termNumber: 2, courseIds: ['4','5','6'], credits: 9 },
      { termNumber: 3, courseIds: ['7','8'], credits: 6 },
      { termNumber: 4, courseIds: ['9'], credits: 3 }
    ];
    const plos = [{ id: 'P1' }, { id: 'P2' }];
    const alignments = [
      { ploId: 'P1', cloId: 'c1', level: 'M' as const },
      { ploId: 'P2', cloId: 'c2', level: 'M' as const },
    ];
    const metrics = computeMetrics({ courses, termPlans, plos, alignments });
    expect(metrics.program.totalCredits).toBe(27);
    expect(metrics.core.totalCredits).toBe(9); // ENGL+MATH+SPCH coreArea tagged (COMM+MATH)
    expect(metrics.transfer.businessFOSC.complete).toBe(true);
    expect(metrics.outcomes.ploMasteryCoveragePct).toBe(100);
    expect(metrics.program.maxTermCredits).toBe(9);
  });
});
