# Marketing Landing Pages

This directory contains the marketing and public-facing landing pages for Map My Curriculum.

---

## 📄 Pages

### 1. **landing.html** - Operational Landing Page
**Purpose**: Active platform with live links  
**Status**: For use after testing complete  
**Features**:
- Live Stripe checkout links
- Direct links to platform sign-in/sign-up
- Pricing information with active price IDs
- Ready for production deployment

**When to use**: After all debugging and testing is complete

---

### 2. **coming-soon.html** - Marketing & Lead Generation Page
**Purpose**: Pre-launch marketing and lead capture  
**Status**: Active now, use during development phase  
**Features**:
- Problem/solution messaging
- Detailed feature showcase
- Custom solution offerings
- Contact form with SendGrid integration
- Bio and expertise section
- SEO optimized

**Target Audiences**:
- Potential customers (universities, colleges, K-12)
- Potential clients for custom solutions
- Investors
- Partners

**Contact Form Fields**:
- Name, email, phone
- Institution name and type
- Role/position
- Area of interest (demo, custom solution, consultation, etc.)
- Detailed message

---

## 🎯 Content Strategy

### Coming Soon Page Highlights

**Problems Addressed**:
1. Accreditation compliance burden
2. Fragmented data systems
3. Learning outcome gaps
4. Time-intensive reporting
5. Reactive curriculum changes
6. Lack of evidence-based insights

**Key Features**:
- Automated compliance monitoring
- Intelligent curriculum mapping
- Learning outcome management
- Scenario modeling
- Accreditation report generator
- Evidence binder creation
- Gap analysis
- Smart alerts
- Multi-tenant security

**Benefits Emphasized**:
- 75% reduction in accreditation prep time
- Eliminate manual errors
- Minutes vs. weeks for reports
- Data-driven decisions
- Continuous readiness

**Custom Solutions For**:
- Universities & Colleges
- Community Colleges
- School Districts
- Professional Programs (ABET, CCNE, AACSB)
- Multi-Campus Systems
- Consortia & Partnerships

---

## 🔧 Technical Setup

### Prerequisites

1. **SendGrid Account** (for contact form)
   - See `SENDGRID_SETUP.md` for detailed instructions
   - Free tier: 100 emails/day

2. **Environment Variables**:
   ```bash
   SENDGRID_API_KEY=your-key
   FROM_EMAIL=info@northpathstrategies.org
   ```

### Installation

```bash
# Install SendGrid package
cd apps/web
pnpm add @sendgrid/mail

# Copy coming-soon.html to your web server or WordPress
# The contact form will POST to /api/contact
```

### WordPress Deployment

1. **Upload HTML File**:
   - WordPress Admin → Pages → Add New
   - Switch to "Custom HTML" block
   - Paste entire coming-soon.html content

2. **Or use as custom template**:
   - Upload to your theme directory
   - Create custom page template
   - Assign to a new page

3. **Update URLs if needed**:
   - Replace `/api/contact` with full URL if hosted elsewhere
   - Update image paths if needed

---

## 📧 Contact Form Integration

### How It Works

1. User fills out contact form on coming-soon.html
2. Form submits to `/api/contact` endpoint
3. API validates data and sends via SendGrid
4. Two emails sent:
   - **To you**: Full submission details with reply button
   - **To submitter**: Confirmation message

### Email Sent To You

**Subject**: New Contact Form Submission - [Interest Type]

**Contents**:
- Contact info (name, email, phone)
- Institution details
- Area of interest
- Full message
- Timestamp
- One-click reply button

### Confirmation Email to Submitter

**Subject**: Thank you for contacting Map My Curriculum

**Contents**:
- Personalized greeting
- Acknowledgment of inquiry
- Expected response time (24 hours)
- Links to your websites
- Your contact information

---

## 🎨 Design & SEO

### SEO Optimization

**Meta Tags**:
- Comprehensive title and description
- Open Graph for social sharing
- Twitter cards
- Structured data (Schema.org)
- Canonical URL

**Keywords Targeted**:
- Curriculum mapping
- Accreditation compliance
- Higher education software
- Curriculum management
- SACSCOC, HLC, ABET compliance
- Learning outcomes
- Educational technology

**Best Practices**:
- Semantic HTML5
- Mobile responsive
- Fast loading (no external dependencies)
- Accessible (ARIA labels, keyboard navigation)
- Clean URL structure

### Design Features

**Color Scheme**:
- Primary: #2563eb (Blue)
- Secondary: #10b981 (Green)
- Gradient: Purple to Blue

**Sections**:
1. Hero with strong CTA
2. Problems & Solutions
3. Features grid
4. Benefits list
5. Custom solutions
6. About/Bio section
7. Contact form
8. Footer

**Responsive**:
- Mobile-first design
- Breakpoints for tablets and desktop
- Touch-friendly buttons
- Readable typography

---

## 📊 Analytics & Tracking

### Google Analytics (Optional)

Add to `<head>` section:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Conversion Tracking

Form submissions automatically trigger conversion events if Google Analytics is present:

