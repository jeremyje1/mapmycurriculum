import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface ProgramRecord {
  code: string;
  name: string;
  degreeType: string;
  catalogYear: string;
}

export interface CourseRecord {
  subject: string;
  number: string;
  title: string;
  credits: number;
  cip?: string;
  tccns?: string;
  coreArea?: string;
}

export interface TermPlanRecord {
  programCode: string;
  term: number;
  subject: string;
  number: string;
  required: boolean;
}

export interface OutcomeRecord {
  type: 'PLO' | 'CLO';
  ownerCode: string;
  code: string;
  level: 'I' | 'D' | 'M';
  description: string;
}

export interface AlignmentRecord {
  programCode: string;
  ploCode: string;
  courseSubject: string;
  courseNumber: string;
  cloCode: string;
  level: 'I' | 'D' | 'M';
  weight: number;
}

export interface DemoData {
  programs: ProgramRecord[];
  courses: CourseRecord[];
  termPlans: TermPlanRecord[];
  outcomes: OutcomeRecord[];
  alignments: AlignmentRecord[];
}

async function readCsv<T = any>(filePath: string): Promise<T[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
    cast_date: false,
    trim: true
  });
}

export async function loadDemoData(demoDataDir: string): Promise<DemoData> {
  const programs = await readCsv<ProgramRecord>(path.join(demoDataDir, 'programs.csv'));
  
  const coursesRaw = await readCsv<any>(path.join(demoDataDir, 'courses.csv'));
  const courses: CourseRecord[] = coursesRaw.map(c => ({
    subject: c.subject,
    number: c.number,
    title: c.title,
    credits: Number(c.credits),
    cip: c.cip,
    tccns: c.tccns,
    coreArea: c.coreArea
  }));

  const termPlansRaw = await readCsv<any>(path.join(demoDataDir, 'termplan.csv'));
  const termPlans: TermPlanRecord[] = termPlansRaw.map(t => ({
    programCode: t.programCode,
    term: Number(t.term),
    subject: t.subject,
    number: t.number,
    required: t.required === 'TRUE' || t.required === true
  }));

  const outcomes = await readCsv<OutcomeRecord>(path.join(demoDataDir, 'outcomes.csv'));

  const alignmentsRaw = await readCsv<any>(path.join(demoDataDir, 'alignments.csv'));
  const alignments: AlignmentRecord[] = alignmentsRaw.map(a => ({
    programCode: a.programCode,
    ploCode: a.ploCode,
    courseSubject: a.courseSubject,
    courseNumber: a.courseNumber,
    cloCode: a.cloCode,
    level: a.level,
    weight: Number(a.weight)
  }));

  return {
    programs,
    courses,
    termPlans,
    outcomes,
    alignments
  };
}
