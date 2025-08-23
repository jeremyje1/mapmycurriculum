/**
 * Verifies that active annual Stripe Prices match the expected amounts for each plan.
 * Usage: npm run stripe:verify (ensure STRIPE_SECRET_KEY is set)
 */
import { config } from 'dotenv';
import Stripe from 'stripe';

config();

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error('Missing STRIPE_SECRET_KEY env. Aborting.');
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

interface PlanCheck { key: string; name: string; expected: number; }
// Keep in sync with apps/web/lib/plans.ts & stripe-products.ts
const plans: PlanCheck[] = [
  { key: 'school_starter', name: 'School Starter', expected: 150000 },
  { key: 'school_pro', name: 'School Pro', expected: 350000 },
  { key: 'district_pro', name: 'District Pro', expected: 950000 },
  { key: 'district_enterprise', name: 'District Enterprise', expected: 1800000 },
  { key: 'department', name: 'Department', expected: 600000 },
  { key: 'college', name: 'College', expected: 1800000 },
  { key: 'institution', name: 'Institution', expected: 4500000 }
];

function formatUsd(cents: number | null | undefined) {
  if (cents == null) return '—';
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

async function findProduct(plan: PlanCheck) {
  // Prefer metadata search; fallback to name search if metadata not set yet.
  const byMeta = await stripe.products.search({ query: `metadata['plan_key']:'${plan.key}' AND active:'true'` }).catch(() => null);
  if (byMeta && byMeta.data[0]) return byMeta.data[0];
  const byName = await stripe.products.search({ query: `name:'${plan.name}' AND active:'true'` }).catch(() => null);
  return byName?.data[0] || null;
}

async function verify() {
  console.log('Verifying Stripe annual prices...');
  const rows: Array<Record<string, string>> = [];
  for (const plan of plans) {
    const product = await findProduct(plan);
    if (!product) {
      rows.push({ plan: plan.key, status: 'MISSING_PRODUCT', expected: formatUsd(plan.expected), found: '—', price_id: '—' });
      continue;
    }
    const prices = await stripe.prices.search({ query: `product:'${product.id}' AND active:'true' AND currency:'usd'` });
    const annual = prices.data.filter(p => p.recurring?.interval === 'year');
    let match = annual.find(p => p.unit_amount === plan.expected);
    const primary = annual[0] || null;
    let status: string;
    if (match) status = 'OK'; else if (annual.length === 0) status = 'NO_ANNUAL_PRICE'; else status = 'MISMATCH';
    const used = match || primary;
    rows.push({
      plan: plan.key,
      status,
      expected: formatUsd(plan.expected),
      found: formatUsd(used?.unit_amount || null),
      price_id: used?.id || '—'
    });
  }
  // Simple console table
  const headers = Object.keys(rows[0] || {});
  const line = (cols: string[]) => cols.map(c => c.padEnd(18)).join('');
  console.log('\n' + line(headers));
  console.log(line(headers.map(() => '-'.repeat(12))));
  for (const r of rows) console.log(line(headers.map(h => r[h] || '')));
  console.log('\nLegend:');
  console.log('  OK = Active annual price matches expected');
  console.log('  MISMATCH = Annual price exists but amount differs (consider creating new price)');
  console.log('  NO_ANNUAL_PRICE = No active annual price; run stripe-products script');
  console.log('  MISSING_PRODUCT = No active product found; run stripe-products script');
  const mismatches = rows.filter(r => r.status !== 'OK');
  if (mismatches.length) {
    console.log(`\nAction needed for ${mismatches.length} plan(s).`);
  } else {
    console.log('\nAll plan prices verified.');
  }
}

verify().catch(e => { console.error(e); process.exit(1); });
