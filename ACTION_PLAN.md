# Map My Curriculum - Production Action Plan

**Status**: Pre-Production (v0.9.0-beta)  
**Target**: Production-Ready (v1.0.0)  
**Timeline**: 8-12 weeks  
**Last Updated**: October 16, 2025

## Executive Summary

The Map My Curriculum platform has strong foundational architecture with:
- ✅ Rule pack validation engine (complete)
- ✅ Domain layer with evaluation logic (complete)
- ✅ Database schema and migrations (complete)
- ✅ Marketing site and pricing (complete)
- ⚠️ Scenario modeling (UI only, no persistence)
- ⚠️ Compliance monitoring (hardcoded rules, not using evaluator)
- ⚠️ Accreditation reports (basic PDF, needs templates)
- ❌ **Authentication & RBAC (CRITICAL - blocking launch)**
- ❌ **Data import/management UI (CRITICAL)**
- ❌ **Stripe webhook handling (CRITICAL)**
- ❌ **Multi-tenant RLS (CRITICAL - security)**

## Critical Blockers (Must Fix Before Launch)

### 1. Authentication & Authorization 🔴
**Priority**: P0 (Blocking)  
**Effort**: 2-3 weeks  
**Risk**: Cannot launch without proper auth

#### Current State
- Mock localStorage token in dashboard
- No user authentication flow
- No role-based access control
- Security vulnerability

#### Required Work
```typescript
// Tasks
- [ ] Integrate Supabase Auth across all pages
- [ ] Create middleware for route protection
- [ ] Implement sign-in/sign-up/sign-out flows
- [ ] Add password reset and email verification
- [ ] Create roles table (admin, editor, viewer)
- [ ] Implement RBAC checks in API routes
- [ ] Add role-based UI rendering
- [ ] Test auth flow end-to-end

// Files to modify/create
- apps/web/middleware.ts (expand protection)
- apps/web/app/(auth)/sign-in/page.tsx (new)
- apps/web/app/(auth)/sign-up/page.tsx (modify existing)
- apps/web/lib/auth.ts (new - auth helpers)
- apps/web/lib/rbac.ts (new - role checks)
- supabase/migrations/*_auth_roles.sql (new)
```

**Success Criteria**:
- ✓ All dashboard routes require authentication
- ✓ Users can sign in with email/password
- ✓ Roles are enforced in API routes
- ✓ Unauthorized access returns 401/403
- ✓ Session management works correctly

---

### 2. Multi-Tenant Row-Level Security 🔴
**Priority**: P0 (Security Critical)  
**Effort**: 1-2 weeks  
**Risk**: Data leakage between institutions

#### Current State
- RLS only on compliance tables
- simple_programs, simple_courses, simple_alignments lack isolation
- No institutionId filtering in queries

#### Required Work
```sql
-- Tasks
- [ ] Audit all Supabase tables for RLS policies
- [ ] Add institutionId to relevant tables
- [ ] Create RLS policies for multi-tenant isolation
- [ ] Test cross-tenant access is blocked
- [ ] Update API routes to use user's institutionId
- [ ] Add institution context to all queries

-- Tables needing RLS
- simple_programs
- simple_courses  
- simple_alignments
- learning_outcomes
- scenarios (when created)
- subscriptions (when created)

-- Example policy
CREATE POLICY "Users can only see their institution's programs"
ON simple_programs
FOR SELECT
USING (institution_id = auth.jwt() ->> 'institution_id');
```

**Success Criteria**:
- ✓ All tables have appropriate RLS policies
- ✓ Users cannot query other institutions' data
- ✓ Service role key only used in cron jobs
- ✓ Security audit passed

---

### 3. Stripe Webhook & Subscription Management 🔴
**Priority**: P0 (Revenue Critical)  
**Effort**: 1-2 weeks  
**Risk**: Cannot collect payments or provision customers

#### Current State
- POST /api/checkout redirects to Stripe ✓
- No webhook handler to capture payment events ❌
- No subscription tracking in database ❌
- No institution provisioning after payment ❌

#### Required Work
```typescript
// Tasks
- [ ] Create POST /api/stripe/webhook route
- [ ] Handle checkout.session.completed event
- [ ] Handle invoice.payment_succeeded event
- [ ] Handle invoice.payment_failed event
- [ ] Handle customer.subscription.* events
- [ ] Create subscriptions table in Supabase
- [ ] Provision institution after successful payment
- [ ] Create default program data for new customers
- [ ] Build billing management page
- [ ] Add plan upgrade/downgrade flow
- [ ] Test webhook delivery and retry logic

// Files to create
- apps/web/app/api/stripe/webhook/route.ts
- supabase/migrations/*_subscriptions.sql
- apps/web/lib/stripe-webhooks.ts
- apps/web/app/(dashboard)/billing/page.tsx
```

