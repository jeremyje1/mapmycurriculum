# Vercel Deployment - In Progress ✅

## Deployment Status

**Current Status**: Building  
**Project**: mapmycurriculum (correct project)  
**Deployment URL**: https://mapmycurriculum-ghlwh9bfq-jeremys-projects-73929cad.vercel.app  
**Production URL**: https://platform.mapmycurriculum.com (after DNS configured)

## What Was Fixed

### 1. Linked to Correct Vercel Project
- ✅ Removed incorrect project link
- ✅ Linked to `jeremys-projects-73929cad/mapmycurriculum`
- ✅ Verified this is the project with existing production deployments

### 2. Fixed Sign-In Page Build Error
**Problem**: `useSearchParams()` required Suspense boundary  
**Solution**: Wrapped the sign-in form in a Suspense component

```tsx
// apps/web/app/sign-in/page.tsx
export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
```

### 3. Environment Variables Configured
All required environment variables are set in production:
- ✅ `SENDGRID_API_KEY` - For email sending
- ✅ `FROM_EMAIL` - info@northpathstrategies.org  
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Database connection
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase auth
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Admin operations
- ✅ `DATABASE_URL` - PostgreSQL connection
- ✅ `STRIPE_SECRET_KEY` - Payment processing
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe client
- ✅ `STRIPE_WEBHOOK_SECRET` - Webhook verification
- ✅ `NEXT_PUBLIC_PRICE_ID` - Subscription pricing
- ✅ All other required env vars

## Deployment Details

### Build Information
- **Framework**: Next.js 14.2.5
- **Build Time**: ~30-45 seconds
- **Root Directory**: Project root (apps/web via package.json)
- **Node Version**: Latest
- **Build Command**: `npm run build`

### Files Deployed
- Marketing landing page: `/marketing/coming-soon.html`
- Contact API: `/api/contact`
- Full Next.js application
- Authentication system
- Dashboard pages

## Once Build Completes

### 1. Test Contact Form
Visit your marketing page:
```
https://mapmycurriculum-ghlwh9bfq-jeremys-projects-73929cad.vercel.app/marketing/coming-soon.html
```

Fill out and submit the contact form. You should receive two emails:
1. **Notification email** to info@northpathstrategies.org with form details
2. **Confirmation email** to the submitter

### 2. Test Contact API Directly
```bash
curl -X POST https://mapmycurriculum-ghlwh9bfq-jeremys-projects-73929cad.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "yourtest@example.com",
    "institution": "Test University",
    "message": "Testing SendGrid integration",
    "timestamp": "2025-10-16T12:00:00Z"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### 3. Configure Custom Domain (platform.mapmycurriculum.com)

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/jeremys-projects-73929cad/mapmycurriculum
2. Click **Settings** → **Domains**
3. Add domain: `platform.mapmycurriculum.com`
4. Follow DNS instructions from Vercel
5. Wait for DNS propagation (5-60 minutes)

#### Option B: Via CLI
```bash
cd /Users/jeremy.estrella/Desktop/mapmycurriculum
vercel domains add platform.mapmycurriculum.com
```

### 4. Update DNS Records
Add these records to your domain registrar:

**CNAME Record**:
```
Type: CNAME
Name: platform
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

Or if using A records:
```
Type: A
Name: platform
Value: 76.76.21.21
TTL: 3600
```

### 5. Verify Sender Email in SendGrid
1. Go to https://app.sendgrid.com/settings/sender_auth
2. Click "Verify a Single Sender"
3. Enter: info@northpathstrategies.org
4. Check your email inbox for verification link
5. Click verification link

## Marketing Page URL

Once DNS is configured, your marketing page will be available at:
```
https://platform.mapmycurriculum.com/marketing/coming-soon.html
```

## WordPress Integration

To use the marketing page in WordPress:

1. **Copy HTML**: Copy all content from `marketing/coming-soon.html`
2. **Create New Page** in WordPress
3. **Switch to HTML/Code Editor**
4. **Paste HTML**
5. **Update Form Endpoint**: Change `/api/contact` to full URL:
   ```javascript
   const response = await fetch('https://platform.mapmycurriculum.com/api/contact', {
```
6. **Publish Page**

## Monitoring & Logs

### View Deployment Logs
```bash
vercel logs https://mapmycurriculum-ghlwh9bfq-jeremys-projects-73929cad.vercel.app
```

### View Function Logs (for /api/contact)
```bash
vercel logs --follow
```

### Vercel Dashboard
https://vercel.com/jeremys-projects-73929cad/mapmycurriculum/deployments

## Troubleshooting

### If Contact Form Doesn't Work
1. Check SendGrid API key is correct in Vercel env vars
2. Verify sender email (info@northpathstrategies.org) in SendGrid
3. Check Vercel function logs for errors
4. Verify email doesn't land in spam folder

### If Build Fails Again
1. Check build logs in Vercel dashboard
2. Look for specific error messages
3. Verify all environment variables are set

### If Emails Don't Arrive
1. Check SendGrid Activity: https://app.sendgrid.com/email_activity
2. Verify API key is active
3. Check sender email is verified
4. Look in spam/junk folders

## Next Steps

1. ⏳ **Wait for build to complete** (~2 more minutes)
2. ✅ **Test contact form** on deployed URL
3. ✅ **Verify emails arrive** at info@northpathstrategies.org  
4. ✅ **Configure custom domain** (platform.mapmycurriculum.com)
5. ✅ **Verify sender email** in SendGrid
6. ✅ **Deploy to WordPress** (optional)

## Support Links

- **Vercel Project**: https://vercel.com/jeremys-projects-73929cad/mapmycurriculum
- **SendGrid Dashboard**: https://app.sendgrid.com/
- **SendGrid API Keys**: https://app.sendgrid.com/settings/api_keys
- **SendGrid Sender Auth**: https://app.sendgrid.com/settings/sender_auth
- **Vercel Domains**: https://vercel.com/docs/custom-domains

---

## Contact Endpoint Details

**Production URL**: `https://platform.mapmycurriculum.com/api/contact`

**Method**: POST  
**Content-Type**: application/json

**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (required)",
  "phone": "string (optional)",
  "institution": "string (required)",
  "role": "string (optional)",
  "institutionType": "string (optional)",
  "interest": "string (optional)",
  "message": "string (required)",
  "timestamp": "string (ISO 8601)"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Error Response (500)**:
```json
{
  "error": "Failed to send email",
  "details": "Error message"
}
```

---

**Deployment initiated**: October 16, 2025, 11:54 PM UTC  
**Estimated completion**: ~2-3 minutes from initiation  
**Status**: Building... 🚀
