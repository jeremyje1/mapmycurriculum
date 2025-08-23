import { NextResponse } from 'next/server';
import { PLANS, CHECKOUT_ENABLED } from '../../../lib/plans';
import Stripe from 'stripe';

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  // Test Stripe connection
  let stripeTestResult = null;
  if (stripeKey) {
    try {
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
      const account = await stripe.accounts.retrieve();
      stripeTestResult = { success: true, accountId: account.id };
    } catch (error: any) {
      stripeTestResult = { success: false, error: error.message };
    }
  }

  return NextResponse.json({
    env: {
      STRIPE_SECRET_KEY: stripeKey ? 'Set (hidden)' : 'Not set',
      STRIPE_SECRET_KEY_LENGTH: stripeKey?.length || 0,
      STRIPE_SECRET_KEY_PREFIX: stripeKey ? stripeKey.substring(0, 20) + '...' : 'N/A',
      STRIPE_SECRET_KEY_SUFFIX: stripeKey ? '...' + stripeKey.substring(stripeKey.length - 10) : 'N/A',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_PRICE_STARTER_FIXED: process.env.NEXT_PUBLIC_PRICE_STARTER_FIXED,
      NEXT_PUBLIC_PRICE_PROFESSIONAL_FIXED: process.env.NEXT_PUBLIC_PRICE_PROFESSIONAL_FIXED,
      NEXT_PUBLIC_PRICE_COMPREHENSIVE_FIXED: process.env.NEXT_PUBLIC_PRICE_COMPREHENSIVE_FIXED,
      NEXT_PUBLIC_PRICE_ENTERPRISE: process.env.NEXT_PUBLIC_PRICE_ENTERPRISE,
    },
    stripeTest: stripeTestResult,
    plans: PLANS,
    checkoutEnabledPlans: CHECKOUT_ENABLED
  });
}
