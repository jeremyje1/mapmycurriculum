import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDefaultPriceId } from '../../../lib/plans';

const secret = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (secret) {
  stripe = new Stripe(secret, { apiVersion: '2023-10-16' });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body { email: string; institution?: string; state?: string; }

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  try {
    const body = (await req.json()) as Body;
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Get the single price ID
    const pid = getDefaultPriceId();
    if (!pid) return NextResponse.json({ error: 'Price ID not configured' }, { status: 400 });
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: body.email,
      line_items: [{ price: pid, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata: { institution: body.institution || '', state: body.state || '', plan: 'full_access' }
      },
      metadata: { institution: body.institution || '', state: body.state || '', plan: 'full_access' },
      success_url: `${origin}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?canceled=1`
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Checkout error:', e);
    const errorMessage = e.message || 'Failed to create checkout session';
    // Return debug info temporarily
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      debug: {
        message: errorMessage,
        stripeConfigured: !!stripe
      }
    }, { status: 500 });
  }
}
