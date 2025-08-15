export interface ComputedMetrics {
  totalCredits: number;
  generalEducationCredits: number;
  coreAreaBreakdown: Record<string, { credits: number; courses: string[] }>;
  businessFoundation: { missing: string[]; complete: boolean };
  ploMasteryCoverage: number; // percent
  maxTermCredits: number;
}

interface CalcInput {
  courses: Array<{ id: string; subject: string; number: string; credits: number; coreArea?: string }>; 
  termPlans: Array<{ termNumber: number; courseIds: string[]; credits: number }>; 
  businessFoundationSubjects?: string[]; 
  alignments: Array<{ ploId: string; cloId: string; level: 'I' | 'D' | 'M' }>; 
  plos: Array<{ id: string }>; 
}

export function computeMetrics(input: CalcInput): ComputedMetrics {
  const totalCredits = input.courses.reduce((s,c)=>s + c.credits,0);
  const coreAreaBreakdown: Record<string, { credits: number; courses: string[] }> = {};
  let generalEducationCredits = 0;
  for (const c of input.courses) {
    if (c.coreArea) {
      generalEducationCredits += c.credits;
      if (!coreAreaBreakdown[c.coreArea]) coreAreaBreakdown[c.coreArea] = { credits: 0, courses: [] };
      coreAreaBreakdown[c.coreArea].credits += c.credits;
      coreAreaBreakdown[c.coreArea].courses.push(`${c.subject}${c.number}`);
    }
  }
  const foundationSubjects = new Set(input.businessFoundationSubjects ?? ['ACCT','ECON','BUSI','BCIS','MATH','SPCH']);
  const offeredSubjects = new Set(input.courses.map(c=>c.subject));
  const missing = Array.from(foundationSubjects).filter(s=>!offeredSubjects.has(s));
  const businessFoundation = { missing, complete: missing.length === 0 };
  const ploMasteryByPlo = new Set(
    input.alignments.filter(a=>a.level==='M').map(a=>a.ploId)
  );
  const ploMasteryCoverage = input.plos.length ? Math.round( (ploMasteryByPlo.size / input.plos.length) * 100 ) : 0;
  const maxTermCredits = input.termPlans.reduce((m,t)=> Math.max(m, t.credits), 0);
  return { totalCredits, generalEducationCredits, coreAreaBreakdown, businessFoundation, ploMasteryCoverage, maxTermCredits };
}