**Database Schema**:
```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id),
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL,
  plan_id text NOT NULL, -- 'basic', 'professional', 'enterprise'
  status text NOT NULL, -- 'active', 'past_due', 'canceled', 'trialing'
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Success Criteria**:
- ✓ Webhook receives and validates Stripe events
- ✓ Subscription status tracked in database
- ✓ New institutions provisioned automatically
- ✓ Failed payments trigger alerts
- ✓ Customers can manage billing in dashboard

---

### 4. Data Import & Program Management 🔴
**Priority**: P0 (User-Facing Critical)  
**Effort**: 2-3 weeks  
**Risk**: Users cannot input their curriculum data

#### Current State
- No UI to create/edit programs
- No CSV import functionality
- Demo data exists but no ingestion pipeline
- Users cannot manage their curriculum

#### Required Work
```typescript
// Tasks - Import UI
- [ ] Create CSV upload component
- [ ] Validate CSV structure and data
- [ ] Parse and transform CSV to domain models
- [ ] Batch insert with transaction support
- [ ] Show import progress and errors
- [ ] Support for programs, courses, outcomes, alignments

// Tasks - Management UI  
- [ ] Program list page with search/filter
- [ ] Program edit form (CRUD operations)
- [ ] Course catalog management
- [ ] Outcome management with alignment editor
- [ ] Term plan builder (drag-and-drop)
- [ ] Version history viewer

// Files to create
- apps/web/app/(dashboard)/programs/page.tsx
- apps/web/app/(dashboard)/programs/[id]/page.tsx
- apps/web/app/(dashboard)/programs/[id]/edit/page.tsx
- apps/web/app/(dashboard)/programs/import/page.tsx
- apps/web/app/api/programs/import/route.ts
- apps/web/app/api/programs/[id]/route.ts
- apps/web/components/import/csv-uploader.tsx
- apps/web/lib/import/csv-parser.ts
- apps/web/lib/import/validators.ts
```

**CSV Format** (reference: demo-data/*.csv):
```csv
# programs.csv
code,name,degreeType,catalogYear
BSCS,Computer Science,BS,2025

# courses.csv  
subject,number,title,credits,cipCode
CS,1301,Intro to Computer Science,3,11.0101

# outcomes.csv
programCode,code,description
BSCS,PLO1,Apply computational thinking...

# termplan.csv
programCode,term,courseCode,required
BSCS,1,CS1301,true
```

**Success Criteria**:
- ✓ Users can upload CSV files for bulk import
- ✓ Validation errors shown with helpful messages
- ✓ Programs can be created/edited via forms
- ✓ Course catalog searchable and editable
- ✓ Outcomes and alignments manageable
- ✓ Import history tracked with rollback

---

## Phase 1: MVP Launch (Weeks 1-4)

### Week 1: Authentication Foundation
1. **Supabase Auth Integration**
   - Set up auth configuration in Supabase dashboard
   - Create auth callback routes
   - Implement sign-in/sign-up forms
   - Add middleware protection for dashboard routes

2. **RBAC Implementation**
   - Create roles table and migration
   - Add role assignment logic
   - Implement permission checks in API
   - Add role-based UI rendering

### Week 2: Security & Multi-Tenancy
1. **RLS Policies**
   - Audit all tables
   - Write and test RLS policies
   - Add institutionId to queries
   - Security testing

2. **Environment Validation**
   - Add runtime env var validation
   - Create startup checks
   - Document all required variables
   - Test missing var error handling

### Week 3: Stripe Integration
1. **Webhook Handler**
   - Implement webhook endpoint
   - Add event handlers
   - Create subscriptions table
   - Test webhook delivery

2. **Institution Provisioning**
   - Auto-create institution after payment
   - Set up default data
   - Send welcome email
   - Test end-to-end signup flow

### Week 4: Data Management
1. **CSV Import**
   - Build upload UI
   - Implement parser and validator
   - Add batch insert logic
   - Handle errors gracefully

2. **Program Management UI**
   - Create program list page
   - Add basic CRUD operations
   - Build simple edit forms
   - Test with real data

**Phase 1 Deliverables**:
- ✓ Secure authentication system
- ✓ Multi-tenant data isolation
- ✓ Working subscription flow
- ✓ Basic data import capability
- ✓ Ready for first customer onboarding

---

## Phase 2: Production Features (Weeks 5-8)

### Core Feature Completion

#### 1. Evaluation Engine Integration (Week 5)
```typescript
// Refactor apps/web/app/api/cron/compliance-monitor/route.ts