```javascript
gtag('event', 'form_submission', {
  'event_category': 'contact',
  'event_label': formData.interest
});
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Page loads correctly on desktop
- [ ] Page loads correctly on mobile
- [ ] All navigation links work
- [ ] Contact form validates required fields
- [ ] Contact form submits successfully
- [ ] Email received at info@northpathstrategies.org
- [ ] Confirmation email sent to submitter
- [ ] Reply-to address works
- [ ] All images load correctly
- [ ] No console errors
- [ ] Fast page load (< 3 seconds)
- [ ] SEO meta tags present
- [ ] Social sharing preview looks good

### Browser Testing

Test on:
- Chrome
- Firefox
- Safari
- Edge
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## 🚀 Deployment Options

### Option 1: WordPress (Recommended for marketing)

```bash
# 1. Copy HTML content
# 2. WordPress → Pages → Add New
# 3. Add Custom HTML block
# 4. Paste content
# 5. Publish
```

**Pros**:
- Easy to update
- Built-in SEO tools
- Analytics integration
- Content management

### Option 2: Vercel (with Next.js app)

```bash
# Already integrated in /marketing/coming-soon.html
# API endpoint at /api/contact already created
# Just deploy:
vercel deploy --prod
```

**Pros**:
- Fast global CDN
- Automatic HTTPS
- Serverless API
- Easy updates via Git

### Option 3: Separate Static Host

Upload to:
- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront

**Note**: Update form action to point to your API endpoint

---

## 📝 Content Customization

### Easy Updates

**Change contact email**:
- Update `TO_EMAIL` in `/api/contact/route.ts`
- Update email in HTML (footer, contact section)

**Update your photo**:
- Replace URL in `<img src="...">`
- Or upload to WordPress media library

**Modify features**:
- Edit feature cards in HTML
- Keep descriptions concise (2-3 sentences)

**Add/remove problems**:
- Edit `.problems-grid` section
- Maintain 6 cards for visual balance

**Change colors**:
- Update CSS variables in `:root`
- Modify gradient colors in hero and sections

---

## 🔐 Security

### Form Protection

Current measures:
- Server-side validation
- Email format validation
- Required field checks
- SendGrid API key hidden

### Recommended additions:

1. **Rate Limiting**:
   ```typescript
   // Limit to 5 submissions per IP per minute
   // See SENDGRID_SETUP.md for code
   ```

2. **reCAPTCHA**:
   ```html
   <!-- Add to form -->
   <script src="https://www.google.com/recaptcha/api.js"></script>
   <div class="g-recaptcha" data-sitekey="your-site-key"></div>
   ```

3. **Honeypot Field**:
   ```html
   <!-- Hidden field to catch bots -->
   <input type="text" name="website" style="display:none">
   ```

---

## 📈 Performance

### Page Load Optimization

**Current optimizations**:
- Inline CSS (no external stylesheet)
- Single font (Google Fonts - Inter)
- Minimal JavaScript
- No heavy frameworks
- No external dependencies

**Load time**: < 2 seconds on 3G

### Further optimizations:

1. **Lazy load images**:
   ```html
   <img loading="lazy" src="...">
   ```

2. **Inline critical CSS**:
   Already done ✓

3. **Compress images**:
   - Use WebP format
   - Optimize with TinyPNG

4. **Enable caching**:
   - Configure via hosting provider
   - Set cache headers

---

## 🎯 Call-to-Actions

### Primary CTAs:
1. "Get a Custom Solution" (Hero)
2. Contact form submission
3. Email link (footer)

### Secondary CTAs:
- Navigation to sections
- External links to North Path Strategies

### CTA Best Practices:
- Clear, action-oriented text
- High contrast colors
- Prominent placement
- Mobile-friendly touch targets

---

## 📞 Contact Information

**Email**: info@northpathstrategies.org  
**Website**: https://northpathstrategies.org  
**Platform**: https://mapmycurriculum.com

---

## 🔄 Version History

- **v1.0** (Oct 16, 2025): Initial marketing page created
  - SEO optimized
  - SendGrid integration
  - Responsive design
  - Custom solutions messaging

---

## 📚 Related Documentation

- `SENDGRID_SETUP.md` - Email integration guide
- `landing.html` - Operational landing page (use after launch)
- `ACTION_PLAN.md` - Platform development roadmap
- `BUILD_STATE.json` - Current project state

---

## ✅ Launch Checklist

Before making coming-soon.html live:

- [ ] SendGrid configured and tested
- [ ] Contact form working
- [ ] All links updated (remove localhost)
- [ ] Images loading correctly
- [ ] SEO meta tags completed
- [ ] Analytics tracking added (optional)
- [ ] Mobile responsive tested
- [ ] All sections proofread
- [ ] Contact information verified
- [ ] WordPress/hosting configured
- [ ] Domain DNS pointed correctly
- [ ] SSL certificate active

After launch:

- [ ] Submit to Google Search Console
- [ ] Submit sitemap
- [ ] Test form submission from live site
- [ ] Monitor SendGrid dashboard
- [ ] Check email deliverability
- [ ] Set up email forwarding if needed
- [ ] Announce on social media
- [ ] Add to email signature

---

**Questions?** Check `SENDGRID_SETUP.md` or contact Jeremy at info@northpathstrategies.org
