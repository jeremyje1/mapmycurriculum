# SendGrid Email Integration Setup Guide

**Purpose**: Enable contact form submissions from the marketing landing page  
**Email**: info@northpathstrategies.org  
**Date**: October 16, 2025

---

## 📋 Prerequisites

- SendGrid account (free tier works for low volume)
- Verified sender email address in SendGrid
- API key with Mail Send permissions

---

## 🚀 Quick Setup

### Step 1: Install SendGrid Package

```bash
cd apps/web
pnpm add @sendgrid/mail
```

### Step 2: Get SendGrid API Key

1. **Sign up for SendGrid** (if you haven't already):
   - Go to https://signup.sendgrid.com/
   - Create a free account (up to 100 emails/day free)

2. **Create an API Key**:
   - Log in to SendGrid Dashboard
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**
   - Name: `MapMyCurriculum-Contact-Form`
   - Permission: **Full Access** (or at minimum: **Mail Send** permission)
   - Copy the API key (you'll only see it once!)

3. **Verify Sender Email**:
   - Go to **Settings** → **Sender Authentication**
   - Click **Verify a Single Sender**
   - Add `info@northpathstrategies.org`
   - Check your email and click the verification link

### Step 3: Update Environment Variables

Add to your `.env` file:

```bash
# SendGrid Email Service
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=info@northpathstrategies.org
```

Add to your `.env.example`:

```bash
# --- Email Service (Required for contact form) ---
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=info@northpathstrategies.org
```

### Step 4: Update Vercel Environment Variables

If deploying to Vercel:

```bash
# Via Vercel CLI
vercel env add SENDGRID_API_KEY
# Paste your API key when prompted

vercel env add FROM_EMAIL
# Enter: info@northpathstrategies.org

# Or via Vercel Dashboard:
# 1. Go to your project settings
# 2. Navigate to Environment Variables
# 3. Add SENDGRID_API_KEY and FROM_EMAIL
# 4. Redeploy to apply changes
```

### Step 5: Test the Contact Form

#### Local Testing:

```bash
# 1. Start development server
cd apps/web
pnpm dev

# 2. Open the marketing page
# http://localhost:3000/marketing/coming-soon.html

# 3. Fill out and submit the contact form

# 4. Check:
#    - Terminal for logs
#    - info@northpathstrategies.org inbox for submission
#    - Test email inbox for confirmation
```

#### Production Testing:

```bash
# 1. Deploy to production
vercel deploy --prod

# 2. Visit your live marketing page
# https://mapmycurriculum.com/marketing/coming-soon.html

# 3. Submit a test inquiry

# 4. Verify emails received
```

---

## 📧 Email Templates

### What You'll Receive

When someone submits the contact form, you'll receive:

**To: info@northpathstrategies.org**
- Subject: "New Contact Form Submission - [Interest Type]"
- Beautiful HTML email with all form details
- Reply-to set to submitter's email
- One-click reply button

**To: Submitter**
- Subject: "Thank you for contacting Map My Curriculum"
- Confirmation message
- Expected response time (24 hours)
- Links to your websites

---

## 🧪 Testing Checklist

- [ ] SendGrid API key added to `.env`
- [ ] `@sendgrid/mail` package installed
- [ ] Sender email verified in SendGrid
- [ ] Local test submission successful
- [ ] Email received at info@northpathstrategies.org
- [ ] Confirmation email sent to submitter
- [ ] Reply-to address works correctly
- [ ] Environment variables set in Vercel
- [ ] Production test submission successful

---

## 🔍 Troubleshooting

### "Cannot find module '@sendgrid/mail'"

```bash
# Install the package
cd apps/web
pnpm add @sendgrid/mail

# Restart dev server
pnpm dev
```

### "Email service not configured"

- Check that `SENDGRID_API_KEY` is set in `.env`
- Verify the API key is correct (no extra spaces)
- Restart your dev server after adding env vars

### "403 Forbidden" from SendGrid

- Verify your sender email in SendGrid dashboard
- Check API key has Mail Send permissions
- Ensure you're not exceeding free tier limits

### Emails not arriving

- Check spam folder
- Verify sender email is verified in SendGrid
- Check SendGrid dashboard for delivery reports
- Review SendGrid activity logs for errors

### Form submission fails with 500 error

- Check browser console for errors
- Check server logs for SendGrid error messages
- Verify JSON payload is correctly formatted
- Test the `/api/contact` endpoint directly

---

## 🔒 Security Best Practices

1. **Never commit API keys**:
   - Always use environment variables
   - Keep `.env` in `.gitignore`
   - Use different keys for dev/staging/production

2. **Rate limiting** (optional but recommended):
   ```typescript
   // Add to apps/web/lib/rate-limit.ts
   import { NextRequest } from 'next/server'
   
   const requests = new Map<string, number[]>()
   
   export function rateLimit(request: NextRequest, limit: number = 5) {
     const ip = request.ip || 'unknown'
     const now = Date.now()
     const windowMs = 60 * 1000 // 1 minute
     
     const userRequests = requests.get(ip) || []
     const recentRequests = userRequests.filter(time => now - time < windowMs)
     
     if (recentRequests.length >= limit) {
       return false
     }
     
     recentRequests.push(now)
     requests.set(ip, recentRequests)
     return true
   }
   ```

3. **Spam protection**:
   - Consider adding reCAPTCHA
   - Implement honeypot fields
   - Validate email domains

---

## 📊 SendGrid Dashboard

Monitor your contact form:

1. **Activity** → View all sent emails
2. **Statistics** → Track delivery rates
3. **Suppressions** → Manage bounces/unsubscribes
4. **Email API** → Debug integration issues

---

## 💰 SendGrid Pricing

- **Free Tier**: 100 emails/day (3,000/month) - Perfect for getting started
- **Essentials**: $19.95/month - 50,000 emails/month
- **Pro**: $89.95/month - 100,000 emails/month

For a contact form, the free tier should be more than sufficient.

---

## 🔗 Useful Links

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [SendGrid Email Activity](https://app.sendgrid.com/email_activity)
- [Verify Sender](https://app.sendgrid.com/settings/sender_auth)
- [API Keys](https://app.sendgrid.com/settings/api_keys)

---

## 📞 Support

If you encounter issues:

1. Check SendGrid [Status Page](https://status.sendgrid.com/)
2. Review SendGrid [troubleshooting guide](https://docs.sendgrid.com/ui/account-and-settings/troubleshooting-delays-and-latency)
3. Contact SendGrid support (available on paid plans)
4. Check the server logs for detailed error messages

---

## ✅ Post-Setup Tasks

After SendGrid is working:

1. **Test all form fields** to ensure validation works
2. **Check email formatting** on different email clients (Gmail, Outlook, etc.)
3. **Set up email forwarding** if you want submissions to go to multiple addresses
4. **Create SendGrid templates** (optional) for more advanced email designs
5. **Set up monitoring** to track form submission rates
6. **Configure alerts** in SendGrid for delivery issues

---

**Setup Time**: ~15 minutes  
**Difficulty**: Easy  
**Cost**: Free (up to 100 emails/day)

Ready to activate? Run through the steps above and you'll be receiving contact form submissions in no time! 🚀
