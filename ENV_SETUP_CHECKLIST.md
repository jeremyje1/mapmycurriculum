# Environment Variables Setup Checklist

## ✅ CLI Installation
- [x] Vercel CLI (48.2.9)
- [x] Railway CLI (4.10.0)  
- [x] Supabase CLI (2.48.3)
- [x] Fixed Supabase config.toml (edge_runtime port issue)

## 📋 Variables You Need to Collect

### 1. Supabase (from your Supabase dashboard)
Visit: https://supabase.com/dashboard/project/<your-project-ref>/settings/api

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Project URL (e.g., https://xyz.supabase.co)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (secret)
- [ ] `DATABASE_URL` - Postgres connection string from Settings > Database

**Token provided**: `sbp_7bc4a033d6e9ae4e01066d7e8a104661224086e8`

### 2. Stripe (from your Stripe dashboard)
Visit: https://dashboard.stripe.com/test/apikeys

- [ ] `STRIPE_SECRET_KEY` - Secret key (sk_test_... or sk_live_...)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key (pk_test_... or pk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)

**After getting Stripe keys**, run:
```bash
npm install
pnpm stripe:setup          # Creates products and price IDs
```

This will generate the price IDs you need:
- [ ] `NEXT_PUBLIC_PRICE_SCHOOL_STARTER`
- [ ] `NEXT_PUBLIC_PRICE_SCHOOL_PRO`
- [ ] `NEXT_PUBLIC_PRICE_DISTRICT_PRO`
- [ ] `NEXT_PUBLIC_PRICE_DISTRICT_ENTERPRISE`
- [ ] `NEXT_PUBLIC_PRICE_DEPARTMENT`
- [ ] `NEXT_PUBLIC_PRICE_COLLEGE`
- [ ] `NEXT_PUBLIC_PRICE_INSTITUTION`

### 3. App Configuration
- [x] `NEXTAUTH_SECRET` - Generated: `nJpY9+XcWjmbLkaaleiVVbcjlh9YbSEy0u0X1a1N+hc=`
- [ ] `NEXT_PUBLIC_APP_URL` 
  - Local: `http://localhost:3000`
  - Production: `https://mapmycurriculum-f95argh4j-jeremys-projects-73929cad.vercel.app` (or custom domain)
- [x] `NEXT_PUBLIC_APP_ENV` - Set to `development` (local) or `production` (deployed)

## 📝 Where to Add These Values

### Local Development
1. **Primary**: `apps/web/.env.local` (already created with placeholders)
2. **Root**: `.env` (for scripts like state-validate, Stripe setup)

### Vercel Deployment
```bash
vercel login
vercel link
# Then for each variable:
vercel env add <VARIABLE_NAME> production
vercel env add <VARIABLE_NAME> preview
vercel env add <VARIABLE_NAME> development
```

Or use Vercel dashboard: Project Settings > Environment Variables

### Railway Deployment
```bash
railway login
railway link enormous-language/mapmycurriculum
# Then for each variable:
railway variables set <VARIABLE_NAME>
```

Or use Railway dashboard: Service Settings > Variables

## 🚀 Next Steps After Setting Variables

### 1. Authenticate with Supabase
```bash
supabase login
# Paste token: sbp_7bc4a033d6e9ae4e01066d7e8a104661224086e8
```

### 2. Link to Supabase Project
```bash
supabase link --project-ref <your-project-ref>
```
Get project ref from your Supabase dashboard URL or settings.

### 3. Run Migrations
```bash
supabase db push --file supabase/migrations/001_initial_setup_fixed.sql
supabase db push --file supabase/migrations/002_curriculum_tables.sql
```

### 4. Seed Database (Optional)
```bash
cd /Users/jeremy.estrella/Desktop/mapmycurriculum
DATABASE_URL="<your-supabase-connection-string>" pnpm dlx prisma db seed
```

### 5. Generate Stripe Products & Prices
```bash
pnpm stripe:setup
pnpm stripe:verify  # Confirm everything was created
```

### 6. Test Locally
```bash
cd apps/web
npm run dev
```
Visit http://localhost:3000 and test:
- [ ] Homepage loads
- [ ] Login/signup works (Supabase auth)
- [ ] Stripe checkout flow
- [ ] `/api/health` endpoint

### 7. Deploy to Vercel
```bash
vercel --prod
```

### 8. Deploy to Railway
```bash
railway up
```

## 🔒 Security Reminders
- ✅ All `.env*` files are in `.gitignore`
- ⚠️ Never commit real secrets to Git
- ⚠️ Use test/sandbox keys for development
- ⚠️ Rotate any exposed keys immediately

## 📊 Current Status
- Environment templates created: `.env`, `.env.production`, `.env.railway`, `apps/web/.env.local`
- Supabase config fixed
- NextAuth secret generated
- Waiting for: Supabase credentials, Stripe keys, project ref
