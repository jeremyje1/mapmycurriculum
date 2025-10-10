export interface CoreAreasDataset {
  areas?: Array<{ id: string; minCredits: number }>;
  totalCoreMinCredits?: number;
}

export interface TransferFrameworkCourseSpec { subject: string; number: string; }
export interface BusinessFrameworkSpec {
  title?: string;
  requiredCourses?: TransferFrameworkCourseSpec[];
  mathOptions?: TransferFrameworkCourseSpec[][];
  recommendedCourses?: TransferFrameworkCourseSpec[];
}

export interface TransferFrameworkDataset {
  frameworks?: Record<string, BusinessFrameworkSpec>;
}

export interface MetricCourseInput {
  id: string;
  subject: string;
  number: string;
  title: string;
  credits: number;
  coreArea?: string;
}

export interface MetricTermCourseInput {
  courseId: string;
  subject: string;
  number: string;
  required: boolean;
}

export interface MetricTermPlanInput {
  termNumber: number;
  courses: MetricTermCourseInput[];
  credits?: number;
}

export interface MetricAlignmentInput {
  ploId: string;
  cloId: string;
  courseId: string;
  level: 'I' | 'D' | 'M';
}

export interface MetricPloInput { id: string; code?: string }

export interface ComputedMetrics {
  program: { totalCredits: number };
  core: {
    totalCredits: number;
    areaCredits: Record<string, number>;
    minCredits?: Record<string, number>;
    requiredTotal?: number;
  };
  transfer: {
    businessFOSC: {
      missingCourses: string[];
      missingCount: number;
      recommendedMissing: string[];
    }
  };
  outcomes: {
    ploMasteryCoveragePct: number;
    masteryByPlo: Record<string, boolean>;
  };
  termplan: {
    maxTermCredits: number;
    termCredits: Array<{ termNumber: number; credits: number }>;
  };
}

interface CalcInput {
  courses: MetricCourseInput[];
  termPlans: MetricTermPlanInput[];
  alignments: MetricAlignmentInput[];
  plos: MetricPloInput[];
  datasets?: {
    coreAreas?: CoreAreasDataset;
    transferFramework?: TransferFrameworkDataset;
  };
}

const toCourseKey = (subject: string, number: string) => `${subject.trim().toUpperCase()}-${number.trim().toUpperCase()}`;
const toDisplayCourse = (subject: string, number: string) => `${subject.trim().toUpperCase()} ${number.trim().toUpperCase()}`;
const alphaSort = (a: string, b: string) => a.localeCompare(b);

interface CourseIndex {
  byKey: Map<string, MetricCourseInput>;
  byId: Map<string, MetricCourseInput>;
}

function buildCourseIndex(courses: MetricCourseInput[]): CourseIndex {
  const byKey = new Map<string, MetricCourseInput>();
  const byId = new Map<string, MetricCourseInput>();
  for (const course of courses) {
    const key = toCourseKey(course.subject, course.number);
    byKey.set(key, course);
    const id = (course.id || key).toUpperCase();
    byId.set(id, course);
  }
  return { byKey, byId };
}

interface TermAggregationResult {
  requiredCourseKeys: Set<string>;
  termCredits: Array<{ termNumber: number; credits: number }>;
}

function aggregateTermData(termPlans: MetricTermPlanInput[], index: CourseIndex): TermAggregationResult {
  const requiredCourseKeys = new Set<string>();
  const termCredits: Array<{ termNumber: number; credits: number }> = [];

  for (const term of termPlans) {
    let credits = 0;
    for (const entry of term.courses) {
      if (!entry.required) continue;
      const key = toCourseKey(entry.subject, entry.number);
      requiredCourseKeys.add(key);
      const course = index.byId.get(entry.courseId.toUpperCase()) ?? index.byKey.get(key);
      if (course) credits += course.credits;
    }
    termCredits.push({ termNumber: term.termNumber, credits });
  }

  termCredits.sort((a, b) => a.termNumber - b.termNumber);
  return { requiredCourseKeys, termCredits };
}

