"use client";
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';

interface ImportStats {
  programs: number;
  courses: number;
  outcomes: number;
  alignments: number;
}

export default function ImportPage() {
  const [uploadStatus, setUploadStatus] = useState<{[key: string]: 'idle' | 'uploading' | 'success' | 'error'}>({
    programs: 'idle',
    courses: 'idle', 
    outcomes: 'idle',
    alignments: 'idle'
  });
  
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string[]}>({});
  const [stats, setStats] = useState<ImportStats>({
    programs: 0,
    courses: 0,
    outcomes: 0,
    alignments: 0
  });

  const supabase = createClient();

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const handleFileUpload = async (file: File, type: string) => {
    setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }));
    setUploadErrors(prev => ({ ...prev, [type]: [] }));

    try {
      const csvText = await file.text();
      const data = parseCSV(csvText);

      if (data.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      // Get current user's institution
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', userData.user.id)
        .single();

      if (!profileData?.institution_id) {
        throw new Error('Institution not found for user');
      }

      const institutionId = profileData.institution_id;

      // Insert data into Supabase based on type
      let result;
      switch (type) {
        case 'programs':
          result = await supabase.from('programs').insert(data.map(item => ({
            name: item.name,
            code: item.code,
            description: item.description,
            degree_type: item.degree_type,
            type: item.type,
            credits: item.credits ? parseInt(item.credits) : null,
            level: item.level,
            catalog_year: item.catalog_year,
            institution_id: institutionId
          })));
          break;
        
        case 'courses':
          result = await supabase.from('courses').insert(data.map(item => ({
            name: item.title || item.name,
            code: `${item.subject} ${item.number}`,
            description: item.description,
            credits: item.credits ? parseInt(item.credits) : 0,
            subject: item.subject,
            number: item.number,
            title: item.title,
            cip_code: item.cip_code,
            tccns: item.tccns,
            core_area: item.core_area,
            institution_id: institutionId
          })));
          break;
        
        case 'outcomes':
          result = await supabase.from('learning_outcomes').insert(data.map(item => ({
            name: item.code,
            description: item.description,
            outcome_type: item.type === 'PLO' ? 'program' : 'course',
            type: item.type,
            owner_code: item.owner_code,
            code: item.code,
            level: item.level,
            institution_id: institutionId
          })));
          break;
        
        case 'alignments':
          result = await supabase.from('simple_alignments').insert(data.map(item => ({
            institution_id: institutionId,
            program_code: item.program_code,
            plo_code: item.plo_code,
            course_subject: item.course_subject,
            course_number: item.course_number,
            clo_code: item.clo_code,
            level: item.level,
            weight: parseFloat(item.weight) || 0.0
          })));
          break;
      }

      if (result?.error) {
        throw new Error(result.error.message);
      }

      setUploadStatus(prev => ({ ...prev, [type]: 'success' }));
      await refreshStats();
      
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
      setUploadErrors(prev => ({ 
        ...prev, 
        [type]: [error instanceof Error ? error.message : 'Unknown error'] 
      }));
    }
  };

  const refreshStats = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', userData.user.id)
        .single();

      if (!profileData?.institution_id) return;

      const [programsCount, coursesCount, outcomesCount, alignmentsCount] = await Promise.all([
        supabase.from('programs').select('*', { count: 'exact', head: true }).eq('institution_id', profileData.institution_id),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('institution_id', profileData.institution_id),
        supabase.from('learning_outcomes').select('*', { count: 'exact', head: true }).eq('institution_id', profileData.institution_id),
        supabase.from('simple_alignments').select('*', { count: 'exact', head: true }).eq('institution_id', profileData.institution_id)
      ]);

      setStats({
        programs: programsCount.count || 0,
        courses: coursesCount.count || 0,
        outcomes: outcomesCount.count || 0,
        alignments: alignmentsCount.count || 0
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  React.useEffect(() => {
    refreshStats();
  }, []);

  const FileUploadSection = ({ type, title, description }: { type: string; title: string; description: string }) => {
    const status = uploadStatus[type];
    const errors = uploadErrors[type] || [];

    const getStatusColor = () => {
      if (status === 'error') return '#f8d7da';
      if (status === 'success') return '#d4edda';
      if (status === 'uploading') return '#d1ecf1';
      return '#fff';
    };

    const getTextColor = () => {
      if (status === 'error') return '#721c24';
      if (status === 'success') return '#155724';
      if (status === 'uploading') return '#0c5460';
      return '#333';
    };

    return (
      <div style={{
        border: '2px dashed #ddd',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center',
        backgroundColor: getStatusColor(),
        color: getTextColor(),
        transition: 'all 0.3s ease'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', opacity: 0.8 }}>{description}</p>
        
        {status === 'uploading' && (
          <div style={{ margin: '16px 0' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Uploading...</div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e9ecef',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#17a2b8',
                animation: 'progress 1.5s ease-in-out infinite'
              }} />
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div style={{ fontSize: '0.9rem', margin: '16px 0' }}>✅ Upload successful!</div>
        )}
        
        {status === 'error' && errors.length > 0 && (
          <div style={{ margin: '16px 0' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>❌ Upload failed:</div>
            {errors.map((error, index) => (
              <div key={`${type}-error-${index}`} style={{ color: '#721c24', fontSize: '0.9rem' }}>• {error}</div>
            ))}
          </div>
        )}
        
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file, type);
            }
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: status === 'uploading' ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: status === 'uploading' ? 'not-allowed' : 'pointer'
          }}
          disabled={status === 'uploading'}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
          📊 Curriculum Data Import
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px' }}>
          Upload CSV files to import your curriculum data. Each file type has specific required columns.
        </p>
        
        {/* Current Data Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>{stats.programs}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Programs</div>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.courses}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Courses</div>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>{stats.outcomes}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Learning Outcomes</div>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>{stats.alignments}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Alignments</div>
          </div>
        </div>
      </div>

      {/* Upload Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <FileUploadSection
          type="programs"
          title="📋 Programs"
          description="Upload CSV with columns: name, code, description, degree_type, type, credits, level, catalog_year"
        />
        
        <FileUploadSection
          type="courses"
          title="📚 Courses"
          description="Upload CSV with columns: subject, number, title, credits, cip_code, tccns, core_area"
        />
        
        <FileUploadSection
          type="outcomes"
          title="🎯 Learning Outcomes"
          description="Upload CSV with columns: type, owner_code, code, level, description"
        />
        
        <FileUploadSection
          type="alignments"
          title="🔗 Curriculum Alignments"
          description="Upload CSV with columns: program_code, plo_code, course_subject, course_number, clo_code, level, weight"
        />
      </div>

      {/* Sample Data Templates */}
      <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '16px' }}>📝 Sample CSV Templates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <h4>Programs CSV:</h4>
            <code style={{ display: 'block', backgroundColor: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.8rem' }}>
              name,code,degree_type,catalog_year<br/>
              Business Admin AA,BUS-AA-TX,AA,2025-2026
            </code>
          </div>
          <div>
            <h4>Courses CSV:</h4>
            <code style={{ display: 'block', backgroundColor: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.8rem' }}>
              subject,number,title,credits<br/>
              ACCT,2301,Financial Accounting,3
            </code>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
