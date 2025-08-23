-- Note: auth.users table RLS is managed by Supabase automatically
-- We only create our own tables and policies

-- Create custom profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'institution_admin')),
  institution_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on institutions
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  degree_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(institution_id, code)
);

-- Enable RLS on programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(institution_id, code)
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create learning_outcomes table
CREATE TABLE IF NOT EXISTS public.learning_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  outcome_type TEXT DEFAULT 'course' CHECK (outcome_type IN ('course', 'program', 'institutional')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on learning_outcomes
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;

-- Create curriculum_alignments table for mapping outcomes
CREATE TABLE IF NOT EXISTS public.curriculum_alignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  source_outcome_id UUID REFERENCES public.learning_outcomes(id) ON DELETE CASCADE NOT NULL,
  target_outcome_id UUID REFERENCES public.learning_outcomes(id) ON DELETE CASCADE NOT NULL,
  alignment_strength TEXT DEFAULT 'moderate' CHECK (alignment_strength IN ('weak', 'moderate', 'strong')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(source_outcome_id, target_outcome_id)
);

-- Enable RLS on curriculum_alignments
ALTER TABLE public.curriculum_alignments ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint for institution_id in profiles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_institution_id_fkey 
  FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Institution admins can view institution profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'institution_admin' 
      AND p.institution_id = profiles.institution_id
    )
  );

-- Institutions policies
CREATE POLICY "Users can view their institution" ON public.institutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = institutions.id
    )
  );

CREATE POLICY "Institution admins can update their institution" ON public.institutions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'institution_admin' 
      AND p.institution_id = institutions.id
    )
  );

-- Programs policies
CREATE POLICY "Users can view institution programs" ON public.programs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = programs.institution_id
    )
  );

CREATE POLICY "Institution admins can manage programs" ON public.programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('institution_admin', 'admin') 
      AND p.institution_id = programs.institution_id
    )
  );

-- Courses policies
CREATE POLICY "Users can view institution courses" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = courses.institution_id
    )
  );

CREATE POLICY "Institution admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('institution_admin', 'admin') 
      AND p.institution_id = courses.institution_id
    )
  );

-- Learning outcomes policies
CREATE POLICY "Users can view institution outcomes" ON public.learning_outcomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = learning_outcomes.institution_id
    )
  );

CREATE POLICY "Institution admins can manage outcomes" ON public.learning_outcomes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('institution_admin', 'admin') 
      AND p.institution_id = learning_outcomes.institution_id
    )
  );

-- Curriculum alignments policies
CREATE POLICY "Users can view institution alignments" ON public.curriculum_alignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id = curriculum_alignments.institution_id
    )
  );

CREATE POLICY "Institution admins can manage alignments" ON public.curriculum_alignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('institution_admin', 'admin') 
      AND p.institution_id = curriculum_alignments.institution_id
    )
  );

-- Functions and Triggers

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_learning_outcomes_updated_at BEFORE UPDATE ON public.learning_outcomes
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create storage bucket for curriculum documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('curriculum-documents', 'curriculum-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can view institution documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'curriculum-documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.institution_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Institution admins can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'curriculum-documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('institution_admin', 'admin')
      AND p.institution_id::text = (storage.foldername(name))[1]
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_programs_institution_id ON public.programs(institution_id);
CREATE INDEX IF NOT EXISTS idx_courses_institution_id ON public.courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_courses_program_id ON public.courses(program_id);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_institution_id ON public.learning_outcomes(institution_id);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_course_id ON public.learning_outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_program_id ON public.learning_outcomes(program_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_alignments_institution_id ON public.curriculum_alignments(institution_id);
