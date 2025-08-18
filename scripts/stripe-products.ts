/**
 * One-time helper script to create Stripe Products and recurring Prices for plans.
 * Run: pnpm stripe:setup (ensure STRIPE_SECRET_KEY is set in environment).
 */
import { config } from 'dotenv';
import Stripe from 'stripe';

// Load environment variables from .env file
config();

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error('Missing STRIPE_SECRET_KEY env. Aborting.');
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

interface PlanDef { key: string; name: string; amount: number; interval: 'month'|'year'; description: string; }
const plans: PlanDef[] = [
  { key: 'essential', name: 'Essential', amount: 9900, interval: 'year', description: 'Essential annual subscription' },
  { key: 'growth', name: 'Growth', amount: 24900, interval: 'year', description: 'Growth annual subscription' },
  { key: 'district', name: 'District / System', amount: 0, interval: 'year', description: 'Custom enterprise subscription (manual quote)' }
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
  return stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: plan.amount,
    recurring: { interval: plan.interval },
    metadata: { plan_key: plan.key }
  });
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
  console.log('NEXT_PUBLIC_PRICE_ESSENTIAL=', results['essential']);
  console.log('NEXT_PUBLIC_PRICE_GROWTH=', results['growth']);
  console.log('NEXT_PUBLIC_PRICE_DISTRICT=', results['district']);
}

main().catch(e => { console.error(e); process.exit(1); });
