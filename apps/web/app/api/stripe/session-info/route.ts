import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const secret = process.env.STRIPE_SECRET_KEY;
const stripe = secret ? new Stripe(secret, { apiVersion: '2023-10-16' }) : null;

export async function GET(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    const email = session.customer_details?.email || session.customer_email;
    const metadata = session.metadata;
    
    if (!email) {
      return NextResponse.json({ error: 'No email found in session' }, { status: 404 });
    }

    return NextResponse.json({
      email,
      institution: metadata?.institution,
      state: metadata?.state,
      session_id: sessionId
    });
  } catch (error) {
    console.error('Session lookup error:', error);
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}
