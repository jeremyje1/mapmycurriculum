"use client";
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function SeedDemoData() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const supabase = createClient();

  const seedDemoData = async () => {
    setIsSeeding(true);
    setResults([]);

    try {
      // Get demo institution UUID first
      const { data: institutionData, error: instError } = await supabase
        .from('institutions')
        .select('id')
        .eq('name', 'Demo Institution')
        .single();

      if (instError) {
        throw new Error('Demo institution not found. Please run the database migration first.');
      }

      const demoInstitutionId = institutionData.id;

      // Clear existing data
      await supabase.from('simple_alignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('learning_outcomes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Seed Programs
      const programsResult = await supabase.from('programs').insert([
        {
          code: 'BUS-AA-TX',
          name: 'Associate of Arts in Business (Texas Transfer Pathway)',
          degree_type: 'AA',
          catalog_year: '2025-2026',
          institution_id: demoInstitutionId
        }
      ]);

      if (programsResult.error) throw programsResult.error;
      setResults(prev => [...prev, '✅ Programs seeded']);

      // Seed Courses
      const coursesData = [
        { subject: 'ENGL', number: '1301', title: 'Composition I', credits: 3, cip_code: '23.1301', tccns: 'ENGL 1301', core_area: 'Communication' },
        { subject: 'ENGL', number: '1302', title: 'Composition II', credits: 3, cip_code: '23.1301', tccns: 'ENGL 1302', core_area: 'Communication' },
        { subject: 'MATH', number: '1325', title: 'Calculus for Business & Social Sciences', credits: 3, cip_code: '27.0101', tccns: 'MATH 1325', core_area: 'Mathematics' },
        { subject: 'HIST', number: '1301', title: 'United States History I', credits: 3, cip_code: '54.0102', tccns: 'HIST 1301', core_area: 'American History' },
        { subject: 'ACCT', number: '2301', title: 'Principles of Financial Accounting', credits: 3, cip_code: '52.0301', tccns: 'ACCT 2301', core_area: '' },
        { subject: 'ACCT', number: '2302', title: 'Principles of Managerial Accounting', credits: 3, cip_code: '52.0301', tccns: 'ACCT 2302', core_area: '' },
        { subject: 'ECON', number: '2301', title: 'Principles of Macroeconomics', credits: 3, cip_code: '45.0601', tccns: 'ECON 2301', core_area: '' },
        { subject: 'ECON', number: '2302', title: 'Principles of Microeconomics', credits: 3, cip_code: '45.0601', tccns: 'ECON 2302', core_area: '' },
        { subject: 'SPCH', number: '1315', title: 'Public Speaking', credits: 3, cip_code: '09.0101', tccns: 'SPCH 1315', core_area: 'Component Area Option' }
      ];

      const coursesResult = await supabase.from('courses').insert(
        coursesData.map(course => ({ ...course, institution_id: demoInstitutionId }))
      );

      if (coursesResult.error) throw coursesResult.error;
      setResults(prev => [...prev, '✅ Courses seeded']);

      // Seed Outcomes
      const outcomesData = [
        { type: 'PLO', owner_code: 'BUS-AA-TX', code: 'PLO1', level: 'M', description: 'Apply accounting and quantitative analysis to business decisions.' },
        { type: 'PLO', owner_code: 'BUS-AA-TX', code: 'PLO2', level: 'M', description: 'Demonstrate professional written and oral communication in business contexts.' },
        { type: 'PLO', owner_code: 'BUS-AA-TX', code: 'PLO3', level: 'M', description: 'Analyze economic principles and their impact on business operations.' },
        { type: 'CLO', owner_code: 'ACCT 2301', code: 'CLO_ACCT2301_1', level: 'D', description: 'Prepare and interpret basic financial statements.' },
        { type: 'CLO', owner_code: 'ACCT 2302', code: 'CLO_ACCT2302_1', level: 'M', description: 'Analyze cost behavior and apply budgeting techniques.' },
        { type: 'CLO', owner_code: 'MATH 1325', code: 'CLO_MATH1325_1', level: 'I', description: 'Use derivatives to solve marginal analysis problems.' },
        { type: 'CLO', owner_code: 'ECON 2302', code: 'CLO_ECON2302_1', level: 'D', description: 'Apply supply and demand to market analysis.' },
        { type: 'CLO', owner_code: 'ECON 2301', code: 'CLO_ECON2301_1', level: 'I', description: 'Explain macroeconomic indicators and fiscal policy.' },
        { type: 'CLO', owner_code: 'ENGL 1302', code: 'CLO_ENGL1302_1', level: 'D', description: 'Write sourced analytical essays in standard business formats.' },
        { type: 'CLO', owner_code: 'SPCH 1315', code: 'CLO_SPCH1315_1', level: 'M', description: 'Deliver organized, audience-centered oral presentations.' }
      ];

      const outcomesResult = await supabase.from('learning_outcomes').insert(
        outcomesData.map(outcome => ({ ...outcome, institution_id: demoInstitutionId }))
      );

      if (outcomesResult.error) throw outcomesResult.error;
      setResults(prev => [...prev, '✅ Learning outcomes seeded']);

      // Seed Alignments
      const alignmentsData = [
        { program_code: 'BUS-AA-TX', plo_code: 'PLO1', course_subject: 'ACCT', course_number: '2301', clo_code: 'CLO_ACCT2301_1', level: 'D', weight: 0.8 },
        { program_code: 'BUS-AA-TX', plo_code: 'PLO1', course_subject: 'ACCT', course_number: '2302', clo_code: 'CLO_ACCT2302_1', level: 'M', weight: 0.9 },
        { program_code: 'BUS-AA-TX', plo_code: 'PLO1', course_subject: 'MATH', course_number: '1325', clo_code: 'CLO_MATH1325_1', level: 'I', weight: 0.6 },
        { program_code: 'BUS-AA-TX', plo_code: 'PLO1', course_subject: 'ECON', course_number: '2302', clo_code: 'CLO_ECON2302_1', level: 'D', weight: 0.7 },
        { program_code: 'BUS-AA-TX', plo_code: 'PLO2', course_subject: 'ENGL', course_number: '1302', clo_code: 'CLO_ENGL1302_1', level: 'D', weight: 0.8 },
        { program_code: 'BUS-AA-TX', plo_code: 'PLO2', course_subject: 'SPCH', course_number: '1315', clo_code: 'CLO_SPCH1315_1', level: 'M', weight: 0.9 },
        { program_code: 'BUS-AA-TX', plo_code: 'PLO3', course_subject: 'ECON', course_number: '2301', clo_code: 'CLO_ECON2301_1', level: 'I', weight: 0.7 },
        { program_code: 'BUS-AA-TX', plo_code: 'PLO3', course_subject: 'ECON', course_number: '2302', clo_code: 'CLO_ECON2302_1', level: 'D', weight: 0.8 }
      ];

      const alignmentsResult = await supabase.from('simple_alignments').insert(
        alignmentsData.map(alignment => ({ ...alignment, institution_id: demoInstitutionId }))
      );

      if (alignmentsResult.error) throw alignmentsResult.error;
      setResults(prev => [...prev, '✅ Curriculum alignments seeded']);

      setResults(prev => [...prev, '🎉 Demo data successfully loaded! You can now test all features.']);

    } catch (error) {
      console.error('Error seeding data:', error);
      setResults(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <main style={{ padding: '2.5rem', maxWidth: 800 }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Load Demo Data</h1>
          <a href="/enterprise/dashboard" className="btn outline">← Back to Dashboard</a>
        </div>
        <p style={{ color: '#666', margin: 0 }}>
          Load sample curriculum data to test the system features.
        </p>
      </header>

      <div style={{ 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '8px', 
        padding: '20px', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ color: '#856404', marginBottom: '8px' }}>⚠️ Demo Data</h3>
        <p style={{ color: '#856404', margin: 0 }}>
          This will load sample curriculum data for a Business Associate degree program. 
          This will replace any existing data in your database.
        </p>
      </div>

      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e0e6f0',
        borderRadius: '8px', 
        padding: '24px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Demo Data Includes:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.6 }}>
          <li><strong>1 Program:</strong> Associate of Arts in Business (Texas Transfer Pathway)</li>
          <li><strong>9 Courses:</strong> English, Math, History, Accounting, Economics, Speech</li>
          <li><strong>10 Learning Outcomes:</strong> 3 PLOs and 7 CLOs</li>
          <li><strong>8 Alignments:</strong> PLO-to-CLO curriculum mappings</li>
        </ul>
      </div>

      <button 
        onClick={seedDemoData}
        disabled={isSeeding}
        className="btn primary"
        style={{ marginBottom: '2rem' }}
      >
        {isSeeding ? '🔄 Loading Demo Data...' : '📊 Load Demo Data'}
      </button>

      {results.length > 0 && (
        <div style={{ 
          background: '#fff',
          border: '1px solid #e0e6f0',
          borderRadius: '8px', 
          padding: '20px'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Results:</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {results.map((result, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                {result}
              </div>
            ))}
          </div>
          
          {results.some(r => r.includes('🎉')) && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#d4edda', borderRadius: '6px' }}>
              <h4 style={{ color: '#155724', marginBottom: '8px' }}>Next Steps:</h4>
              <div style={{ color: '#155724', fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '8px' }}>
                  🎯 <a href="/enterprise/dashboard/analysis" style={{ color: '#155724' }}>Run Gap Analysis</a> - See curriculum compliance and gaps
                </div>
                <div style={{ marginBottom: '8px' }}>
                  🗺️ <a href="/enterprise/dashboard/alignment" style={{ color: '#155724' }}>View Alignment Map</a> - Visualize PLO-CLO mappings
                </div>
                <div>
                  📊 <a href="/enterprise/dashboard/import" style={{ color: '#155724' }}>Import More Data</a> - Add your own curriculum data
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
