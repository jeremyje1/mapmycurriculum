-- Migration: Auth and RBAC Setup
-- Description: Creates necessary tables and RLS policies for authentication and role-based access control
-- Created: 2025-10-16

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create institutions table (if not exists via Prisma sync)
-- This ensures we have the institution context for multi-tenancy
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  state text NOT NULL,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table synced with Supabase Auth
-- This extends the auth.users table with our application-specific data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'viewer',
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS users_institution_id_idx ON users(institution_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Create subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  plan_id text NOT NULL, -- 'basic', 'professional', 'enterprise'
  status text NOT NULL, -- 'active', 'past_due', 'canceled', 'trialing'
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_institution_id_idx ON subscriptions(institution_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);

-- Create audit log table for tracking important actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_institution_id_idx ON audit_logs(institution_id);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- INSTITUTIONS POLICIES
-- ============================================================================

-- Users can view their own institution
CREATE POLICY "Users can view their own institution"
  ON institutions
  FOR SELECT
  USING (
    id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Only admins can update their institution
CREATE POLICY "Admins can update their institution"
  ON institutions
  FOR UPDATE
  USING (
    id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can view users in their institution
CREATE POLICY "Users can view users in their institution"
  ON users
  FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can insert new users in their institution
CREATE POLICY "Admins can create users in their institution"
  ON users
  FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update users in their institution
CREATE POLICY "Admins can update users in their institution"
  ON users
  FOR UPDATE
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can delete users in their institution (except themselves)
CREATE POLICY "Admins can delete users in their institution"
  ON users
  FOR DELETE
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    AND id != auth.uid() -- Cannot delete yourself
  );

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Users can view their institution's subscription
CREATE POLICY "Users can view their institution's subscription"
  ON subscriptions
  FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Only admins can manage subscriptions
CREATE POLICY "Admins can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Users can view audit logs for their institution
CREATE POLICY "Users can view audit logs for their institution"
  ON audit_logs
  FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- System can insert audit logs (service role only)
-- No INSERT policy for regular users - only service role can insert

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_institutions_updated_at ON institutions;
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user record when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTIONS FOR RBAC
-- ============================================================================

-- Function to check if current user has a specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's institution_id
CREATE OR REPLACE FUNCTION current_user_institution_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT institution_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON institutions TO authenticated;
GRANT UPDATE ON institutions TO authenticated;

GRANT SELECT ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON users TO authenticated;

GRANT SELECT ON subscriptions TO authenticated;
GRANT INSERT, UPDATE ON subscriptions TO authenticated;

GRANT SELECT ON audit_logs TO authenticated;

-- Grant permissions to service role for cron jobs and admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- SEED DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Example: Create a test institution
-- INSERT INTO institutions (id, name, state) 
-- VALUES 
--   (gen_random_uuid(), 'Example Institution', 'US-CA')
-- ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE institutions IS 'Educational institutions using the platform';
COMMENT ON TABLE users IS 'Application users with institution association and roles';
COMMENT ON TABLE subscriptions IS 'Stripe subscription tracking for institutions';
COMMENT ON TABLE audit_logs IS 'Audit trail of important user actions';
