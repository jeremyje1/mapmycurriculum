# 🚀 Production Setup Guide - Final 3 Steps

## Current Status
- ✅ Vercel deployment: Live and working
- ✅ Supabase backend: Configured and connected
- ✅ Stripe integration: $249 pricing ready
- ✅ Environment variables: All set

## Step 1: Configure Custom Domain on Vercel

### Option A: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/jeremys-projects-73929cad/mapmycurriculum
2. Click **Settings** tab
3. Click **Domains** in sidebar
4. Add domain: `platform.mapmycurriculum.com`
5. Vercel will show DNS records needed

### Option B: Using CLI
```bash
# Add the domain
vercel domains add platform.mapmycurriculum.com --project mapmycurriculum

# Verify it's added
vercel domains ls
```

### DNS Configuration
Once added, configure DNS at your registrar (GoDaddy, Namecheap, etc.):

**Add CNAME Record:**
```
Type:  CNAME
Name:  platform
Value: cname.vercel-dns.com
TTL:   Automatic or 3600
```

**Verification:**
- DNS propagation takes 5-60 minutes
- Check status: `dig platform.mapmycurriculum.com`
- Vercel will auto-verify once DNS propagates

---

## Step 2: Configure Stripe Webhook for Production

### Get Your Production URL
After domain setup completes:
```
Production URL: https://platform.mapmycurriculum.com
```

Or use current Vercel URL:
```
Current URL: https://mapmycurriculum-4jrzyx9f3-jeremys-projects-73929cad.vercel.app
```

### Create Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. **Endpoint URL**: 
   ```
   https://platform.mapmycurriculum.com/api/stripe/webhook
   ```
   
4. **Events to listen for**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click **Add endpoint**

6. **Copy the webhook signing secret** (starts with `whsec_...`)

### Update Environment Variable

Update the webhook secret in Vercel:

```bash
# Set the new webhook secret
vercel env add STRIPE_WEBHOOK_SECRET production

# When prompted, paste the whsec_... value from Stripe
```

Or via dashboard:
1. Go to Vercel project → Settings → Environment Variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Edit and paste new value
4. **Important**: Redeploy after updating

### Verify Webhook
```bash
# Send a test event from Stripe dashboard
# Check webhook logs in Stripe dashboard
# Check Vercel logs for confirmation
```

---

## Step 3: Update Supabase Auth Redirect URLs

### Current Redirect URLs
Your app needs to redirect after authentication. Update these in Supabase:

1. Go to https://supabase.com/dashboard/project/dsxiiakytpufxsqlimkf
2. Click **Authentication** in sidebar
3. Click **URL Configuration**

### Add Production URLs

**Site URL:**
```
https://platform.mapmycurriculum.com
```

**Redirect URLs** (add both):
```
https://platform.mapmycurriculum.com/auth/callback
https://platform.mapmycurriculum.com/auth/confirm
https://platform.mapmycurriculum.com/**
```

**Keep Development URLs** (for local testing):
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/**
```

### Email Template Variables
Update email templates if needed:
- Click **Email Templates**
- Update `{{ .ConfirmationURL }}` redirect to use production domain

---

## ✅ Verification Checklist

### Domain Setup
- [ ] Domain added to Vercel project
- [ ] DNS CNAME record created
- [ ] DNS propagation complete (check with `dig`)
- [ ] SSL certificate issued automatically by Vercel
- [ ] Site accessible at `https://platform.mapmycurriculum.com`

### Stripe Webhook
- [ ] Webhook endpoint created in Stripe dashboard
- [ ] All required events selected
- [ ] Webhook secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` updated in Vercel
- [ ] App redeployed after secret update
- [ ] Test webhook sent successfully from Stripe
- [ ] Webhook logs show successful delivery

### Supabase Auth
- [ ] Production domain added to Site URL
- [ ] Redirect URLs configured
- [ ] Email templates updated (if customized)
- [ ] Test signup/login flow works
- [ ] Email confirmation redirects properly
- [ ] Password reset works

---

## 🧪 End-to-End Testing

Once all 3 steps are complete, test the full flow:

### 1. Test Authentication
```bash
# Visit production site
open https://platform.mapmycurriculum.com

# Test:
1. Click "Sign Up"
2. Enter email/password
3. Check email for confirmation
4. Click confirmation link
5. Should redirect to dashboard
```

### 2. Test Stripe Checkout
```bash
# Visit debug endpoint
curl https://platform.mapmycurriculum.com/api/debug-checkout

# Should show:
✅ NEXT_PUBLIC_PRICE_ID=price_1SGk9KCzPgWh4DF8Vw8mAR5d
✅ pricing.full_access.price=24900

# Test checkout:
1. Click "Subscribe" or "Get Started"
2. Should redirect to Stripe checkout
3. Use test card: 4242 4242 4242 4242
4. Complete checkout
5. Should redirect back to app
6. Webhook should process payment
7. User should have access
```

### 3. Test Database Operations
```bash
# Test that app can read/write to Supabase
1. Create a new institution
2. Create a program
3. Add courses
4. Create alignments
5. Verify data persists
```

---

## 🎯 Quick Commands Reference

### Domain Setup
```bash
# Add domain to Vercel
vercel domains add platform.mapmycurriculum.com --project mapmycurriculum

# Check domain status
vercel domains ls

# Check DNS propagation
dig platform.mapmycurriculum.com

# Or use nslookup
nslookup platform.mapmycurriculum.com
```

### Environment Variables
```bash
# Add/update environment variable
vercel env add STRIPE_WEBHOOK_SECRET production

# List all environment variables
vercel env ls

# Trigger redeployment after env change
vercel --prod
```

### Supabase
```bash
# Check connection
supabase status

# View migrations
supabase migration list

# Access database
supabase db remote commit
```

### Stripe
```bash
# List webhooks (if CLI installed)
stripe webhooks list

# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 📊 Post-Setup Monitoring

### Vercel Logs
```bash
# View production logs
vercel logs --prod

# Follow logs in real-time
vercel logs --prod --follow
```

### Supabase Dashboard
- Monitor database queries
- Check auth activity
- View storage usage
- Review logs

### Stripe Dashboard
- Monitor webhook deliveries
- Track subscriptions
- View customer activity
- Check for failed payments

---

## 🆘 Troubleshooting

### Domain not resolving
```bash
# Check DNS propagation
dig platform.mapmycurriculum.com

# Expected output should show:
# platform.mapmycurriculum.com. 300 IN CNAME cname.vercel-dns.com.

# If not showing, wait longer or check DNS config
```

### Webhook failing
```bash
# Check webhook secret is set
vercel env ls | grep STRIPE_WEBHOOK_SECRET

# View webhook logs in Stripe dashboard
# View Vercel logs for errors
vercel logs --prod | grep webhook
```

### Auth redirect not working
```bash
# Verify redirect URLs in Supabase dashboard
# Check browser console for errors
# Verify environment variables are set
vercel env ls | grep SUPABASE
```

---

## 🎉 You're Done When...

✅ `platform.mapmycurriculum.com` loads your app with SSL  
✅ Users can sign up and receive confirmation emails  
✅ Stripe checkout completes successfully  
✅ Webhooks show "Succeeded" in Stripe dashboard  
✅ Subscriptions are created in Stripe  
✅ Users can access protected features after subscribing  

---

**Ready to go live!** 🚀

Your production stack:
- **Frontend/API**: Vercel (Next.js) ✅
- **Backend**: Supabase (PostgreSQL + Auth + Storage) ✅
- **Payments**: Stripe ($249 subscription) ✅
- **Domain**: platform.mapmycurriculum.com (pending setup)
