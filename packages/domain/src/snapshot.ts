import { z } from 'zod';
import { LoadedRulePack } from '@cmt/state-packs';
import { computeMetrics } from './metrics';

export const CourseSchema = z.object({
  id: z.string(),
  subject: z.string(),
  number: z.string(),
  title: z.string(),
  credits: z.number(),
  coreArea: z.string().optional(),
  cip: z.string().optional()
});

export const TermPlanSchema = z.object({
  termNumber: z.number(),
  courseIds: z.array(z.string()),
  credits: z.number()
});

export const PloSchema = z.object({ id: z.string(), code: z.string(), description: z.string() });
export const CloSchema = z.object({ id: z.string(), courseId: z.string(), code: z.string(), level: z.enum(['I','D','M']), description: z.string() });
export const AlignmentSchema = z.object({ ploId: z.string(), cloId: z.string(), level: z.enum(['I','D','M']), weight: z.number().optional() });

export const MetricsSchema = z.object({
  program: z.object({
    totalCredits: z.number(),
    maxTermCredits: z.number()
  }),
  core: z.object({
    totalCredits: z.number(),
    areaCredits: z.record(z.string(), z.number()),
    areaBreakdown: z.record(z.string(), z.object({ credits: z.number(), courses: z.array(z.string()) }))
  }),
  transfer: z.object({
    businessFOSC: z.object({
      missing: z.array(z.string()),
      missingCount: z.number(),
      complete: z.boolean()
    })
  }),
  outcomes: z.object({
    ploMasteryCoveragePct: z.number()
  })
});

export const ProgramSnapshotSchema = z.object({
  programVersionId: z.string(),
  courses: z.array(CourseSchema),
  termPlans: z.array(TermPlanSchema),
  outcomes: z.object({
    plos: z.array(PloSchema),
    clos: z.array(CloSchema),
    alignments: z.array(AlignmentSchema)
  }),
  datasets: z.object({
    coreAreas: z.any().optional(),
    transferFramework: z.any().optional(),
    numbering: z.any().optional(),
    courseCatalog: z.any().optional()
  }),
  metrics: MetricsSchema
});

export type ProgramSnapshot = z.infer<typeof ProgramSnapshotSchema>;

export async function buildSnapshot(programVersionId: string, pack: LoadedRulePack): Promise<ProgramSnapshot> {
  const catalog: any[] = pack.datasets.course_catalog || pack.datasets.courseCatalog || [];
  const coreAreas: Record<string, { id: string; title: string; minCredits: number }> = pack.datasets.core_areas || pack.datasets.coreAreas || {};
  const courses = catalog.map(c => ({
    id: c.id,
    subject: c.subject,
    number: c.number,
    title: c.title,
    credits: c.credits,
    coreArea: c.coreArea,
    cip: c.cip
  }));
  const terms: { termNumber: number; courseIds: string[]; credits: number }[] = [];
  const chunkSize = Math.ceil(courses.length / 4) || 1;
  for (let i=0;i<courses.length;i+=chunkSize) {
    const slice = courses.slice(i,i+chunkSize);
    terms.push({ termNumber: terms.length+1, courseIds: slice.map(s=>s.id), credits: slice.reduce((s,c)=>s+c.credits,0) });
  }
  const outcomes = { plos: [], clos: [], alignments: [] };
  const metrics = computeMetrics({
    courses,
    termPlans: terms,
    alignments: outcomes.alignments as any,
    plos: outcomes.plos as any,
  });
  return {
    programVersionId,
    courses,
    termPlans: terms,
    outcomes,
    datasets: {
      coreAreas,
      transferFramework: pack.datasets.transfer_framework,
      numbering: pack.datasets.numbering,
      courseCatalog: catalog
    },
    metrics
  };
}
