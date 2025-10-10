import { z } from 'zod';
import { LoadedRulePack } from '@cmt/state-packs';
import { computeMetrics, MetricAlignmentInput, MetricCourseInput, MetricTermPlanInput } from './metrics';

export const CourseSchema = z.object({
  id: z.string(),
  subject: z.string(),
  number: z.string(),
  title: z.string(),
  credits: z.number(),
  coreArea: z.string().optional(),
  cip: z.string().optional(),
  tccns: z.string().optional()
});

export const TermPlanCourseSchema = z.object({
  courseId: z.string(),
  subject: z.string(),
  number: z.string(),
  required: z.boolean().default(true)
});

export const TermPlanSchema = z.object({
  termNumber: z.number(),
  courses: z.array(TermPlanCourseSchema),
  credits: z.number()
});

export const PloSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  level: z.enum(['I', 'D', 'M']).optional()
});

export const CloSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  code: z.string(),
  level: z.enum(['I', 'D', 'M']),
  description: z.string()
});

export const AlignmentSchema = z.object({
  ploId: z.string(),
  cloId: z.string(),
  courseId: z.string(),
  level: z.enum(['I', 'D', 'M']),
  weight: z.number().optional()
});

export const OutcomesSchema = z.object({
  plos: z.array(PloSchema),
  clos: z.array(CloSchema),
  alignments: z.array(AlignmentSchema)
});

export const MetricsSchema = z.object({
  program: z.object({ totalCredits: z.number() }),
  core: z.object({
    totalCredits: z.number(),
    areaCredits: z.record(z.number()),
    minCredits: z.record(z.number()).optional(),
    requiredTotal: z.number().optional()
  }),
  transfer: z.object({
    businessFOSC: z.object({
      missingCourses: z.array(z.string()),
      missingCount: z.number(),
      recommendedMissing: z.array(z.string())
    })
  }),
  outcomes: z.object({
    ploMasteryCoveragePct: z.number(),
    masteryByPlo: z.record(z.boolean())
  }),
  termplan: z.object({
    maxTermCredits: z.number(),
    termCredits: z.array(z.object({
      termNumber: z.number(),
      credits: z.number()
    }))
  })
});

export const ProgramInfoSchema = z.object({
  code: z.string(),
  name: z.string(),
  catalogYear: z.string(),
  degreeType: z.string()
});

export const ProgramDataSchema = z.object({
  programVersionId: z.string(),
  programCode: z.string(),
  programName: z.string(),
  catalogYear: z.string(),
  degreeType: z.string(),
  courses: z.array(CourseSchema),
  termPlans: z.array(TermPlanSchema),
  outcomes: OutcomesSchema
});

export type ProgramData = z.infer<typeof ProgramDataSchema>;

type ProgramCourse = ProgramData['courses'][number];
type ProgramTermPlan = ProgramData['termPlans'][number];
type ProgramTermCourse = ProgramTermPlan['courses'][number];
type ProgramAlignment = ProgramData['outcomes']['alignments'][number];
type ProgramPlo = ProgramData['outcomes']['plos'][number];

export const RulePackSummarySchema = z.object({
  state: z.string(),
  version: z.string(),
  title: z.string()
});

export const ProgramSnapshotSchema = z.object({
  programVersionId: z.string(),
  program: ProgramInfoSchema,
  courses: z.array(CourseSchema),
  termPlans: z.array(TermPlanSchema),
  outcomes: OutcomesSchema,
  datasets: z.object({
    coreAreas: z.any().optional(),
    transferFramework: z.any().optional(),
    numbering: z.any().optional(),
    courseCatalog: z.any().optional()
  }),
  metrics: MetricsSchema,
  rulePack: RulePackSummarySchema
});

export type ProgramSnapshot = z.infer<typeof ProgramSnapshotSchema>;

export async function buildSnapshot(programData: ProgramData, pack: LoadedRulePack): Promise<ProgramSnapshot> {
  const data = ProgramDataSchema.parse(programData);

  const courseInputs: MetricCourseInput[] = data.courses.map((course: ProgramCourse) => ({
    id: course.id,
    subject: course.subject,
    number: course.number,
    title: course.title,
    credits: course.credits,
    coreArea: course.coreArea
  }));

  const termPlanInputs: MetricTermPlanInput[] = data.termPlans.map((plan: ProgramTermPlan) => ({
    termNumber: plan.termNumber,
  courses: plan.courses.map((course: ProgramTermCourse) => ({
      courseId: course.courseId,
      subject: course.subject,
      number: course.number,
      required: course.required
    })),
    credits: plan.credits
  }));

  const alignmentInputs: MetricAlignmentInput[] = data.outcomes.alignments.map((alignment: ProgramAlignment) => ({
    ploId: alignment.ploId,
    cloId: alignment.cloId,
    courseId: alignment.courseId,
    level: alignment.level
  }));

  const metrics = computeMetrics({
    courses: courseInputs,
    termPlans: termPlanInputs,
    alignments: alignmentInputs,
  plos: data.outcomes.plos.map((plo: ProgramPlo) => ({ id: plo.id, code: plo.code })),
    datasets: {
      coreAreas: pack.datasets.core_areas || pack.datasets.coreAreas,
      transferFramework: pack.datasets.transfer_framework
    }
  });

  return ProgramSnapshotSchema.parse({
    programVersionId: data.programVersionId,
    program: {
      code: data.programCode,
      name: data.programName,
      catalogYear: data.catalogYear,
      degreeType: data.degreeType
    },
    courses: data.courses,
    termPlans: data.termPlans,
    outcomes: data.outcomes,
    datasets: {
      coreAreas: pack.datasets.core_areas || pack.datasets.coreAreas,
      transferFramework: pack.datasets.transfer_framework,
      numbering: pack.datasets.numbering,
      courseCatalog: pack.datasets.course_catalog || pack.datasets.courseCatalog
    },
    metrics,
    rulePack: {
      state: pack.meta.state,
      version: pack.meta.version,
      title: pack.meta.title
    }
  });
}
