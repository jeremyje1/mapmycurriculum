import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const secret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = secret ? new Stripe(secret, { apiVersion: '2023-10-16' }) : null;
const prisma = new PrismaClient();

async function provisionFromCheckoutSession(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email;
  const m = session.metadata || {};
  if (!email || !m.institution || !m.state) return;
  
  // Use safe find-or-create since composite unique not recognized by client yet
  let institution = await prisma.institution.findFirst({
    where: { name: m.institution, state: m.state }
  });
  if (!institution) {
    try {
      institution = await prisma.institution.create({
        data: { name: m.institution, state: m.state }
      });
    } catch (err) {
      // Handle race condition - another request may have created it
      institution = await prisma.institution.findFirst({
        where: { name: m.institution, state: m.state }
      });
      if (!institution) throw err;
    }
  }
  
  await prisma.user.upsert({
    where: { email },
    update: { institutionId: institution.id },
    create: { email, institutionId: institution.id, role: 'ADMIN' }
  });
}

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  const sig = headers().get('stripe-signature');
  const raw = await req.text();
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await provisionFromCheckoutSession(event.data.object);
    }
  } catch (err) {
    console.error('Webhook handling error', err);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
