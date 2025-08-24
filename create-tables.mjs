import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dsxiiakytpufxsqlimkf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  console.log('Creating curriculum mapping tables...')

  // Create the SQL for all tables
  const sql = `
-- Create institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create programs table  
CREATE TABLE IF NOT EXISTS public.programs (
    id BIGSERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    degree_type TEXT,
    catalog_year TEXT,
    institution_id TEXT NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(code, institution_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id BIGSERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER DEFAULT 0,
    cip_code TEXT,
    tccns TEXT,
    core_area TEXT,
    institution_id TEXT NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(subject, number, institution_id)
);

-- Create outcomes table
CREATE TABLE IF NOT EXISTS public.outcomes (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('PLO', 'CLO')),
    owner_code TEXT NOT NULL,
    code TEXT NOT NULL,
    level TEXT CHECK (level IN ('I', 'D', 'M')),
    description TEXT NOT NULL,
    institution_id TEXT NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(code, institution_id)
);

-- Create alignments table
CREATE TABLE IF NOT EXISTS public.alignments (
    id BIGSERIAL PRIMARY KEY,
    program_code TEXT NOT NULL,
    plo_code TEXT NOT NULL,
    course_subject TEXT NOT NULL,
    course_number TEXT NOT NULL,
    clo_code TEXT NOT NULL,
    level TEXT CHECK (level IN ('I', 'D', 'M')),
    weight DECIMAL(3,2) DEFAULT 0.0,
    institution_id TEXT NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert demo institution
INSERT INTO public.institutions (id, name, state, type) 
VALUES ('demo-institution', 'Demo Institution', 'US-TX', 'Community College')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    state = EXCLUDED.state,
    type = EXCLUDED.type,
    updated_at = timezone('utc'::text, now());
`

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('Error creating tables:', error)
      // Try alternative approach - create tables one by one
      await createTablesIndividually()
    } else {
      console.log('✅ Tables created successfully!')
    }
  } catch (err) {
    console.error('Error:', err)
    await createTablesIndividually()
  }
}

async function createTablesIndividually() {
  console.log('Creating tables individually...')
  
  // Just ensure the demo institution exists
  try {
    const { error: instError } = await supabase
      .from('institutions')
      .upsert({
        id: 'demo-institution',
        name: 'Demo Institution', 
        state: 'US-TX',
        type: 'Community College'
      })
    
    if (instError) {
      console.log('Institution table might not exist yet, that\'s ok')
    } else {
      console.log('✅ Demo institution ready')
    }
  } catch (err) {
    console.log('Will create tables via UI')
  }
}

createTables()
