# Authentication & Authorization Implementation Summary

**Date**: October 16, 2025  
**Status**: Phase 1 - Authentication Foundation ✅ COMPLETE  
**Next**: Continue with Stripe Webhook & RLS Policies

---

## 🎉 What We've Built

### 1. Core Auth Infrastructure

#### **lib/auth.ts** - Authentication Helpers
- `getSession()` - Get current user session (cached)
- `getUser()` - Get current user details
- `requireAuth()` - Protect server components (redirects if not authenticated)
- `requireRole()` - Require specific role for access
- `isAuthenticated()` - Check if user is logged in
- `signOut()` - Sign out current user
- `getUserInstitutionId()` - Get user's institution for RLS queries

#### **lib/rbac.ts** - Role-Based Access Control
- **Roles**: `admin`, `editor`, `viewer`
- **Permissions**: Granular permissions for programs, courses, scenarios, compliance, users, billing
- Permission checking functions:
  - `hasPermission()` - Check single permission
  - `hasAnyPermission()` - Check any of multiple permissions
  - `hasAllPermissions()` - Check all permissions
  - `requirePermission()` - Enforce permission (throws if not allowed)
  - `checkAccess()` - Flexible access checking for components

**Permission Matrix**:
```
Admin    → All permissions (full access)
Editor   → Can manage programs, courses, scenarios (no user/billing management)
Viewer   → Read-only access (view programs, courses, compliance)
```

#### **lib/env.ts** - Environment Variable Validation
- Runtime validation of required environment variables
- Helpful error messages if variables are missing
- Helper functions for getting config:
  - `getSupabaseConfig()`
  - `getStripeConfig()`
  - `getAppConfig()`
- Call `requireValidEnv()` at app startup

### 2. Database Schema & RLS Policies

#### **supabase/migrations/20251016000000_auth_and_rbac.sql**

**New Tables**:
- `institutions` - Educational institutions with Stripe customer ID
- `users` - Application users with roles and institution association
- `subscriptions` - Stripe subscription tracking
- `audit_logs` - Action logging for compliance

**Row Level Security (RLS) Policies**:
- ✅ Users can only view their own institution
- ✅ Users can only see users in their institution
- ✅ Admins can manage users in their institution
- ✅ Users can view their institution's subscription
- ✅ Admins can manage subscriptions
- ✅ Users can view audit logs for their institution

**Helper Functions**:
- `has_role(required_role)` - Check if user has role
- `current_user_institution_id()` - Get user's institution ID
- `is_admin()` - Check if user is admin

**Triggers**:
- Auto-create user record when auth.users entry is created
- Auto-update `updated_at` timestamps

### 3. Middleware Protection

#### **apps/web/middleware.ts**
Protected routes (require authentication):
- `/enterprise/*`
- `/assessment/*`
- `/validate/*`
- `/dashboard/*`
- `/programs/*`
- `/scenarios/*`
- `/compliance/*`
- `/billing/*`
- `/settings/*`

Admin-only routes:
- `/admin/*`

Features:
- Redirects to `/sign-in` if not authenticated
- Redirects to dashboard if accessing auth pages while logged in
- Checks admin role for admin routes
- Maintains Supabase cookies properly

### 4. User-Facing Pages

#### **app/sign-in/page.tsx**
- Email/password sign-in form
- Password reset functionality
- Error handling with user-friendly messages
- Loading states
- Redirect to intended page after sign-in

#### **app/unauthorized/page.tsx**
- Shown when user tries to access restricted pages
- Links back to dashboard and home

#### **app/auth/callback/route.ts**
- Handles Supabase auth callbacks
- Email verification redirects
- Password reset confirmation
- Magic link authentication

### 5. Server Actions

#### **app/actions/auth.ts**
- `signOutAction()` - Server action for sign out
- `signInAction()` - Server action for sign in
- `signUpAction()` - Server action for sign up with institution creation

---

## 🔧 How to Use

### Protecting Server Components

```typescript
import { requireAuth } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await requireAuth() // Redirects if not authenticated
  
  return <div>Hello {session.user.email}!</div>
}
```

### Checking Permissions

```typescript
import { hasPermission, Permission } from '@/lib/rbac'

export default async function ProgramsPage() {
  const canEdit = await hasPermission(Permission.EDIT_PROGRAMS)
  
  return (
    <div>
      {canEdit && <button>Edit Program</button>}
    </div>
  )
}
```

### API Route Protection

```typescript
import { requireAuth } from '@/lib/auth'
import { requirePermission, Permission } from '@/lib/rbac'

export async function POST(request: Request) {
  await requireAuth() // Must be authenticated
  await requirePermission(Permission.CREATE_PROGRAMS) // Must have permission
  
  // Handle request...
}
```

### Getting User's Institution ID (for RLS)

```typescript
import { getUserInstitutionId } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getPrograms() {
  const institutionId = await getUserInstitutionId()
  const supabase = createServerSupabaseClient()
  
  // RLS will automatically filter to this institution
  const { data } = await supabase
    .from('programs')
    .select('*')
    .eq('institution_id', institutionId)
  
  return data
}
```

---

## 🚀 Deployment Steps

### 1. Set Up Supabase

