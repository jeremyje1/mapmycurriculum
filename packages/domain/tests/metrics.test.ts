import { describe, it, expect } from 'vitest';
import { computeMetrics, CoreAreasDataset, TransferFrameworkDataset } from '../src/metrics';

describe('computeMetrics', () => {
  it('calculates core metrics', () => {
    const courses = [
      { id: 'ENGL-1301', subject: 'ENGL', number: '1301', title: 'Comp I', credits: 3, coreArea: 'Communication' },
      { id: 'MATH-1325', subject: 'MATH', number: '1325', title: 'Calc', credits: 3, coreArea: 'Mathematics' },
      { id: 'SPCH-1315', subject: 'SPCH', number: '1315', title: 'Speech', credits: 3, coreArea: 'Component Area Option' },
      { id: 'ACCT-2301', subject: 'ACCT', number: '2301', title: 'Financial Accounting', credits: 3 },
      { id: 'ACCT-2302', subject: 'ACCT', number: '2302', title: 'Managerial Accounting', credits: 3 },
      { id: 'ECON-2301', subject: 'ECON', number: '2301', title: 'Macro', credits: 3 },
      { id: 'ECON-2302', subject: 'ECON', number: '2302', title: 'Micro', credits: 3 },
      { id: 'BUSI-1301', subject: 'BUSI', number: '1301', title: 'Business Principles', credits: 3 },
      { id: 'BCIS-1305', subject: 'BCIS', number: '1305', title: 'Business Computer Apps', credits: 3 }
    ];
    const termPlans = [
      {
        termNumber: 1,
        courses: [
          { courseId: 'ENGL-1301', subject: 'ENGL', number: '1301', required: true },
          { courseId: 'MATH-1325', subject: 'MATH', number: '1325', required: true },
          { courseId: 'SPCH-1315', subject: 'SPCH', number: '1315', required: true }
        ]
      },
      {
        termNumber: 2,
        courses: [
          { courseId: 'ACCT-2301', subject: 'ACCT', number: '2301', required: true },
          { courseId: 'ACCT-2302', subject: 'ACCT', number: '2302', required: true },
          { courseId: 'ECON-2301', subject: 'ECON', number: '2301', required: true }
        ]
      },
      {
        termNumber: 3,
        courses: [
          { courseId: 'ECON-2302', subject: 'ECON', number: '2302', required: true },
          { courseId: 'BUSI-1301', subject: 'BUSI', number: '1301', required: true }
        ]
      },
      {
        termNumber: 4,
        courses: [
          { courseId: 'BCIS-1305', subject: 'BCIS', number: '1305', required: true }
        ]
      }
    ];
    const plos = [{ id: 'P1' }, { id: 'P2' }];
    const alignments = [
      { ploId: 'P1', cloId: 'c1', courseId: 'ACCT-2301', level: 'M' as const },
      { ploId: 'P2', cloId: 'c2', courseId: 'SPCH-1315', level: 'M' as const },
    ];

    const coreAreas: CoreAreasDataset = {
      totalCoreMinCredits: 42,
      areas: [
        { id: 'Communication', minCredits: 6 },
        { id: 'Mathematics', minCredits: 3 },
        { id: 'Component Area Option', minCredits: 6 }
      ]
    };

    const transferFramework: TransferFrameworkDataset = {
      frameworks: {
        BusinessFOSC: {
          requiredCourses: [
            { subject: 'ACCT', number: '2301' },
            { subject: 'ACCT', number: '2302' },
            { subject: 'ECON', number: '2301' },
            { subject: 'ECON', number: '2302' }
          ],
          mathOptions: [[{ subject: 'MATH', number: '1325' }]],
          recommendedCourses: [{ subject: 'BCIS', number: '1305' }]
        }
      }
    };

    const metrics = computeMetrics({
      courses,
      termPlans,
      plos,
      alignments,
      datasets: { coreAreas, transferFramework }
    });

    expect(metrics.program.totalCredits).toBe(27);
    expect(metrics.core.totalCredits).toBe(9);
    expect(metrics.core.areaCredits['Communication']).toBe(3);
    expect(metrics.core.areaCredits['Mathematics']).toBe(3);
    expect(metrics.transfer.businessFOSC.missingCount).toBe(0);
    expect(metrics.outcomes.ploMasteryCoveragePct).toBe(100);
    expect(metrics.termplan.maxTermCredits).toBe(9);
  });
});
