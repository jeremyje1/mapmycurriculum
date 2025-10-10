# AI Coding Agent Instructions - Map My Curriculum

## Project Overview
This is a policy-aware curriculum mapping & compliance engine for educational institutions. The system validates academic programs against state regulatory requirements using versioned "RulePacks" containing JSONLogic-based rules.

## Architecture & Key Components

### Monorepo Structure
- `apps/web/` - Next.js 14 application with Supabase auth and Stripe integration
- `packages/state-packs/` - RulePack loader with Zod validation (`@cmt/state-packs`)
- `packages/domain/` - Business logic and snapshot metrics (in development)
- `state-packs/` - Versioned regulatory rules (e.g., `US-TX/2025.09/`)
- `prisma/` - Database schema using PostgreSQL
- Root scripts for validation, Stripe setup, and utilities

### Database & Authentication
- **Primary**: Supabase (PostgreSQL with Row Level Security)
- **Legacy**: Prisma client still used alongside Supabase
- **Auth Pattern**: Dual system - Supabase for new features, legacy auth preserved
- **Key Files**: `lib/supabase-server.ts`, `lib/supabase.ts`, `lib/supabase-middleware.ts`

### State Management & Validation
RulePacks are the core abstraction:
```typescript
// Load and validate regulatory rules
const pack = await loadRulePack("US-TX", "2025.09");
// Generates: { meta, rules: { program, course, termPlan }, datasets }
```

Version format: `YYYY.MM` (e.g., 2025.09)
State format: `US-TX` (ISO-style state codes)

## Development Workflows

### Database Operations
```bash
# Prisma migrations (still used)
pnpm dlx prisma migrate dev --name <description>
pnpm dlx prisma db seed

# Supabase operations (preferred for new features)
# Manual SQL in Supabase dashboard or migration files in supabase/migrations/
```

### RulePack Development
```bash
# Validate a specific state pack
pnpm state:validate US-TX 2025.09

# Script location: scripts/state-validate.ts
# Uses packages/state-packs/src/loader.ts
```

### Stripe Integration
```bash
# Setup products and pricing
pnpm stripe:setup          # Main products
pnpm stripe:setup:marketing # Marketing-specific products
pnpm stripe:verify         # Validate configuration
```

### Deployment (Vercel)
- **Canonical Project**: `mapmycurriculum` (NOT `mapmycurriculum-web`)
- **Build Command**: `npm --prefix apps/web run build` (bypasses pnpm workspace deps)
- **Root Directory**: `apps/web`
- Key: Use npm, not pnpm, to avoid workspace resolution issues

## Critical Patterns & Conventions

### Authentication Duality
```typescript
// New Supabase pattern (preferred)
import { createServerSupabaseClient } from '@/lib/supabase-server'
const supabase = createServerSupabaseClient()

// Legacy pattern (still in use)
import { prisma } from '@/lib/prisma'
// Direct Prisma queries for curriculum data
```

### RulePack Structure
```yaml
# state-packs/US-TX/2025.09/pack.yaml
state: "US-TX"
version: "2025.09"
rules:
  program: ["rules/program.yaml"]

# End-to-end demo evaluation (CSV → snapshot → JSONLogic)
  course: ["rules/course.yaml"] 
  termPlan: ["rules/termplan.yaml"]
datasets:
  core_areas: "datasets/core_areas.yaml"
```

### API Route Patterns
- Supabase routes: `/api/auth/supabase/`, `/api/migrate/`
- Legacy auth: `/api/auth/login/` (preserved for compatibility)
- Health checks: `/api/health` (used by Vercel crons)

### Environment Variables
Required for production:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Price IDs: `NEXT_PUBLIC_PRICE_*` format

## Data Model Key Relationships
- `Institution` → `Program` → `ProgramVersion` (versioned curricula)
- `ProgramVersion` → `TermPlan` → `TermCourse` (academic sequences)
- `RulePack` → `RuleResult` (compliance evaluations)
- `ProgramOutcome` ↔ `CourseOutcome` via `Alignment` (learning objectives mapping)

## Integration Points
- **Supabase**: Auth, RLS policies, real-time subscriptions
- **Stripe**: Subscription management with educational pricing tiers
- **Vercel**: Deployment with health check crons
- **JSONLogic**: Active rule evaluation via `@cmt/domain` snapshot & evaluator modules
- **CSV ingestion**: `packages/domain/src/demo-data.ts` maps `demo-data/*.csv` into `ProgramData`

## When Working With...
- **RulePacks**: Always validate with `pnpm state:validate` before committing
- **Database changes**: Update both Prisma schema AND Supabase migrations
- **Auth features**: Use Supabase patterns for new code, preserve legacy where needed
- **Stripe**: Test with sandbox keys, use setup scripts for consistent product creation
- **Deployments**: Verify you're linked to canonical Vercel project before deploying