# Next Steps: Week 2 - RLS & Stripe Webhooks

**Status**: Ready to Begin  
**Prerequisites**: Authentication system complete ✅  
**Estimated Time**: 8-10 hours

---

## 📋 This Week's Goals

1. ✅ **Complete Multi-Tenant RLS** - Add RLS policies to all remaining tables
2. ✅ **Stripe Webhook Handler** - Process subscription events
3. ✅ **Subscription Flow** - Complete end-to-end signup → payment → provision

---

## Part 1: Multi-Tenant RLS Policies (3-4 hours)

### Tables Needing RLS

Based on the codebase scan, these tables need RLS policies:

#### From Supabase (scenario modeling page):
- `simple_programs`
- `simple_courses`
- `simple_alignments`
- `learning_outcomes`

#### From compliance monitoring:
- `compliance_monitor_runs`
- `compliance_snapshots`
- `compliance_alerts`

### Migration File Structure

Create: `supabase/migrations/20251016001000_rls_policies.sql`

```sql
-- Enable RLS on all tables
ALTER TABLE simple_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_alignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for simple_programs
CREATE POLICY "Users can view programs in their institution"
  ON simple_programs FOR SELECT
  USING (institution_id = current_user_institution_id());

CREATE POLICY "Editors can create programs in their institution"
  ON simple_programs FOR INSERT
  WITH CHECK (
    institution_id = current_user_institution_id()
    AND (has_role('admin') OR has_role('editor'))
  );

CREATE POLICY "Editors can update programs in their institution"
  ON simple_programs FOR UPDATE
  USING (
    institution_id = current_user_institution_id()
    AND (has_role('admin') OR has_role('editor'))
  );

CREATE POLICY "Admins can delete programs in their institution"
  ON simple_programs FOR DELETE
  USING (
    institution_id = current_user_institution_id()
    AND has_role('admin')
  );

-- Similar policies for other tables...
```

### Testing RLS

Create test script: `scripts/test-rls.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Test with different users
async function testRLS() {
  const supabase1 = createClient(url, key) // User 1 (Institution A)
  const supabase2 = createClient(url, key) // User 2 (Institution B)
  
  // Try to query each other's data
  const { data: user1Programs } = await supabase1
    .from('simple_programs')
    .select('*')
  
  const { data: user2Programs } = await supabase2
    .from('simple_programs')
    .select('*')
  
  // Should not see each other's data
  console.log('User 1 programs:', user1Programs)
  console.log('User 2 programs:', user2Programs)
}
```

---

## Part 2: Stripe Webhook Handler (4-5 hours)

### Step 1: Create Webhook Route

Create: `apps/web/app/api/stripe/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
  }
  
  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // 1. Get customer details
  // 2. Create institution
  // 3. Create subscription record
  // 4. Seed default data (programs, courses, etc.)
  // 5. Send welcome email
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update subscription status to 'active'
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Update subscription status to 'past_due'
  // Send alert email
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update subscription details
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription status to 'canceled'
  // Send cancellation email
}
```

### Step 2: Update Checkout Flow

Modify: `apps/web/app/api/checkout/route.ts`

