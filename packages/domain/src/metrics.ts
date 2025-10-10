export interface ComputedMetrics {
  program: {
    totalCredits: number;
    maxTermCredits: number;
  };
  core: {
    totalCredits: number;
    areaCredits: Record<string, number>;
    areaBreakdown: Record<string, { credits: number; courses: string[] }>;
  };
  transfer: {
    businessFOSC: {
      missing: string[];
      missingCount: number;
      complete: boolean;
    };
  };
  outcomes: {
    ploMasteryCoveragePct: number;
  };
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
  let coreAreaCredits: Record<string, number> = {};
  let coreTotalCredits = 0;
  
  for (const c of input.courses) {
    if (c.coreArea) {
      coreTotalCredits += c.credits;
      if (!coreAreaBreakdown[c.coreArea]) {
        coreAreaBreakdown[c.coreArea] = { credits: 0, courses: [] };
        coreAreaCredits[c.coreArea] = 0;
      }
      coreAreaBreakdown[c.coreArea].credits += c.credits;
      coreAreaBreakdown[c.coreArea].courses.push(`${c.subject}${c.number}`);
      coreAreaCredits[c.coreArea] += c.credits;
    }
  }
  
  const foundationSubjects = new Set(input.businessFoundationSubjects ?? ['ACCT','ECON','BUSI','BCIS','MATH','SPCH']);
  const offeredSubjects = new Set(input.courses.map(c=>c.subject));
  const missing = Array.from(foundationSubjects).filter(s=>!offeredSubjects.has(s));
  const businessFOSC = { missing, missingCount: missing.length, complete: missing.length === 0 };
  
  const ploMasteryByPlo = new Set(
    input.alignments.filter(a=>a.level==='M').map(a=>a.ploId)
  );
  const ploMasteryCoveragePct = input.plos.length ? Math.round( (ploMasteryByPlo.size / input.plos.length) * 100 ) : 0;
  const maxTermCredits = input.termPlans.reduce((m,t)=> Math.max(m, t.credits), 0);
  
  return {
    program: {
      totalCredits,
      maxTermCredits
    },
    core: {
      totalCredits: coreTotalCredits,
      areaCredits: coreAreaCredits,
      areaBreakdown: coreAreaBreakdown
    },
    transfer: {
      businessFOSC
    },
    outcomes: {
      ploMasteryCoveragePct
    }
  };
}
