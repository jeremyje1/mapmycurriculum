import { promises as fs } from 'fs';
import path from 'path';
import { ProgramData, ProgramDataSchema, TermPlanCourseSchema } from './snapshot';

const DEFAULT_DATA_ROOT = path.resolve(process.cwd(), 'demo-data');

interface CsvRecord {
  [key: string]: string;
}

type AlignmentLevel = 'I' | 'D' | 'M';
type ProgramCourse = ProgramData['courses'][number];

const toCourseKey = (subject: string, number: string) => `${subject.trim().toUpperCase()}-${number.trim().toUpperCase()}`;

async function readCsvRecords(filePath: string): Promise<CsvRecord[]> {
  const raw = await fs.readFile(filePath, 'utf8');
  const lines = raw
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((header: string) => header.trim());
  return lines.slice(1).map((line: string) => {
    const values = line.split(',');
    const record: CsvRecord = {};
    headers.forEach((header: string, idx: number) => {
      record[header] = (values[idx] ?? '').trim();
    });
    return record;
  });
}

function assertNumber(value: string | undefined, context: string): number {
  const parsed = Number(value ?? '');
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected numeric value for ${context}, received '${value ?? ''}'.`);
  }
  return parsed;
}

function assertTermPlanCourses(termCourses: CsvRecord[], courseMap: Map<string, CsvRecord>) {
  for (const row of termCourses) {
    const key = toCourseKey(row.subject, row.number);
    if (!courseMap.has(key)) {
      throw new Error(`Term plan references course ${row.subject} ${row.number} which is not defined in courses CSV.`);
    }
  }
}

function buildCourseEntries(courseRows: CsvRecord[], courseKeys: Set<string>) {
  const courses: ProgramData['courses'] = [];
  for (const row of courseRows) {
    const key = toCourseKey(row.subject, row.number);
    if (!courseKeys.has(key)) continue;
    const coreArea = (row.coreArea ?? '').trim();
    courses.push({
      id: key,
      subject: row.subject,
      number: row.number,
      title: row.title,
      credits: assertNumber(row.credits, `credits for ${row.subject} ${row.number}`),
      coreArea: coreArea.length ? coreArea : undefined,
      cip: (row.cip ?? '').trim() || undefined,
      tccns: (row.tccns ?? '').trim() || undefined
    });
  }
  return courses.sort((a: ProgramCourse, b: ProgramCourse) =>
    a.subject.localeCompare(b.subject) || a.number.localeCompare(b.number)
  );
}

function parseBoolean(value: string | undefined, defaultValue = true): boolean {
  if (value == null || value === '') return defaultValue;
  return /^true$/i.test(value);
}

function buildTermPlans(termRows: CsvRecord[], courseLookup: Map<string, ProgramData['courses'][number]>) {
  const plansMap = new Map<number, { termNumber: number; courses: ProgramData['termPlans'][number]['courses']; credits: number }>();

  for (const row of termRows) {
    const termNumber = assertNumber(row.term ?? row.termNumber, 'term');
    const key = toCourseKey(row.subject, row.number);
    const course = courseLookup.get(key);
    if (!course) {
      throw new Error(`Term plan references missing course ${row.subject} ${row.number}.`);
    }

    if (!plansMap.has(termNumber)) {
      plansMap.set(termNumber, { termNumber, courses: [], credits: 0 });
    }
    const plan = plansMap.get(termNumber)!;
    const required = parseBoolean(row.required, true);
    const courseEntry = TermPlanCourseSchema.parse({
      courseId: course.id,
      subject: course.subject,
      number: course.number,
      required
    });
    plan.courses.push(courseEntry);
    if (required) plan.credits += course.credits;
  }

  return Array.from(plansMap.values()).sort((a, b) => a.termNumber - b.termNumber);
}

function buildOutcomes(
  programCode: string,
  outcomeRows: CsvRecord[],
  courseLookup: Map<string, ProgramData['courses'][number]>
) {
  const plos: ProgramData['outcomes']['plos'] = [];
  const clos: ProgramData['outcomes']['clos'] = [];

  for (const row of outcomeRows) {
    const type = (row.type || '').trim().toUpperCase();
    if (type === 'PLO' && row.ownerCode === programCode) {
      plos.push({
        id: `${programCode}:${row.code}`,
        code: row.code,
        description: row.description,
        level: (row.level as AlignmentLevel) || undefined
      });
    }
    if (type === 'CLO') {
      const [subject, number] = (row.ownerCode || '').split(/\s+/);
      if (!subject || !number) continue;
      const key = toCourseKey(subject, number);
      if (!courseLookup.has(key)) continue;
      clos.push({
        id: `${key}:${row.code}`,
        courseId: key,
        code: row.code,
        level: (row.level as AlignmentLevel) ?? 'I',
        description: row.description
      });
    }
  }

  return { plos, clos };
}

function buildAlignments(
  programCode: string,
  alignmentRows: CsvRecord[],
  plos: ProgramData['outcomes']['plos'],
  clos: ProgramData['outcomes']['clos']
) {
  const ploIndex = new Map<string, string>();
  for (const plo of plos) {
    ploIndex.set(plo.code, plo.id);
  }

  const cloIndex = new Map<string, string>();
  for (const clo of clos) {
    cloIndex.set(`${clo.courseId}:${clo.code}`, clo.id);
  }

  const alignments: ProgramData['outcomes']['alignments'] = [];

  for (const row of alignmentRows) {
    if ((row.programCode || row.ProgramCode) !== programCode) continue;
    const ploId = ploIndex.get(row.ploCode);
    const courseKey = toCourseKey(row.courseSubject, row.courseNumber);
    const cloId = cloIndex.get(`${courseKey}:${row.cloCode}`);

    if (!ploId || !cloId) continue;

    alignments.push({
      ploId,
      cloId,
      courseId: courseKey,
      level: (row.level as AlignmentLevel) ?? 'I',
      weight: row.weight ? assertNumber(row.weight, `alignment weight for ${row.ploCode}`) : undefined
    });
  }

  return alignments;
}

interface LoadProgramOptions {
  programCode: string;
  rootDir?: string;
  programVersionId?: string;
}

export async function loadProgramDataFromCsvs(options: LoadProgramOptions): Promise<ProgramData> {
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : DEFAULT_DATA_ROOT;
  const [programRows, courseRows, termPlanRows, outcomeRows, alignmentRows] = await Promise.all([
    readCsvRecords(path.resolve(rootDir, 'programs.csv')),
    readCsvRecords(path.resolve(rootDir, 'courses.csv')),
    readCsvRecords(path.resolve(rootDir, 'termplan.csv')),
    readCsvRecords(path.resolve(rootDir, 'outcomes.csv')),
    readCsvRecords(path.resolve(rootDir, 'alignments.csv'))
  ]);

  const programRow = programRows.find(row => row.code === options.programCode);
  if (!programRow) {
    throw new Error(`Program code ${options.programCode} not found in programs.csv`);
  }

  const filteredTermRows = termPlanRows.filter(row => row.programCode === options.programCode);
  if (!filteredTermRows.length) {
    throw new Error(`No term plan rows found for program ${options.programCode}.`);
  }

  const courseKeySet = new Set(filteredTermRows.map(row => toCourseKey(row.subject, row.number)));
  const courseRowMap = new Map(courseRows.map(row => [toCourseKey(row.subject, row.number), row]));
  assertTermPlanCourses(filteredTermRows, courseRowMap);

  const courseEntries = buildCourseEntries(courseRows, courseKeySet);
  const courseLookup = new Map<string, ProgramCourse>(
    courseEntries.map((course: ProgramCourse) => [course.id, course] as const)
  );
  const termPlans = buildTermPlans(filteredTermRows, courseLookup);

  const outcomesBase = buildOutcomes(options.programCode, outcomeRows, courseLookup);
  const alignments = buildAlignments(options.programCode, alignmentRows, outcomesBase.plos, outcomesBase.clos);

  const programVersionId = options.programVersionId
    ? options.programVersionId
    : `${options.programCode}:${programRow.catalogYear}`;

  const data: ProgramData = {
    programVersionId,
    programCode: programRow.code,
    programName: programRow.name,
    catalogYear: programRow.catalogYear,
    degreeType: programRow.degreeType,
    courses: courseEntries,
    termPlans,
    outcomes: {
      plos: outcomesBase.plos,
      clos: outcomesBase.clos,
      alignments
    }
  };

  return ProgramDataSchema.parse(data);
}