import { loadRulePack } from '@cmt/state-packs/loader'
import { buildSnapshot } from '@cmt/domain/snapshot'
import { evaluate } from '@cmt/domain/evaluator'

// Replace hardcoded rules with:
const pack = await loadRulePack(institution.state, '2025.09')
const snapshot = buildSnapshot(programData)
const results = evaluate(snapshot, pack.rules.program, pack.datasets)

// Store full evaluation in compliance_snapshots
await supabase.from('compliance_snapshots').insert({
  program_version_id: programVersion.id,
  rule_pack_version: pack.meta.version,
  snapshot: snapshot,
  evaluation: results,
  created_at: new Date()
})
```

**Tasks**:
- [ ] Refactor compliance cron to use domain evaluator
- [ ] Track rule pack versions in snapshots
- [ ] Store full evaluation results
- [ ] Update alert generation logic
- [ ] Test with all state rule packs

#### 2. Scenario Persistence (Week 5-6)
```sql
-- Create scenarios table
CREATE TABLE scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id),
  program_version_id uuid REFERENCES program_versions(id),
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft', -- draft, under_review, approved, applied
  created_by uuid REFERENCES auth.users(id),
  proposed_changes jsonb NOT NULL, -- { addCourses: [], removeCourses: [], ... }
  current_metrics jsonb,
  proposed_metrics jsonb,
  impact_analysis jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Tasks**:
- [ ] Create scenarios table and migration
- [ ] Build API routes (CRUD operations)
- [ ] Update scenario modeling page to persist
- [ ] Add scenario list/comparison dashboard
- [ ] Implement apply scenario workflow
- [ ] Add scenario history tracking

#### 3. Admin Dashboards (Week 6-7)
**Compliance Monitor Dashboard**:
- View run history with filters
- Alert management with acknowledgment
- Compliance trends chart (pass rate over time)
- Drill-down into specific program issues

**Institution Dashboard**:
- Active programs overview
- Subscription status and usage
- User management (invite, roles, deactivate)
- Audit log of major actions

**Tasks**:
- [ ] Create admin layout and navigation
- [ ] Build compliance dashboard
- [ ] Build institution management page
- [ ] Add user management interface
- [ ] Create analytics components (charts)
- [ ] Implement audit logging

#### 4. Notifications (Week 7-8)
```typescript
// Email notifications via Postmark/SendGrid
- Compliance alerts (critical issues)
- Scenario approval requests
- Weekly compliance digest
- Subscription payment failures
- Welcome emails for new users

// Slack notifications (optional)
- Critical compliance alerts
- Scenario approvals
- System health alerts
```

**Tasks**:
- [ ] Set up email service (Postmark recommended)
- [ ] Create email templates
- [ ] Implement notification triggers
- [ ] Add notification preferences per user
- [ ] Build notification history page
- [ ] Test delivery and formatting

#### 5. Accreditation Report Enhancements (Week 8)
**Templates**:
- HLC (Higher Learning Commission)
- SACSCOC (Southern Association)
- ABET (Engineering accreditation)
- Generic template builder

**Tasks**:
- [ ] Create template system (YAML config)
- [ ] Implement dynamic chart generation
- [ ] Add evidence binder compiler (PDF/ZIP)
- [ ] Include compliance snapshots in reports
- [ ] Add scenario analysis sections
- [ ] Test report generation with real data

**Phase 2 Deliverables**:
- ✓ Full rule-pack evaluation integrated
- ✓ Scenario persistence and workflow
- ✓ Admin dashboards operational
- ✓ Email notifications working
- ✓ Enhanced reporting capabilities

---

## Phase 3: Scale & Polish (Weeks 9-12)

### Testing & Quality

#### Automated Testing (Week 9-10)
```typescript
// Unit tests (Jest/Vitest)
- Domain functions (computeMetrics, evaluate)
- CSV parsers and validators
- Rule pack loader
- Snapshot builder

// Integration tests
- API routes (auth, CRUD, webhooks)
- Database queries
- RLS policy enforcement
- Webhook event handling

// E2E tests (Cypress)
- Sign-up and onboarding flow
- Program import workflow
- Scenario creation and apply
- Compliance alert workflow
- Report generation
- Billing management
```

**Tasks**:
- [ ] Set up testing framework
- [ ] Write unit tests for critical paths
- [ ] Add integration tests for APIs
- [ ] Create E2E test suite
- [ ] Set up test database seeding
- [ ] Add code coverage reporting (target: 80%+)

