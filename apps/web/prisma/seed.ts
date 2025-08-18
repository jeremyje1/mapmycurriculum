import { PrismaClient, DegreeType, OutcomeLevel } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const institution = await prisma.institution.create({ data: { name: 'Demo College', state: 'US-TX' } });
  const program = await prisma.program.create({ data: { institutionId: institution.id, code: 'BUS-AA-TX', name: 'Associate of Arts in Business (Texas Transfer Pathway)', degreeType: DegreeType.AA } });
  const programVersion = await prisma.programVersion.create({ data: { programId: program.id, catalogYear: '2025-2026', effectiveFrom: new Date('2025-08-01') } });

  const courseMap: Record<string, string> = {};
  async function createCourse(subject: string, number: string, title: string, credits: number) {
    const key = `${subject}_${number}`;
    if (courseMap[key]) return courseMap[key];
    const c = await prisma.course.create({ data: { subject, number, title, credits, cipCode: '52.0101' } });
    courseMap[key] = c.id;
    return c.id;
  }

  const terms: Array<Array<[string,string,string,number]>> = [
    [ ['ENGL','1301','Composition I',3], ['MATH','1325','Calculus for Business & Social Sciences',3], ['HIST','1301','United States History I',3], ['SPCH','1315','Public Speaking',3], ['BUSI','1301','Business Principles',3] ],
    [ ['ENGL','1302','Composition II',3], ['BIOL','1308','Biology for Non-Science Majors I',3], ['HIST','1302','United States History II',3], ['PSYC','2301','General Psychology',3], ['ACCT','2301','Principles of Financial Accounting',3] ],
    [ ['GOVT','2305','Federal Government',3], ['PHYS','1301','College Physics I',3], ['PHIL','1301','Introduction to Philosophy',3], ['ECON','2301','Principles of Macroeconomics',3], ['ACCT','2302','Principles of Managerial Accounting',3] ],
    [ ['GOVT','2306','Texas Government',3], ['ARTS','1301','Art Appreciation',3], ['COSC','1301','Intro to Computing',3], ['ECON','2302','Principles of Microeconomics',3], ['BCIS','1305','Business Computer Applications',3], ['BUSI','2305','Business Statistics',3] ]
  ];

  for (let t=0; t<terms.length; t++) {
    const termPlan = await prisma.termPlan.create({ data: { programVersionId: programVersion.id, termNumber: t+1 } });
    for (const [subject, number, title, credits] of terms[t]) {
      const courseId = await createCourse(subject, number, title, credits);
      await prisma.termCourse.create({ data: { termPlanId: termPlan.id, courseId, required: true } });
    }
  }

  const plo1 = await prisma.programOutcome.create({ data: { programVersionId: programVersion.id, code: 'PLO1', description: 'Apply accounting and quantitative analysis to business decisions.' } });
  const plo2 = await prisma.programOutcome.create({ data: { programVersionId: programVersion.id, code: 'PLO2', description: 'Demonstrate professional written and oral communication.' } });

  async function addClo(subject: string, number: string, code: string, level: OutcomeLevel, description: string, ploId: string) {
    const course = await prisma.course.findFirstOrThrow({ where: { subject, number } });
    const clo = await prisma.courseOutcome.create({ data: { courseId: course.id, code, level, description } });
    await prisma.alignment.create({ data: { ploId, cloId: clo.id } });
  }

  await addClo('MATH','1325','CLO_MATH1325_1',OutcomeLevel.I,'Use derivatives in marginal analysis',plo1.id);
  await addClo('ACCT','2301','CLO_ACCT2301_1',OutcomeLevel.D,'Prepare and interpret basic financial statements',plo1.id);
  await addClo('ACCT','2302','CLO_ACCT2302_1',OutcomeLevel.M,'Analyze cost behavior and budgeting',plo1.id);
  await addClo('ENGL','1302','CLO_ENGL1302_1',OutcomeLevel.D,'Write sourced analytical essays',plo2.id);
  await addClo('SPCH','1315','CLO_SPCH1315_1',OutcomeLevel.M,'Deliver audience-centered oral presentations',plo2.id);

  console.log('Seed complete');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
