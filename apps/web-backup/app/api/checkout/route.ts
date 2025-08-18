import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (secret) {
  stripe = new Stripe(secret, { apiVersion: '2023-10-16' });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Plan = 'essential' | 'growth' | 'district';
interface Body { email: string; institution?: string; state?: string; plan: Plan; }

function priceId(plan: Plan) {
  switch (plan) {
    case 'essential': return process.env.NEXT_PUBLIC_PRICE_ESSENTIAL;
    case 'growth': return process.env.NEXT_PUBLIC_PRICE_GROWTH;
    case 'district': return process.env.NEXT_PUBLIC_PRICE_DISTRICT;
  }
}

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  try {
    const body = (await req.json()) as Body;
    if (!body.email || !body.plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const pid = priceId(body.plan);
    if (!pid) return NextResponse.json({ error: 'Price ID not set for plan' }, { status: 400 });
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: body.email,
      line_items: [{ price: pid, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { institution: body.institution || '', state: body.state || '', plan: body.plan },
      success_url: `${origin}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?canceled=1`
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Checkout error', e);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
