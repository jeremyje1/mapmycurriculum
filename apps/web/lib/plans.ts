export type PlanKey =
  | 'starter'
  | 'professional'
  | 'comprehensive'
  | 'enterprise';

export interface PlanDef {
  key: PlanKey;
  label: string;
  segment: 'all'; // Now serving both K-12 and Higher Ed
  annualCents: number;
  checkout: boolean; // whether self-serve checkout is enabled
  features: string[];
  envVar: string; // NEXT_PUBLIC_PRICE_* variable name
  userLimits: {
    students: number | 'unlimited';
    faculty: number | 'unlimited';
  };
}

export const PLANS: PlanDef[] = [
  {
    key: 'starter',
    label: 'Starter Plan',
    segment: 'all',
    annualCents: 249500, // $2,495
    checkout: true,
    features: [
      'Upload curriculum maps (CSV, Excel, PDF)',
      'Auto-alignment with national/state standards',
      'AI-generated gap analysis report (10 pages)',
      'Exportable curriculum maps (CSV/Word/PDF)',
      'Email support only'
    ],
    envVar: 'NEXT_PUBLIC_PRICE_STARTER',
    userLimits: {
      students: 500,
      faculty: 50
    }
  },
  {
    key: 'professional',
    label: 'Professional Plan',
    segment: 'all',
    annualCents: 599500, // $5,995
    checkout: true,
    features: [
      'Everything in Starter',
      'AI narrative report (20–25 pages)',
      'Multi-program support (5 programs/departments)',
      'Faculty collaboration portal',
      'Scenario modeling (curriculum redesign options)',
      'Standards crosswalks (state → accreditation body)',
      'Monthly office hours session with consultant'
    ],
    envVar: 'NEXT_PUBLIC_PRICE_PROFESSIONAL',
    userLimits: {
      students: 2500,
      faculty: 200
    }
  },
  {
    key: 'comprehensive',
    label: 'Comprehensive Plan',
    segment: 'all',
    annualCents: 1250000, // $12,500
    checkout: true,
    features: [
      'Everything in Professional',
      'Custom accreditation alignment (regional + professional)',
      'AI-powered curriculum visualization dashboards',
      'Unlimited program uploads',
      'Real-time gap closure tracking',
      'Annual curriculum strategy workshop (virtual)',
      '40–50 page AI narrative & accreditation package'
    ],
    envVar: 'NEXT_PUBLIC_PRICE_COMPREHENSIVE',
    userLimits: {
      students: 10000,
      faculty: 1000
    }
  },
  {
    key: 'enterprise',
    label: 'Enterprise Transformation',
    segment: 'all',
    annualCents: 2500000, // Starting at $25,000 (custom pricing)
    checkout: false, // Contact sales
    features: [
      'Everything in Comprehensive',
      'Unlimited users and programs',
      'Dedicated customer success manager',
      'API integrations (Canvas, Banner, Workday, etc.)',
      'Power BI / Tableau dashboard embed',
      'Quarterly progress audits',
      'On-site or hybrid accreditation support',
      'Full white-glove implementation'
    ],
    envVar: 'NEXT_PUBLIC_PRICE_ENTERPRISE',
    userLimits: {
      students: 'unlimited',
      faculty: 'unlimited'
    }
  }
];

export function getPlan(key: PlanKey) {
  return PLANS.find(p => p.key === key);
}

export function priceIdFor(key: PlanKey): string | undefined {
  const plan = getPlan(key);
  if (!plan) return undefined;
  return process.env[plan.envVar];
}

export const CHECKOUT_ENABLED = PLANS.filter(p => p.checkout).map(p => p.key);