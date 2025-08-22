/**
 * One-time helper script to create Stripe Products and recurring Prices for plans.
 * Run: pnpm stripe:setup (ensure STRIPE_SECRET_KEY is set in environment).
 */
import { config } from 'dotenv';
// Node process typings (in case @types/node not globally available in this stripped config)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const process: any;
import Stripe from 'stripe';

// Load environment variables from .env file
config();

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error('Missing STRIPE_SECRET_KEY env. Aborting.');
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

interface PlanDef { key: string; name: string; amount: number; interval: 'year'; description: string; }
// Amounts are in cents (annual pricing)
const plans: PlanDef[] = [
  // K-12
  { key: 'school_starter', name: 'School Starter', amount: 150000, interval: 'year', description: 'K-12 School Starter annual subscription' },
  { key: 'school_pro', name: 'School Pro', amount: 350000, interval: 'year', description: 'K-12 School Pro annual subscription' },
  { key: 'district_pro', name: 'District Pro', amount: 950000, interval: 'year', description: 'District Pro (up to 10 schools, addl. schools billed separately)' },
  { key: 'district_enterprise', name: 'District Enterprise', amount: 1800000, interval: 'year', description: 'District Enterprise annual subscription' },
  // Higher-Ed
  { key: 'department', name: 'Department', amount: 600000, interval: 'year', description: 'Higher-Ed Department annual subscription' },
  { key: 'college', name: 'College', amount: 1800000, interval: 'year', description: 'Higher-Ed College annual subscription' },
  { key: 'institution', name: 'Institution', amount: 4500000, interval: 'year', description: 'Higher-Ed Institution annual subscription' }
];

async function ensureProduct(plan: PlanDef) {
  const search = await stripe.products.search({ query: `name:'${plan.name}' AND active:'true'` });
  if (search.data[0]) return search.data[0];
  return stripe.products.create({ name: plan.name, description: plan.description, metadata: { plan_key: plan.key } });
}

async function ensurePrice(productId: string, plan: PlanDef) {
  if (plan.amount === 0) return null;
  const existing = await stripe.prices.search({ query: `product:'${productId}' AND active:'true' AND currency:'usd'` });
  const match = existing.data.find(p => p.unit_amount === plan.amount && p.recurring?.interval === plan.interval);
  if (match) return match;
  const created = await stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: plan.amount,
    recurring: { interval: plan.interval },
    metadata: { plan_key: plan.key }
  });
  if (process.env.STRIPE_ARCHIVE_OLD_PRICES) {
    // Archive any other active annual prices for this product not matching new amount
    for (const p of existing.data) {
      if (p.id !== created.id && p.recurring?.interval === plan.interval) {
        try { await stripe.prices.update(p.id, { active: false }); console.log(`Archived old price ${p.id} for ${plan.key}`); } catch (e) { console.warn('Archive failed', p.id, e); }
      }
    }
  }
  return created;
}

async function main() {
  console.log('Ensuring products & prices...');
  const results: Record<string, string | null> = {};
  for (const plan of plans) {
    const product = await ensureProduct(plan);
    const price = await ensurePrice(product.id, plan);
    results[plan.key] = price?.id || '(custom)';
  }
  console.log('\nPrice IDs:');
  console.table(results);
  console.log('\nSet env variables:');
  console.log('NEXT_PUBLIC_PRICE_SCHOOL_STARTER=', results['school_starter']);
  console.log('NEXT_PUBLIC_PRICE_SCHOOL_PRO=', results['school_pro']);
  console.log('NEXT_PUBLIC_PRICE_DISTRICT_PRO=', results['district_pro']);
  console.log('NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE=', results['district_enterprise']);
  console.log('NEXT_PUBLIC_PRICE_DEPARTMENT=', results['department']);
  console.log('NEXT_PUBLIC_PRICE_COLLEGE=', results['college']);
  console.log('NEXT_PUBLIC_PRICE_INSTITUTION=', results['institution']);
}

main().catch(e => { console.error(e); process.exit(1); });
