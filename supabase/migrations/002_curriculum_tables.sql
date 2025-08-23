-- Create tables for curriculum mapping data
-- Drop existing curriculum tables if they exist (but keep institutions from 001_initial_setup)
DROP TABLE IF EXISTS public.alignments;
DROP TABLE IF EXISTS public.outcomes;

-- Note: institutions table already exists from 001_initial_setup_fixed.sql with UUID id
-- We'll work with the existing institutions table structure

-- Update existing programs table to add curriculum-specific fields
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS catalog_year TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Create courses table (compatible with existing schema)
CREATE TABLE IF NOT EXISTS public.curriculum_courses (
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

-- Create outcomes table (compatible with existing schema)
CREATE TABLE public.curriculum_outcomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('PLO', 'CLO')),
    owner_code TEXT NOT NULL, -- Program code for PLOs, Course code for CLOs
    code TEXT NOT NULL,
    level TEXT CHECK (level IN ('I', 'D', 'M')), -- Introduced, Developed, Mastered
    description TEXT NOT NULL,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.curriculum_courses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(code, institution_id)
);

-- Create alignments table (compatible with existing schema)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_curriculum_courses_institution ON public.curriculum_courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_courses_subject_number ON public.curriculum_courses(subject, number);
CREATE INDEX IF NOT EXISTS idx_curriculum_courses_program ON public.curriculum_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_outcomes_institution ON public.curriculum_outcomes(institution_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_outcomes_type_owner ON public.curriculum_outcomes(type, owner_code);
CREATE INDEX IF NOT EXISTS idx_curriculum_outcomes_program ON public.curriculum_outcomes(program_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_outcomes_course ON public.curriculum_outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_alignments_new_institution ON public.curriculum_alignments_new(institution_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_alignments_new_program ON public.curriculum_alignments_new(program_code);

-- Insert demo institution (get or create UUID for demo institution)
INSERT INTO public.institutions (name, domain, subscription_tier) 
VALUES ('Demo Institution', 'demo.edu', 'pro')
ON CONFLICT (domain) DO UPDATE SET 
    name = EXCLUDED.name,
    subscription_tier = EXCLUDED.subscription_tier,
    updated_at = timezone('utc'::text, now());

-- Enable Row Level Security (RLS)
ALTER TABLE public.curriculum_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_alignments_new ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view curriculum courses" ON public.curriculum_courses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage curriculum courses" ON public.curriculum_courses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view curriculum outcomes" ON public.curriculum_outcomes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage curriculum outcomes" ON public.curriculum_outcomes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view curriculum alignments" ON public.curriculum_alignments_new
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage curriculum alignments" ON public.curriculum_alignments_new
    FOR ALL USING (auth.role() = 'authenticated');
