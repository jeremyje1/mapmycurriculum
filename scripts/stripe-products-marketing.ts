/**
 * Creates Stripe Products & Prices for the public marketing tiers (landing page):
 *  Tier 1: One-Time Diagnostic – $4,995 (one-time)
 *  Tier 2: Monthly Subscription – $2,995 / month (recurring)
 *  Tier 3: Comprehensive Package – $9,900 (one-time)
 *  Tier 4: Enterprise Transformation – $24,000 base one-time + $5,000 per additional module (add‑on price)
 *
 * Usage:
 *   export STRIPE_SECRET_KEY=sk_test_...
 *   # (Optional) export STRIPE_ARCHIVE_OLD_PRICES=1  # to deactivate older conflicting prices
 *   npm run stripe:setup:marketing
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

interface MarketingTier {
  key: string;
  name: string;
  description: string;
  amountCents: number | null; // null => custom/no base price
  recurring?: { interval: 'month' | 'year' };
  addonPrices?: { nickname: string; amountCents: number; recurring?: { interval: 'month' | 'year' } }[];
  metadata?: Record<string, string>;
}

const tiers: MarketingTier[] = [
  {
    key: 'tier1_diagnostic',
    name: 'One-Time Diagnostic',
    description: 'One-Time Diagnostic assessment package',
    amountCents: 499500, // $4,995
    metadata: { tier: '1', billing: 'one_time', landing: 'true' }
  },
  {
    key: 'tier2_monthly_subscription',
    name: 'Monthly Subscription',
    description: 'Monthly subscription with unlimited assessments and analytics',
    amountCents: 299500, // $2,995 / month
    recurring: { interval: 'month' },
    metadata: { tier: '2', billing: 'monthly', landing: 'true' }
  },
  {
    key: 'tier3_comprehensive',
    name: 'Comprehensive Package',
    description: 'Comprehensive package (project-based) with AI narrative and strategy session',
    amountCents: 990000, // $9,900 one-time
    metadata: { tier: '3', billing: 'one_time', landing: 'true' }
  },
  {
    key: 'tier4_enterprise_transformation',
    name: 'Enterprise Transformation',
    description: 'Enterprise transformation program with real-time collaboration & advanced modeling',
    amountCents: 2400000, // $24,000 base one-time
    addonPrices: [
      { nickname: 'Additional Module', amountCents: 500000 } // $5,000 one-time add-on
    ],
    metadata: { tier: '4', billing: 'one_time', landing: 'true' }
  }
];

async function ensureProduct(tier: MarketingTier) {
  const search = await stripe.products.search({ query: `metadata['marketing_key']:'${tier.key}' AND active:'true'` }).catch(() => null);
  if (search && search.data[0]) return search.data[0];
  // fallback by name (if metadata not previously set)
  const byName = await stripe.products.search({ query: `name:'${tier.name}' AND active:'true'` }).catch(() => null);
  if (byName && byName.data[0]) {
    // attach metadata if missing
    if (!('marketing_key' in (byName.data[0].metadata || {}))) {
      await stripe.products.update(byName.data[0].id, { metadata: { ...byName.data[0].metadata, marketing_key: tier.key, ...tier.metadata } });
    }
    return byName.data[0];
  }
  return stripe.products.create({
    name: tier.name,
    description: tier.description,
    metadata: { marketing_key: tier.key, ...tier.metadata }
  });
}

async function ensurePrice(productId: string, amountCents: number, recurring: MarketingTier['recurring'] | undefined, meta: Record<string, string>, uniquenessKey: string) {
  const currency = 'usd';
  const recurringQuery = recurring ? ` AND recurring.interval:'${recurring.interval}'` : ` AND NOT recurring.interval:'month' AND NOT recurring.interval:'year'`;
  const search = await stripe.prices.search({ query: `product:'${productId}' AND active:'true' AND currency:'${currency}'${recurringQuery}` }).catch(() => null);
  const existing = search ? search.data.find(p => p.unit_amount === amountCents && (!!recurring === !!p.recurring) && (!recurring || p.recurring?.interval === recurring.interval)) : undefined;
  if (existing) return existing;
  const created = await stripe.prices.create({
    product: productId,
    currency,
    unit_amount: amountCents,
    recurring: recurring ? { interval: recurring.interval } : undefined,
    metadata: { ...meta, uniqueness_key: uniquenessKey }
  });
  if (process.env.STRIPE_ARCHIVE_OLD_PRICES && search) {
    for (const p of search.data) {
      if (p.id !== created.id) {
        try { await stripe.prices.update(p.id, { active: false }); console.log(`Archived old price ${p.id}`); } catch (e) { console.warn('Archive fail', p.id, e); }
      }
    }
  }
  return created;
}

async function main() {
  console.log('Creating / ensuring marketing tier products & prices...');
  const output: Record<string, any> = {};
  for (const tier of tiers) {
    const product = await ensureProduct(tier);
    const rows: any[] = [];
    if (tier.amountCents) {
      const price = await ensurePrice(product.id, tier.amountCents, tier.recurring, { marketing_key: tier.key, role: 'base' }, 'base');
      rows.push({ type: 'base', price: price.id, amount: tier.amountCents });
    } else {
      rows.push({ type: 'base', price: '(custom)', amount: null });
    }
    if (tier.addonPrices) {
      for (const add of tier.addonPrices) {
        const price = await ensurePrice(product.id, add.amountCents, add.recurring, { marketing_key: tier.key, role: 'addon' }, `addon_${add.nickname}`);
        rows.push({ type: 'addon', nickname: add.nickname, price: price.id, amount: add.amountCents });
      }
    }
    output[tier.key] = { product: product.id, prices: rows };
  }
  console.log('\nResulting IDs:');
  console.dir(output, { depth: null });
  console.log('\nSet any needed public env variables (if exposing checkout) like:');
  Object.entries(output).forEach(([k, v]) => {
    const base = (v as any).prices.find((p: any) => p.type === 'base');
    if (base && base.price && base.price !== '(custom)') {
      const envName = `NEXT_PUBLIC_PRICE_${k.toUpperCase()}`;
      console.log(`${envName}=${base.price}`);
    }
  });
  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
