# Supabase Migration Guide for Map My Curriculum

## 🎯 Overview
This guide walks you through completing the Supabase migration for your curriculum mapping platform. You're transitioning from Prisma Postgres to Supabase for better authentication, collaboration features, and file storage.

## ✅ What's Already Done
- ✅ Supabase client libraries installed
- ✅ Authentication components created (`AuthFormSupabase.tsx`)
- ✅ Middleware for session management
- ✅ Database schema designed with Row Level Security
- ✅ API routes for auth handling
- ✅ Auth callback routes for OAuth

## 🔧 Required Setup Steps

### 1. Environment Configuration
Create `.env.local` in the `apps/web` directory with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Keep your existing Stripe keys
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**Where to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project under NorthPath organization
3. Go to Settings > API
4. Copy the values to your `.env.local`

### 2. Database Migration
1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `supabase/migrations/001_initial_setup.sql`
4. Run the migration
5. Verify tables are created in **Table Editor**

### 3. Authentication Configuration
1. In Supabase Dashboard, go to **Authentication > Settings**
2. Set **Site URL**: `https://platform.mapmycurriculum.com`
3. Add **Redirect URLs**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://platform.mapmycurriculum.com/auth/callback`
4. Enable **Google OAuth** (optional):
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

### 4. Integration Testing
Test the new authentication system:

```bash
cd apps/web
npm run dev
```

Visit `http://localhost:3000/signup` and test:
- ✅ Email/password signup
- ✅ Email/password login  
- ✅ Google OAuth (if enabled)
- ✅ Dashboard access after login

### 5. Update Auth Components
The original `AuthForm.tsx` is preserved. To integrate Supabase:

```tsx
// In your signup/login pages, replace:
import AuthForm from '@/app/components/AuthForm'

// With:
import AuthFormSupabase from '@/app/components/AuthFormSupabase'
```

### 6. Deploy to Production
1. Add environment variables to **Vercel Dashboard**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   DATABASE_URL
   ```

2. Update Supabase redirect URLs to include production domain

3. Deploy:
   ```bash
   npm run build
   # Then deploy via Vercel CLI or dashboard
   ```

## 🔄 Migration Strategy
This setup allows for **gradual migration**:

1. **Phase 1** (Current): Supabase auth + existing Prisma data
2. **Phase 2**: Migrate curriculum data to Supabase tables
3. **Phase 3**: Remove Prisma dependencies

## 🔐 Security Features
- **Row Level Security (RLS)**: Users only see their institution's data
- **Multi-tenant**: Institution-based data isolation
- **Role-based access**: User, Institution Admin, System Admin levels
- **OAuth integration**: Google Sign-In ready

## 🗄️ Database Schema
The migration creates these key tables:
- `profiles` - User profiles linked to auth.users
- `institutions` - Multi-tenant organization structure  
- `programs` - Academic programs per institution
- `courses` - Courses linked to programs
- `learning_outcomes` - Course and program outcomes
- `curriculum_alignments` - Outcome mapping relationships

## 🚨 Troubleshooting

### Build Errors
If you see TypeScript errors, restart your development server:
```bash
npm run dev
```

### Auth Issues
1. Check environment variables are set correctly
2. Verify Supabase project is active
3. Check redirect URLs match exactly

### Database Access
1. Ensure migration ran successfully
2. Check RLS policies are enabled
3. Verify user has proper role in profiles table

## 📞 Support
- Supabase Documentation: https://supabase.com/docs
- Curriculum Map Tool Issues: Contact Jeremy

---

**Next Action:** Set up your `.env.local` file with Supabase credentials and run the database migration!
