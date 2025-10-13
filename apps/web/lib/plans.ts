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

const FALLBACK_PRICE_ID = 'price_1SHikoCzPgWh4DF8cLcigK7c';
const FALLBACK_TRIAL_DAYS = 7;

export function priceIdFor(key: PlanKey = 'full_access'): string | undefined {
  const plan = getPlan(key);
  if (!plan) return undefined;
  return process.env[plan.envVar] || FALLBACK_PRICE_ID;
}

// Helper to get the single price ID directly
export function getDefaultPriceId(): string | undefined {
  return process.env.NEXT_PUBLIC_PRICE_ID || FALLBACK_PRICE_ID;
}

export function getDefaultTrialDays(): number {
  const raw = process.env.STRIPE_TRIAL_DAYS;
  if (!raw) return FALLBACK_TRIAL_DAYS;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  return FALLBACK_TRIAL_DAYS;
}

export const CHECKOUT_ENABLED = PLANS.filter(p => p.checkout).map(p => p.key);
