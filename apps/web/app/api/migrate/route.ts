import { createServiceClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Execute migration using direct SQL commands
    try {
      // Add curriculum fields to programs table
      await supabase.from('programs').select('id').limit(1);
      
      // Check if columns already exist by trying to select them
      const { error: checkError } = await supabase
        .from('programs')
        .select('type, credits, level, status')
        .limit(1);
      
      if (checkError && checkError.message.includes('column')) {
        // Columns don't exist, need to add them
        return NextResponse.json({ 
          message: 'Migration needed. Please run the SQL manually in Supabase SQL editor.',
          sql: `
-- Add curriculum fields to existing tables
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER,
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS program_id UUID,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER,
ADD COLUMN IF NOT EXISTS cip_code TEXT,
ADD COLUMN IF NOT EXISTS tccns TEXT,
ADD COLUMN IF NOT EXISTS core_area TEXT;

ALTER TABLE learning_outcomes 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS owner_code TEXT,
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create simple alignments table
CREATE TABLE IF NOT EXISTS simple_alignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
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

-- Row Level Security for simple_alignments
ALTER TABLE simple_alignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view simple_alignments from their institution" ON simple_alignments
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM auth.users WHERE auth.users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert simple_alignments for their institution" ON simple_alignments
  FOR INSERT WITH CHECK (
    institution_id IN (
      SELECT institution_id FROM auth.users WHERE auth.users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update simple_alignments from their institution" ON simple_alignments
  FOR UPDATE USING (
    institution_id IN (
      SELECT institution_id FROM auth.users WHERE auth.users.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete simple_alignments from their institution" ON simple_alignments
  FOR DELETE USING (
    institution_id IN (
      SELECT institution_id FROM auth.users WHERE auth.users.id = auth.uid()
    )
  );
          `
        });
      }
      
      // Check if simple_alignments table exists
      const { error: alignmentError } = await supabase
        .from('simple_alignments')
        .select('id')
        .limit(1);
      
      if (alignmentError && alignmentError.message.includes('relation')) {
        return NextResponse.json({ 
          message: 'simple_alignments table missing. Please run the SQL in Supabase SQL editor.',
          sql: 'See above SQL snippet'
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema appears to be ready for curriculum mapping!' 
      });
      
    } catch (dbError) {
      console.error('Database check error:', dbError);
      return NextResponse.json({ 
        message: 'Error checking database schema',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