#### CI/CD Pipeline (Week 10)
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    - Lint code (ESLint, Prettier)
    - Type check (TypeScript)
    - Run unit tests
    - Run integration tests
    - Run E2E tests
    - Check for secrets in code
    - Build application
  
  deploy:
    - Deploy to staging (on merge to main)
    - Deploy to production (on release tag)
```

**Tasks**:
- [ ] Create GitHub Actions workflows
- [ ] Add pre-commit hooks
- [ ] Set up staging environment
- [ ] Add secret scanning
- [ ] Configure deployment automation
- [ ] Add deployment health checks

### Advanced Features

#### Usage-Based Billing (Week 11)
- Track program count per institution
- Track monthly evaluation runs
- Implement usage meters in Stripe
- Add usage dashboard for customers
- Set soft/hard limits per plan
- Implement overage billing for Enterprise

#### Analytics & Monitoring (Week 11-12)
- Add error tracking (Sentry)
- Implement application logging
- Create performance monitoring
- Set up uptime monitoring
- Add user analytics (PostHog/Amplitude)
- Create admin analytics dashboard

#### Optimizations (Week 12)
- Database query optimization
- Add caching layer (Redis)
- Implement pagination for large lists
- Optimize PDF generation
- Add background job queue
- Load testing and performance tuning

**Phase 3 Deliverables**:
- ✓ Comprehensive test coverage
- ✓ Automated CI/CD pipeline
- ✓ Advanced billing features
- ✓ Monitoring and analytics
- ✓ Performance optimized

---

## Production Readiness Checklist

### Security ✓
- [ ] All routes require authentication
- [ ] RBAC enforced in API and UI
- [ ] RLS policies on all tables
- [ ] No secrets in repository
- [ ] Environment variables validated at startup
- [ ] Security audit completed
- [ ] OWASP Top 10 reviewed
- [ ] Penetration testing completed

### Functionality ✓
- [ ] User can sign up and pay
- [ ] Institution provisioned after payment
- [ ] User can import program data
- [ ] User can create/edit programs manually
- [ ] Compliance evaluation runs successfully
- [ ] Alerts generated and delivered
- [ ] Scenarios can be created and applied
- [ ] Reports can be generated
- [ ] Admin dashboards functional

### Performance ✓
- [ ] Page load < 3 seconds
- [ ] API response < 500ms (p95)
- [ ] Compliance evaluation < 30 seconds per program
- [ ] Report generation < 60 seconds
- [ ] Database queries optimized
- [ ] Load tested for 100+ concurrent users

### Reliability ✓
- [ ] Health check endpoint operational
- [ ] Database backups configured
- [ ] Disaster recovery plan documented
- [ ] Monitoring and alerting set up
- [ ] Error tracking configured
- [ ] Uptime SLA defined (99.5%+)

### Observability ✓
- [ ] Application logs structured and searchable
- [ ] Key metrics tracked (users, programs, evaluations)
- [ ] Performance metrics collected
- [ ] Business metrics dashboarded
- [ ] Alerting for critical issues

### Documentation ✓
- [ ] User guide created
- [ ] API documentation complete
- [ ] Admin runbook written
- [ ] Deployment guide updated
- [ ] Architecture diagram current
- [ ] Troubleshooting guide available

---

## Risk Management

### High-Risk Items

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Auth implementation delayed | CRITICAL | MEDIUM | Start immediately, dedicate full-time dev |
| Stripe webhook issues | HIGH | MEDIUM | Test thoroughly, implement retry logic |
| RLS bypass vulnerability | CRITICAL | LOW | Security audit, penetration testing |
| Data import errors at scale | MEDIUM | HIGH | Extensive validation, error handling |
| Rule pack evaluation performance | MEDIUM | MEDIUM | Optimize, add caching, background jobs |
| Customer data loss | CRITICAL | LOW | Automated backups, DR plan, testing |

### Contingency Plans

**If auth implementation falls behind**:
- Reduce scope: basic email/password only initially
- Delay social auth providers
- Use Supabase auth UI components (faster)

**If Stripe integration is complex**:
- Manual provisioning initially
- Async webhook processing
- Hire Stripe consultant if needed

**If testing timeline is tight**:
- Focus on critical path E2E tests
- Add unit tests incrementally post-launch
- Use manual QA for first customers

---

## Resource Requirements

### Development Team
- **1 Senior Full-Stack Developer**: Auth, Stripe, architecture (12 weeks)
- **1 Mid-Level Full-Stack Developer**: UI, data import, dashboards (10 weeks)
- **1 Frontend Developer**: UI polish, responsive design (6 weeks)
- **1 QA Engineer**: Testing, CI/CD setup (6 weeks, weeks 7-12)

### Infrastructure
- Vercel Pro Plan ($20/mo)
- Supabase Pro Plan ($25/mo)
- Stripe account (transaction fees only)
- Email service (Postmark: $10/mo for 10k emails)
- Sentry (free tier initially)

### Third-Party Services
- Domain name (~$20/year)
- SSL certificate (free via Vercel)
- Error tracking (Sentry free tier)
- Email service (Postmark/SendGrid)

---

## Success Metrics

### Launch Metrics (Week 4)
- [ ] First paying customer onboarded
- [ ] Zero critical security issues
- [ ] < 5% error rate on key flows
- [ ] All P0 features complete

### Month 1 Post-Launch
- 10+ paying customers
- 90%+ uptime
- < 1% payment failure rate
- Average user satisfaction 4+/5
- < 5 critical bugs reported

### Month 3 Post-Launch
- 50+ paying customers
- 99%+ uptime
- < 10 support tickets per week
- 80%+ customer retention
- NPS score 40+

---

## Go-Live Decision Criteria

### Must-Have (Blocking)
1. ✅ Authentication & RBAC working
2. ✅ Multi-tenant RLS enforced
3. ✅ Stripe subscription flow complete
4. ✅ Data import functional
5. ✅ Compliance evaluation using rule packs
6. ✅ Admin can view alerts
7. ✅ Security audit passed
8. ✅ Critical E2E tests passing

### Should-Have (Warn if missing)
1. ⚠️ Email notifications working
2. ⚠️ Scenario persistence complete
3. ⚠️ Admin dashboards polished
4. ⚠️ 80%+ test coverage
5. ⚠️ Documentation complete

### Nice-to-Have (Post-launch OK)
1. 📋 Slack notifications
2. 📋 Advanced analytics
3. 📋 Multiple accreditation templates
4. 📋 LMS integrations
5. 📋 Mobile responsive optimizations

---

## Communication Plan

### Weekly Status Updates
- **Audience**: Stakeholders, team leads
- **Format**: Email + dashboard link
- **Content**: Progress vs. plan, blockers, risks, next week priorities

### Sprint Demos
- **Frequency**: Every 2 weeks
- **Audience**: Full team + stakeholders
- **Format**: Live demo of completed features

### Launch Announcement
- **T-1 week**: Soft launch to beta users
- **Launch day**: Full announcement, marketing push
- **T+1 week**: Retrospective and lessons learned

---

## Appendix

### Useful Commands

```bash
# Development
pnpm install
pnpm dev
pnpm dlx prisma migrate dev
pnpm dlx prisma db seed

