-- Simple curriculum extension using existing tables
-- This works with your existing schema

-- Add curriculum-specific fields to existing tables
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS catalog_year TEXT;

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS cip_code TEXT,
ADD COLUMN IF NOT EXISTS tccns TEXT,
ADD COLUMN IF NOT EXISTS core_area TEXT;

-- Update courses table structure to match our needs
ALTER TABLE public.courses 
ALTER COLUMN name DROP NOT NULL;

-- Add curriculum-specific fields to existing learning_outcomes table
ALTER TABLE public.learning_outcomes 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('PLO', 'CLO')),
ADD COLUMN IF NOT EXISTS owner_code TEXT,
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('I', 'D', 'M'));

-- Create a simple alignments table that references existing tables
CREATE TABLE IF NOT EXISTS public.simple_alignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_code TEXT NOT NULL,
    plo_code TEXT NOT NULL,
    course_subject TEXT NOT NULL,
    course_number TEXT NOT NULL,
    clo_code TEXT NOT NULL,
    level TEXT CHECK (level IN ('I', 'D', 'M')),
    weight DECIMAL(3,2) DEFAULT 0.0,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_simple_alignments_institution ON public.simple_alignments(institution_id);
CREATE INDEX IF NOT EXISTS idx_simple_alignments_program ON public.simple_alignments(program_code);

-- Create a demo institution if it doesn't exist
INSERT INTO public.institutions (name, domain, subscription_tier) 
VALUES ('Demo Institution', 'demo.edu', 'pro')
ON CONFLICT (domain) DO NOTHING;

-- Enable RLS
ALTER TABLE public.simple_alignments ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY simple_alignments_policy ON public.simple_alignments 
FOR ALL USING (auth.role() = 'authenticated');
