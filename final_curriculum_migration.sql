-- Curriculum Mapping System Database Migration (Simplified Version)
-- Run this SQL in Supabase SQL Editor to enable curriculum mapping features
-- This works with existing database schema without changing core structure

-- Only add curriculum fields to existing tables (if they exist)
-- Skip table creation to avoid type conflicts

-- Add curriculum fields to programs table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'programs') THEN
    ALTER TABLE public.programs 
    ADD COLUMN IF NOT EXISTS type TEXT,
    ADD COLUMN IF NOT EXISTS credits INTEGER,
    ADD COLUMN IF NOT EXISTS level TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS catalog_year TEXT;
  END IF;
END $$;

-- Add curriculum fields to courses table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
    ALTER TABLE public.courses 
    ADD COLUMN IF NOT EXISTS subject TEXT,
    ADD COLUMN IF NOT EXISTS number TEXT,
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS cip_code TEXT,
    ADD COLUMN IF NOT EXISTS tccns TEXT,
    ADD COLUMN IF NOT EXISTS core_area TEXT;
  END IF;
END $$;

-- Add curriculum fields to learning_outcomes table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'learning_outcomes') THEN
    ALTER TABLE public.learning_outcomes 
    ADD COLUMN IF NOT EXISTS type TEXT,
    ADD COLUMN IF NOT EXISTS owner_code TEXT,
    ADD COLUMN IF NOT EXISTS code TEXT,
    ADD COLUMN IF NOT EXISTS level TEXT;
  END IF;
END $$;

-- Create simple alignments table without foreign key constraints
-- This ensures compatibility with any existing institution_id type
CREATE TABLE IF NOT EXISTS public.simple_alignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id TEXT NOT NULL,  -- Using TEXT to match your existing schema
  program_code TEXT NOT NULL,
  plo_code TEXT NOT NULL,
  course_subject TEXT NOT NULL,
  course_number TEXT NOT NULL,
  clo_code TEXT NOT NULL,
  level TEXT NOT NULL,
  weight DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for simple_alignments
ALTER TABLE public.simple_alignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for simple_alignments (compatible with existing auth pattern)
CREATE POLICY "Users can view simple_alignments from their institution" ON public.simple_alignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id::TEXT = simple_alignments.institution_id
    )
  );

CREATE POLICY "Users can insert simple_alignments for their institution" ON public.simple_alignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id::TEXT = simple_alignments.institution_id
    )
  );

CREATE POLICY "Users can update simple_alignments from their institution" ON public.simple_alignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id::TEXT = simple_alignments.institution_id
    )
  );

CREATE POLICY "Users can delete simple_alignments from their institution" ON public.simple_alignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id::TEXT = simple_alignments.institution_id
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_simple_alignments_institution_id ON public.simple_alignments(institution_id);
CREATE INDEX IF NOT EXISTS idx_simple_alignments_program_code ON public.simple_alignments(program_code);

-- Success message
SELECT 'Curriculum mapping migration completed successfully!' AS status;
