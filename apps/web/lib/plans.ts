export type PlanKey =
  | 'school_starter'
  | 'school_pro'
  | 'district_pro'
  | 'district_enterprise'
  | 'department'
  | 'college'
  | 'institution';

export interface PlanDef {
  key: PlanKey;
  label: string;
  segment: 'k12' | 'highered';
  annualCents: number;
  checkout: boolean; // whether self-serve checkout is enabled
  features: string[];
  envVar: string; // NEXT_PUBLIC_PRICE_* variable name
}

export const PLANS: PlanDef[] = [
  {
    key: 'school_starter',
    label: 'School Starter',
    segment: 'k12',
    annualCents: 150000,
    checkout: true,
    features: ['1 program map','3 users','Standards library','Alignment & gap analysis','1 narrative export / yr','Email support'],
    envVar: 'NEXT_PUBLIC_PRICE_SCHOOL_STARTER'
  },
  {
    key: 'school_pro',
    label: 'School Pro',
    segment: 'k12',
    annualCents: 350000,
    checkout: true,
    features: ['5 program maps','10 users','Evidence pack builder','Unlimited standards imports','CSV / API export','Priority email'],
    envVar: 'NEXT_PUBLIC_PRICE_SCHOOL_PRO'
  },
  {
    key: 'district_pro',
    label: 'District Pro',
    segment: 'k12',
    annualCents: 950000,
    checkout: false,
    features: ['Up to 10 schools (+$700 each addl)','50 program maps pooled','50 users pooled','Bulk import','Google / OIDC SSO','Connectors add-on ready'],
    envVar: 'NEXT_PUBLIC_PRICE_DISTRICT_PRO'
  },
  {
    key: 'district_enterprise',
    label: 'District Enterprise',
    segment: 'k12',
    annualCents: 1800000,
    checkout: false,
    features: ['Unlimited maps','Unlimited users','SAML / OIDC included','Connectors bundle','Quarterly success review'],
    envVar: 'NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE'
  },
  {
    key: 'department',
    label: 'Department',
    segment: 'highered',
    annualCents: 600000,
    checkout: true,
    features: ['Up to 5 program maps','10 users','Accreditation framework packs','Narrative generator','API export'],
    envVar: 'NEXT_PUBLIC_PRICE_DEPARTMENT'
  },
  {
    key: 'college',
    label: 'College',
    segment: 'highered',
    annualCents: 1800000,
    checkout: true,
    features: ['Up to 20 program maps','50 users','OIDC SSO included','LMS connector add-on','Priority support'],
    envVar: 'NEXT_PUBLIC_PRICE_COLLEGE'
  },
  {
    key: 'institution',
    label: 'Institution',
    segment: 'highered',
    annualCents: 4500000,
    checkout: false,
    features: ['Unlimited programs/users','SAML / OIDC','LMS + SIS connectors','Governance workshop','Custom reporting'],
    envVar: 'NEXT_PUBLIC_PRICE_INSTITUTION'
  }
];

export function getPlan(key: PlanKey) {
  return PLANS.find(p => p.key === key);
}

export function priceIdFor(key: PlanKey): string | undefined {
  const plan = getPlan(key);
  if (!plan) return undefined;
  return process.env[plan.envVar] as string | undefined;
}

export const CHECKOUT_ENABLED = PLANS.filter(p => p.checkout).map(p => p.key);