function pickRequiredCourses(courses: MetricCourseInput[], requiredKeys: Set<string>): MetricCourseInput[] {
  const seen = new Set<string>();
  const selected: MetricCourseInput[] = [];
  const hasRequirementFilter = requiredKeys.size > 0;

  for (const course of courses) {
    const key = toCourseKey(course.subject, course.number);
    if (hasRequirementFilter && !requiredKeys.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(course);
  }

  if (!selected.length) {
    for (const course of courses) {
      const key = toCourseKey(course.subject, course.number);
      if (seen.has(key)) continue;
      seen.add(key);
      selected.push(course);
    }
  }

  return selected;
}

interface CoreMetrics {
  totalCredits: number;
  areaCredits: Record<string, number>;
  minCredits?: Record<string, number>;
  requiredTotal?: number;
}

function calculateCoreMetrics(courses: MetricCourseInput[], dataset?: CoreAreasDataset): CoreMetrics {
  const areaCredits: Record<string, number> = {};
  const minCredits: Record<string, number> = {};

  if (dataset?.areas) {
    for (const area of dataset.areas) {
      areaCredits[area.id] = 0;
      minCredits[area.id] = area.minCredits;
    }
  }

  for (const course of courses) {
    if (!course.coreArea) continue;
    if (typeof areaCredits[course.coreArea] !== 'number') {
      areaCredits[course.coreArea] = 0;
    }
    areaCredits[course.coreArea] += course.credits;
  }

  const totalCredits = Object.values(areaCredits).reduce((sum, value) => sum + value, 0);
  return {
    totalCredits,
    areaCredits,
    minCredits: Object.keys(minCredits).length ? minCredits : undefined,
    requiredTotal: dataset?.totalCoreMinCredits,
  };
}

interface TransferMetrics {
  missingCourses: string[];
  recommendedMissing: string[];
}

function collectRequiredCourseGaps(
  courseKeys: Set<string>,
  framework: BusinessFrameworkSpec
): Set<string> {
  const gaps = new Set<string>();
  for (const spec of framework.requiredCourses ?? []) {
    if (!courseKeys.has(toCourseKey(spec.subject, spec.number))) {
      gaps.add(toDisplayCourse(spec.subject, spec.number));
    }
  }
  return gaps;
}

function collectMathOptionGaps(
  courseKeys: Set<string>,
  framework: BusinessFrameworkSpec,
  accumulator: Set<string>
) {
  const options = framework.mathOptions ?? [];
  if (!options.length) return;
  const satisfied = options.some((option: TransferFrameworkCourseSpec[]) =>
    option.every((spec: TransferFrameworkCourseSpec) => courseKeys.has(toCourseKey(spec.subject, spec.number)))
  );
  if (satisfied) return;
  for (const option of options) {
    for (const spec of option) {
      accumulator.add(toDisplayCourse(spec.subject, spec.number));
    }
  }
}

function collectRecommendedCourseGaps(
  courseKeys: Set<string>,
  framework: BusinessFrameworkSpec
): Set<string> {
  const gaps = new Set<string>();
  for (const spec of framework.recommendedCourses ?? []) {
    if (!courseKeys.has(toCourseKey(spec.subject, spec.number))) {
      gaps.add(toDisplayCourse(spec.subject, spec.number));
    }
  }
  return gaps;
}

function calculateTransferMetrics(
  courseKeys: Set<string>,
  dataset?: TransferFrameworkDataset
): TransferMetrics {
  const missing = new Set<string>();
  const framework = dataset?.frameworks?.BusinessFOSC;

  if (!framework) {
    return { missingCourses: [], recommendedMissing: [] };
  }
  collectRequiredCourseGaps(courseKeys, framework).forEach(value => missing.add(value));
  collectMathOptionGaps(courseKeys, framework, missing);
  const recommended = collectRecommendedCourseGaps(courseKeys, framework);

  return {
    missingCourses: Array.from(missing).sort(alphaSort),
    recommendedMissing: Array.from(recommended).sort(alphaSort),
  };
}

interface OutcomeMetrics {
  ploMasteryCoveragePct: number;
  masteryByPlo: Record<string, boolean>;
}

function calculateOutcomeMetrics(plos: MetricPloInput[], alignments: MetricAlignmentInput[]): OutcomeMetrics {
  const masteryByPlo: Record<string, boolean> = {};
  for (const plo of plos) {
    masteryByPlo[plo.id] = false;
  }

  for (const alignment of alignments) {
    if (alignment.level === 'M') {
      masteryByPlo[alignment.ploId] = true;
    }
  }

  const total = plos.length;
  const mastered = Object.values(masteryByPlo).filter(Boolean).length;
  const pct = total ? Math.round((mastered / total) * 100) : 0;

  return { ploMasteryCoveragePct: pct, masteryByPlo };
}

export function computeMetrics(input: CalcInput): ComputedMetrics {
  const index = buildCourseIndex(input.courses);
  const termAggregation = aggregateTermData(input.termPlans, index);
  const requiredCourses = pickRequiredCourses(input.courses, termAggregation.requiredCourseKeys);
  const programTotalCredits = requiredCourses.reduce((sum, course) => sum + course.credits, 0);

  const coreMetrics = calculateCoreMetrics(requiredCourses, input.datasets?.coreAreas);
  const presenceKeys = termAggregation.requiredCourseKeys.size
    ? termAggregation.requiredCourseKeys
    : new Set(requiredCourses.map(course => toCourseKey(course.subject, course.number)));
  const transferMetrics = calculateTransferMetrics(presenceKeys, input.datasets?.transferFramework);
  const outcomeMetrics = calculateOutcomeMetrics(input.plos, input.alignments);
  const maxTermCredits = termAggregation.termCredits.reduce((max, term) => Math.max(max, term.credits), 0);

  return {
    program: { totalCredits: programTotalCredits },
    core: coreMetrics,
    transfer: {
      businessFOSC: {
        missingCourses: transferMetrics.missingCourses,
        missingCount: transferMetrics.missingCourses.length,
        recommendedMissing: transferMetrics.recommendedMissing,
      }
    },
    outcomes: outcomeMetrics,
    termplan: {
      maxTermCredits,
      termCredits: termAggregation.termCredits,
    }
  };
}
