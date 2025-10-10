export type PlanKey = 'full_access';

export interface PlanDef {
  key: PlanKey;
  label: string;
  segment: 'all';
  annualCents: number;
  checkout: boolean; // whether self-serve checkout is enabled
  features: string[];
  envVar: string; // NEXT_PUBLIC_PRICE_ID variable name
  userLimits: {
    students: number | 'unlimited';
    faculty: number | 'unlimited';
  };
}

export const PLANS: PlanDef[] = [
  {
    key: 'full_access',
    label: 'Full Platform Access',
    segment: 'all',
    annualCents: 24900, // $249
    checkout: true,
    features: [
      'Upload curriculum maps (CSV, Excel, PDF)',
      'Auto-alignment with national/state standards',
      'AI-generated gap analysis reports',
      'Multi-program support',
      'Faculty collaboration portal',
      'Scenario modeling & curriculum redesign',
      'Standards crosswalks',
      'Exportable curriculum maps (CSV/Word/PDF)',
      'AI-powered visualization dashboards',
      'Unlimited program uploads',
      'Real-time gap closure tracking',
      'Email support'
    ],
    envVar: 'NEXT_PUBLIC_PRICE_ID',
    userLimits: {
      students: 'unlimited',
      faculty: 'unlimited'
    }
  }
];

export function getPlan(key: PlanKey) {
  return PLANS.find(p => p.key === key);
}

export function priceIdFor(key: PlanKey = 'full_access'): string | undefined {
  const plan = getPlan(key);
  if (!plan) return undefined;
  return process.env[plan.envVar];
}

// Helper to get the single price ID directly
export function getDefaultPriceId(): string | undefined {
  return process.env.NEXT_PUBLIC_PRICE_ID;
}

export const CHECKOUT_ENABLED = PLANS.filter(p => p.checkout).map(p => p.key);