1. **Run the migration**:
   ```bash
   # In Supabase dashboard SQL editor, run:
   supabase/migrations/20251016000000_auth_and_rbac.sql
   ```

2. **Configure Auth Settings** (Supabase Dashboard → Authentication):
   - Enable Email provider
   - Set Site URL: `https://your-domain.com`
   - Add redirect URLs:
     - `https://your-domain.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for dev)
   - Configure email templates (optional)

### 2. Set Environment Variables

Update your `.env` file with required variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...YOUR_SERVICE_ROLE_KEY

# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_URL=https://platform.mapmycurriculum.com

# Stripe (existing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cron
CRON_SECRET=generate-random-secret
```

### 3. Validate Environment

Add to your app startup (e.g., `app/layout.tsx` or `instrumentation.ts`):

```typescript
import { requireValidEnv } from '@/lib/env'

// Will throw if missing required vars
requireValidEnv()
```

### 4. Deploy

```bash
# Build and test locally
pnpm build
pnpm start

# Deploy to Vercel
vercel deploy --prod
```

### 5. Create First Admin User

After deployment, create your first user through the sign-up page:
1. Go to `/signup`
2. Enter email, password, institution name, and state
3. Verify email
4. User will automatically be assigned `admin` role as first user

---

## ✅ Testing Checklist

- [ ] User can sign up with email/password
- [ ] Email verification works
- [ ] User can sign in
- [ ] User is redirected to dashboard after sign in
- [ ] Protected routes require authentication
- [ ] Unauthenticated users redirected to `/sign-in`
- [ ] Authenticated users can't access `/sign-in` or `/signup`
- [ ] Admin can access admin routes
- [ ] Non-admin gets 401 on admin routes
- [ ] User can sign out
- [ ] Password reset works
- [ ] RLS policies prevent cross-institution data access
- [ ] Environment validation catches missing variables

---

## 🔜 Next Steps

### Phase 1 (Week 2): Multi-Tenant RLS & Security

1. **Add RLS to existing tables**:
   - `simple_programs`
   - `simple_courses`
   - `simple_alignments`
   - `learning_outcomes`
   - `compliance_snapshots`
   - `compliance_alerts`

2. **Update API routes** to use `getUserInstitutionId()` for queries

3. **Security audit**:
   - Test cross-tenant access (should be blocked)
   - Verify service role key is only used in cron jobs
   - Check all queries respect RLS

### Phase 1 (Week 3): Stripe Integration

1. **Create webhook handler**: `app/api/stripe/webhook/route.ts`
2. **Handle events**:
   - `checkout.session.completed` → Create institution + subscription
   - `invoice.payment_succeeded` → Update subscription status
   - `invoice.payment_failed` → Send alerts
   - `customer.subscription.updated/deleted` → Update status

3. **Update sign-up flow**:
   - Sign up → Auth creation
   - Redirect to plan selection
   - Stripe checkout → Webhook provisions institution
   - Redirect to dashboard

### Phase 1 (Week 4): Data Import & Management

1. **CSV Import UI**: `app/(dashboard)/programs/import/page.tsx`
2. **Program Management**: CRUD pages for programs, courses, outcomes
3. **Validation**: Ensure data quality on import
4. **RLS**: All queries filtered by institution

---

## 📚 Reference

### Key Files Created

```
apps/web/
├── lib/
│   ├── auth.ts              ✅ Auth helpers
│   ├── rbac.ts              ✅ RBAC & permissions
│   └── env.ts               ✅ Environment validation
├── middleware.ts             ✅ Route protection
├── app/
│   ├── sign-in/page.tsx     ✅ Sign-in UI
│   ├── unauthorized/page.tsx ✅ 401 page
│   ├── auth/
│   │   └── callback/route.ts ✅ Auth callback
│   └── actions/
│       └── auth.ts          ✅ Server actions

supabase/
└── migrations/
    └── 20251016000000_auth_and_rbac.sql ✅ Database schema

.env.example                  ✅ Updated with Supabase vars
```

### Useful Commands

```bash
# Development
pnpm dev

# Test auth locally
# 1. Start app: pnpm dev
# 2. Go to: http://localhost:3000/sign-in
# 3. Try signing in (will need Supabase configured)

# Run migration (in Supabase dashboard)
# Copy contents of supabase/migrations/20251016000000_auth_and_rbac.sql
# Paste into SQL Editor and run

# Check environment variables
pnpm build  # Will fail if required vars missing
```

---

## 🐛 Troubleshooting

### "Missing required environment variable"
- Check `.env` file exists and has all required variables
- Compare with `.env.example`
- Restart dev server after changing `.env`

### "Redirected to /sign-in" on protected routes
- Clear cookies and try signing in again
- Check Supabase auth is configured correctly
- Verify Supabase URL and keys are correct

### "Unauthorized Access" when logged in
- Check user role in database (`users` table)
- Verify RLS policies allow access
- Check if route requires admin role

### Email verification not working
- Check Supabase email settings (Authentication → Email Templates)
- Verify redirect URLs are configured in Supabase
- Check spam folder for verification email

---

**Implementation Time**: ~6 hours  
**Status**: ✅ Complete and Ready for Testing  
**Next Session**: RLS Policies for Existing Tables + Stripe Webhooks
