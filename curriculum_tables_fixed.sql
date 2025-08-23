-- Fixed curriculum tables SQL
-- Run this to create curriculum mapping tables

-- Drop existing problematic tables
DROP TABLE IF EXISTS public.alignments CASCADE;
DROP TABLE IF EXISTS public.outcomes CASCADE;
DROP TABLE IF EXISTS public.curriculum_courses CASCADE;
DROP TABLE IF EXISTS public.curriculum_outcomes CASCADE;
DROP TABLE IF EXISTS public.curriculum_alignments_new CASCADE;

-- Add fields to existing programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS catalog_year TEXT;

-- Create curriculum courses table
CREATE TABLE public.curriculum_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER DEFAULT 0,
    cip_code TEXT,
    tccns TEXT,
    core_area TEXT,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(subject, number, institution_id)
);

-- Create curriculum outcomes table
CREATE TABLE public.curriculum_outcomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('PLO', 'CLO')),
    owner_code TEXT NOT NULL,
    code TEXT NOT NULL,
    level TEXT CHECK (level IN ('I', 'D', 'M')),
    description TEXT NOT NULL,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.curriculum_courses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(code, institution_id)
);

-- Create curriculum alignments table
CREATE TABLE public.curriculum_alignments_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_code TEXT NOT NULL,
    plo_code TEXT NOT NULL,
    course_subject TEXT NOT NULL,
    course_number TEXT NOT NULL,
    clo_code TEXT NOT NULL,
    level TEXT CHECK (level IN ('I', 'D', 'M')),
    weight DECIMAL(3,2) DEFAULT 0.0,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_curriculum_courses_institution ON public.curriculum_courses(institution_id);
CREATE INDEX idx_curriculum_courses_subject_number ON public.curriculum_courses(subject, number);
CREATE INDEX idx_curriculum_outcomes_institution ON public.curriculum_outcomes(institution_id);
CREATE INDEX idx_curriculum_outcomes_type_owner ON public.curriculum_outcomes(type, owner_code);
CREATE INDEX idx_curriculum_alignments_new_institution ON public.curriculum_alignments_new(institution_id);
CREATE INDEX idx_curriculum_alignments_new_program ON public.curriculum_alignments_new(program_code);

-- Insert demo institution if it doesn't exist
INSERT INTO public.institutions (name, domain, subscription_tier) 
VALUES ('Demo Institution', 'demo.edu', 'pro')
ON CONFLICT (domain) DO NOTHING;

-- Enable RLS
ALTER TABLE public.curriculum_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_alignments_new ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY courses_policy ON public.curriculum_courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY outcomes_policy ON public.curriculum_outcomes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY alignments_policy ON public.curriculum_alignments_new FOR ALL USING (auth.role() = 'authenticated');
