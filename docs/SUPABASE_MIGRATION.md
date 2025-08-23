# Supabase Migration Plan for Map My Curriculum

## Overview
This document outlines the migration strategy from Prisma Postgres to Supabase for enhanced collaboration features, better authentication, and file storage capabilities.

## Current Architecture
- **Database**: Prisma Postgres with Accelerate
- **Authentication**: Simplified custom auth with session cookies
- **File Storage**: None (mentioned in roadmap)
- **Real-time**: None (needed for collaboration)

## Target Architecture
- **Database**: Supabase PostgreSQL 
- **Authentication**: Supabase Auth with Row Level Security
- **File Storage**: Supabase Storage for PDF exports
- **Real-time**: Supabase Realtime for collaboration
- **ORM**: Keep Prisma for type safety and migrations

## Migration Phases

### Phase 1: Setup & Authentication (Week 1-2)
**Goal**: Replace custom auth with Supabase Auth

#### Steps:
1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com/dashboard
   # Create new project: mapmycurriculum
   # Note down: Project URL, anon key, service role key
   ```

2. **Update Environment Variables**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Create Supabase Auth Integration**
   - Replace AuthForm.tsx with Supabase auth
   - Update login/signup API routes
   - Implement proper session management

4. **Add Row Level Security Policies**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Policy: Users can only see their institution's data
   CREATE POLICY "Users can access own institution" ON institutions
   FOR ALL USING (id = auth.jwt() ->> 'institution_id');
   ```

#### Benefits After Phase 1:
- ✅ Proper password reset functionality
- ✅ Email verification
- ✅ Secure session management
- ✅ Foundation for multi-tenant security

### Phase 2: Database Migration (Week 3-4)
**Goal**: Migrate data from Prisma Postgres to Supabase

#### Steps:
1. **Replicate Schema in Supabase**
   ```sql
   -- Run existing Prisma migrations on Supabase
   -- Add Supabase-specific auth tables integration
   ```

2. **Data Migration Scripts**
   ```typescript
   // Create migration scripts to transfer:
   // - Institutions
   // - Users (with proper auth mapping)
   // - Programs, Courses, Outcomes
   // - Historical RuleResults and Snapshots
   ```

3. **Dual-Write Period**
   - Write to both databases during transition
   - Validate data consistency
   - Monitor performance

4. **Switch Over**
   - Update DATABASE_URL to Supabase
   - Retire Prisma Postgres

#### Benefits After Phase 2:
- ✅ Lower database costs
- ✅ Integrated auth and data
- ✅ Better performance with regional edge
- ✅ Simplified infrastructure

### Phase 3: Real-time Collaboration (Week 5-6)
**Goal**: Enable faculty collaboration features

#### Steps:
1. **Supabase Realtime Setup**
   ```sql
   -- Enable realtime for collaboration tables
   ALTER PUBLICATION supabase_realtime ADD TABLE program_versions;
   ALTER PUBLICATION supabase_realtime ADD TABLE courses;
   ALTER PUBLICATION supabase_realtime ADD TABLE outcomes;
   ```

2. **Collaboration UI Components**
   ```typescript
   // Real-time curriculum editing
   // Live user presence indicators
   // Conflict resolution for simultaneous edits
   ```

3. **Activity Feeds**
   ```sql
   -- Track curriculum changes
   CREATE TABLE activity_log (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id),
     institution_id uuid REFERENCES institutions(id),
     action text,
     target_type text,
     target_id text,
     details jsonb,
     created_at timestamptz DEFAULT now()
   );
   ```

#### Benefits After Phase 3:
- ✅ "Faculty collaboration portal" feature complete
- ✅ Real-time curriculum updates
- ✅ Activity tracking and audit logs
- ✅ Competitive advantage in education market

### Phase 4: File Storage & Reports (Week 7-8)
**Goal**: Implement PDF generation and storage

#### Steps:
1. **Supabase Storage Setup**
   ```sql
   -- Create storage buckets
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('reports', 'reports', false);
   
   -- RLS policies for report access
   CREATE POLICY "Users can access own institution reports" 
   ON storage.objects FOR ALL 
   USING (bucket_id = 'reports' AND auth.jwt() ->> 'institution_id' = (storage.foldername(name))[1]);
   ```

2. **Update Export System**
   ```typescript
   // Modify ExportArtifact model to use Supabase Storage
   // Generate signed URLs for secure report access
   // Implement automatic cleanup of old reports
   ```

3. **Enhanced Report Features**
   - Version control for reports
   - Shared report access for stakeholders
   - Automated report scheduling

#### Benefits After Phase 4:
- ✅ "40-50 page AI narrative & accreditation package" storage
- ✅ Secure report sharing
- ✅ Automated report lifecycle management
- ✅ Enterprise-ready document management

## Cost Analysis

### Current Costs (Estimated):
- Prisma Postgres: ~$25/month
- Prisma Accelerate: ~$25/month
- **Total**: ~$50/month

### Supabase Costs (Projected):
- Supabase Pro: $25/month (includes database, auth, storage, realtime)
- Additional compute: ~$10/month (as you scale)
- **Total**: ~$35/month

### **Cost Savings**: ~$15/month + better features

## Risk Mitigation

### Technical Risks:
1. **Data Migration Issues**
   - Mitigation: Thorough testing in staging environment
   - Rollback plan: Keep Prisma Postgres during transition

2. **Performance Concerns**
   - Mitigation: Supabase edge functions reduce latency
   - Monitoring: Real-time performance dashboards

3. **Feature Parity**
   - Mitigation: Phased approach maintains current functionality
   - Testing: Comprehensive user acceptance testing

### Business Risks:
1. **Customer Disruption**
   - Mitigation: Seamless transition with zero downtime
   - Communication: Advance notice of enhanced features

2. **Timeline Delays**
   - Mitigation: Incremental deployment per phase
   - Fallback: Each phase is independently deployable

## Success Metrics

### Technical KPIs:
- Database query performance: <100ms avg response time
- Auth conversion rate: >95% successful logins
- Real-time message delivery: <500ms latency
- Report generation time: <10 seconds for 50-page docs

### Business KPIs:
- Customer satisfaction: Maintain >90% satisfaction
- Feature adoption: >60% of Professional+ customers use collaboration
- Support tickets: <5% increase during migration
- Revenue impact: Enable upsells to Professional tier

## Next Steps

1. **Immediate (This Week)**:
   - Create Supabase project
   - Set up development environment
   - Begin Phase 1 authentication work

2. **Short Term (Next 2 Weeks)**:
   - Complete Supabase auth integration
   - Test with existing customers
   - Prepare database migration scripts

3. **Medium Term (Next Month)**:
   - Execute full migration
   - Launch collaboration features
   - Market new capabilities to prospects

## Implementation Timeline

```
Week 1-2: ████████░░░░░░░░░░░░░░░░░░░░░░░░ Phase 1: Auth Setup
Week 3-4: ░░░░░░░░████████░░░░░░░░░░░░░░░░ Phase 2: DB Migration  
Week 5-6: ░░░░░░░░░░░░░░░░████████░░░░░░░░ Phase 3: Real-time
Week 7-8: ░░░░░░░░░░░░░░░░░░░░░░░░████████ Phase 4: File Storage
```

## Questions for Decision:
1. Should we start with Phase 1 immediately?
2. Any specific Supabase regions preferred for performance?
3. Budget approval for Supabase Pro plan?
4. Internal testing timeline preferences?