```typescript
export async function POST(request: Request) {
  const { email, priceId, institutionName, state } = await request.json()
  
  // Create Stripe checkout session with metadata
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?canceled=true`,
    metadata: {
      institutionName,
      state,
      email,
    },
  })
  
  return NextResponse.json({ url: session.url })
}
```

### Step 3: Create Welcome Page

Create: `apps/web/app/welcome/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function WelcomePage() {
  const [status, setStatus] = useState('processing')
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  
  useEffect(() => {
    async function checkSession() {
      // Poll for institution creation
      const response = await fetch(`/api/checkout/status?session_id=${sessionId}`)
      const data = await response.json()
      
      if (data.status === 'complete') {
        setStatus('complete')
        // Redirect to dashboard after 3 seconds
        setTimeout(() => router.push('/enterprise/dashboard'), 3000)
      } else if (data.status === 'processing') {
        // Keep polling
        setTimeout(checkSession, 2000)
      } else {
        setStatus('error')
      }
    }
    
    if (sessionId) {
      checkSession()
    }
  }, [sessionId])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'processing' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-8 text-2xl font-bold">Setting up your account...</h2>
          <p className="mt-2 text-gray-600">This will only take a moment</p>
        </div>
      )}
      
      {status === 'complete' && (
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold">Welcome to Map My Curriculum!</h2>
          <p className="mt-2 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      )}
    </div>
  )
}
```

### Step 4: Configure Stripe Webhook

```bash
# Local testing with Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Production setup (in Stripe Dashboard)
1. Go to Developers → Webhooks
2. Add endpoint: https://your-domain.com/api/stripe/webhook
3. Select events:
   - checkout.session.completed
   - invoice.payment_succeeded
   - invoice.payment_failed
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET
```

---

## Part 3: Testing End-to-End Flow (1-2 hours)

### Test Checklist

```bash
# 1. Start development server
pnpm dev

# 2. Start Stripe CLI (for local webhook testing)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 3. Test signup flow
# - Go to /signup
# - Fill in details
# - Click "Get Started"
# - Complete Stripe checkout (use test card: 4242 4242 4242 4242)
# - Should redirect to /welcome
# - Institution should be created
# - Subscription should be active
# - User should be redirected to dashboard

# 4. Test authentication
# - Sign out
# - Sign in with new account
# - Access dashboard (should work)
# - Try to access admin routes (should be denied for non-admins)

# 5. Test RLS
# - Create second test institution
# - Sign in as each user
# - Try to view the other's programs (should fail)

# 6. Test subscription updates
# - Trigger invoice.payment_failed event
# - Check subscription status updates
# - Check alert is created
```

---

## 📝 Implementation Checklist

### RLS Policies
- [ ] Create migration file with RLS policies
- [ ] Enable RLS on all tables
- [ ] Add SELECT policies (view own institution)
- [ ] Add INSERT policies (editors can create)
- [ ] Add UPDATE policies (editors can update)
- [ ] Add DELETE policies (admins only)
- [ ] Test with multiple users
- [ ] Verify cross-tenant access is blocked

### Stripe Webhooks
- [ ] Create webhook route handler
- [ ] Handle `checkout.session.completed`
- [ ] Handle `invoice.payment_succeeded`
- [ ] Handle `invoice.payment_failed`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Create welcome page
- [ ] Update checkout flow with metadata
- [ ] Configure webhook in Stripe dashboard
- [ ] Test with Stripe CLI locally
- [ ] Test with test card on staging

### Integration
- [ ] Update sign-up page to go through Stripe
- [ ] Create institution after payment
- [ ] Assign first user as admin
- [ ] Seed default data (optional)
- [ ] Send welcome email (optional)
- [ ] Handle failed payments gracefully
- [ ] Add error logging

### Documentation
- [ ] Update deployment guide
- [ ] Document webhook setup
- [ ] Add troubleshooting section
- [ ] Update environment variables list

---

## 🚀 Quick Start

```bash
# 1. Apply RLS migration
# Go to Supabase Dashboard → SQL Editor
# Run: supabase/migrations/20251016001000_rls_policies.sql

# 2. Install Stripe CLI (if not already)
brew install stripe/stripe-cli/stripe
stripe login

# 3. Set up webhook for local testing
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret to .env:
# STRIPE_WEBHOOK_SECRET=whsec_...

# 4. Start development
pnpm dev

# 5. Test signup flow
# Open http://localhost:3000/signup
# Fill in form and use test card: 4242 4242 4242 4242
```

---

## 📚 Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

**Prepared By**: GitHub Copilot  
**Date**: October 16, 2025  
**Next Review**: After RLS & Webhooks Complete