# Testing
pnpm test
pnpm test:e2e
pnpm test:coverage

# Validation
pnpm state:validate US-TX 2025.09
pnpm stripe:verify

# Deployment
pnpm build
vercel deploy --prod
```

### Key Files Reference

```
Core Logic:
- packages/state-packs/src/loader.ts - Rule pack loader
- packages/domain/src/snapshot.ts - Snapshot builder
- packages/domain/src/evaluator.ts - JSON Logic evaluator
- packages/domain/src/metrics.ts - Metrics computation

Auth & Security:
- apps/web/middleware.ts - Route protection
- apps/web/lib/supabase-server.ts - Server Supabase client
- apps/web/lib/auth.ts - Auth helpers (TO CREATE)
- apps/web/lib/rbac.ts - RBAC logic (TO CREATE)

Stripe:
- apps/web/app/api/checkout/route.ts - Checkout initiation
- apps/web/app/api/stripe/webhook/route.ts - Webhook handler (TO CREATE)
- apps/web/lib/plans.ts - Plan definitions

Compliance:
- apps/web/app/api/cron/compliance-monitor/route.ts - Cron job
- supabase/migrations/*_compliance_monitoring.sql - DB schema

State Packs:
- state-packs/US-TX/2025.09/pack.yaml - Texas rules
- state-packs/US-TX/2025.09/rules/*.yaml - Rule definitions
- state-packs/US-TX/2025.09/datasets/*.yaml - Reference data
```

### Contact & Support

- **Project Lead**: [Name]
- **Tech Lead**: [Name]
- **Product Manager**: [Name]
- **DevOps**: [Name]

---

**Document Control**:
- Created: October 16, 2025
- Last Updated: October 16, 2025
- Next Review: Weekly
- Owner: Engineering Team
- Status: ACTIVE
