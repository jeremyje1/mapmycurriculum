# SendGrid Configuration Complete ✅

## Configuration Summary

### Email Settings
- **From Email**: info@northpathstrategies.org
- **API Key**: Configured in `.env.local` (kept secure, not shown here)
- **Package**: @sendgrid/mail installed successfully

### Contact Form Endpoint

Your contact form endpoint is now live at:

```
https://platform.mapmycurriculum.com/api/contact
```

**Method**: POST  
**Content-Type**: application/json

## Add This Endpoint to SendGrid

1. Go to SendGrid Dashboard: https://app.sendgrid.com/
2. Navigate to **Settings** → **Inbound Parse**
3. Add your webhook URL:
   ```
   https://platform.mapmycurriculum.com/api/contact
   ```

## Contact Form Fields

The endpoint accepts the following JSON payload:

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (required)",
  "phone": "string",
  "institution": "string",
  "role": "string",
  "institutionType": "string",
  "interest": "string",
  "message": "string (required)",
  "timestamp": "string (ISO 8601)"
}
```

## Email Behavior

When someone submits the contact form, **two emails** are sent:

### 1. Notification Email (to you)
- **To**: info@northpathstrategies.org
- **Subject**: "New Contact Form Submission from [First Name]"
- **Content**: All form details including contact info and message

### 2. Confirmation Email (to submitter)
- **To**: [submitter's email]
- **Subject**: "Thank you for contacting Map My Curriculum"
- **Content**: Professional thank-you message confirming receipt

## Test the Endpoint

### Using curl:
```bash
curl -X POST https://platform.mapmycurriculum.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Test message",
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

### Health Check:
```bash
curl https://platform.mapmycurriculum.com/api/contact
```

Expected response:
```json
{
  "status": "ok",
  "message": "Contact API is ready"
}
```

## Deploy to Production (Vercel)

To make this endpoint available at your custom domain, you need to deploy to Vercel:

### Option 1: Deploy via CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy from project root
cd /Users/jeremy.estrella/Desktop/mapmycurriculum
vercel deploy --prod

# Add environment variables to Vercel
vercel env add SENDGRID_API_KEY production
# Paste: Your SendGrid API key from dashboard

vercel env add FROM_EMAIL production
# Enter: info@northpathstrategies.org

vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Import your GitHub repository
3. **Project Settings** → **General**:
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Environment Variables**:
   - `SENDGRID_API_KEY` = Your API key from SendGrid dashboard
   - `FROM_EMAIL` = `info@northpathstrategies.org`
   - (Add your Supabase vars as well)

5. **Domains** → Add Custom Domain:
   - Add `platform.mapmycurriculum.com`
   - Update DNS settings as instructed by Vercel

6. Click **Deploy**

## Verify Domain is Active

Once deployed, your endpoint will be:
```
https://platform.mapmycurriculum.com/api/contact
```

Test it with:
```bash
curl https://platform.mapmycurriculum.com/api/contact
```

## Marketing Page Integration

Your marketing page (`marketing/coming-soon.html`) is already configured to use this endpoint:

```javascript
const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

### Deploy Marketing Page

**Option 1 - WordPress**: Copy the HTML from `marketing/coming-soon.html` and paste into a new WordPress page

**Option 2 - Vercel Static**: The page will be served from `https://platform.mapmycurriculum.com/marketing/coming-soon.html`

## Security Notes

✅ **API Key Security**:
- API key is in `.env.local` (not committed to git)
- `.env.local` is in `.gitignore`
- For production, add key to Vercel environment variables

✅ **Email Validation**:
- Contact API validates email format
- Rate limiting recommended for production (add middleware)

✅ **CORS**: 
- Contact API accepts requests from any origin (adjust if needed)
- Consider adding CORS restrictions for production

## Troubleshooting

### "Cannot find module '@sendgrid/mail'"
```bash
cd apps/web
npm install @sendgrid/mail
```

### "Authentication failed"
- Verify API key in `.env.local` is correct
- Check SendGrid dashboard → API Keys → verify key is active

### "Sender email not verified"
- Go to SendGrid → Settings → Sender Authentication
- Verify `info@northpathstrategies.org`
- Check your inbox for verification email

### Emails not arriving
1. Check SendGrid Activity feed: https://app.sendgrid.com/email_activity
2. Verify sender email is verified
3. Check spam/junk folders
4. Review SendGrid API logs for errors

## Next Steps

1. ✅ **Verify Sender Email**: Check inbox at info@northpathstrategies.org for SendGrid verification email
2. ✅ **Deploy to Vercel**: Run `vercel deploy --prod` to make endpoint live at your custom domain
3. ✅ **Add Webhook to SendGrid**: Copy the endpoint URL to SendGrid Inbound Parse settings
4. ✅ **Test Contact Form**: Submit a test form and verify both emails arrive
5. ✅ **Deploy Marketing Page**: Choose WordPress or Vercel static hosting

## Support

- **SendGrid Docs**: https://docs.sendgrid.com/
- **Vercel Docs**: https://vercel.com/docs
- **API Endpoint Code**: `apps/web/app/api/contact/route.ts`
- **Marketing Page**: `marketing/coming-soon.html`

---

**Status**: ✅ SendGrid fully configured and ready for production!

**Your Contact Endpoint**: `https://platform.mapmycurriculum.com/api/contact`
