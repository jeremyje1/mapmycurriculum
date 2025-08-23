import { NextResponse } from 'next/server';
import { priceIdFor, CHECKOUT_ENABLED, PLANS } from '../../../lib/plans';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug = {
    env: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set (hidden)' : 'Not set',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      NEXT_PUBLIC_PRICE_STARTER_FIXED: process.env.NEXT_PUBLIC_PRICE_STARTER_FIXED || 'Not set',
      NEXT_PUBLIC_PRICE_PROFESSIONAL_FIXED: process.env.NEXT_PUBLIC_PRICE_PROFESSIONAL_FIXED || 'Not set',
      NEXT_PUBLIC_PRICE_COMPREHENSIVE_FIXED: process.env.NEXT_PUBLIC_PRICE_COMPREHENSIVE_FIXED || 'Not set',
      NEXT_PUBLIC_PRICE_ENTERPRISE: process.env.NEXT_PUBLIC_PRICE_ENTERPRISE || 'Not set',
    },
    plans: PLANS.map(p => ({
      key: p.key,
      label: p.label,
      envVar: p.envVar,
      priceId: priceIdFor(p.key),
      checkoutEnabled: CHECKOUT_ENABLED.includes(p.key)
    })),
    checkoutEnabledPlans: CHECKOUT_ENABLED
  };
  
  return NextResponse.json(debug);
}
