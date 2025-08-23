"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Program {
  id: string;
  code: string;
  name: string;
  degree_type: string;
}

interface Course {
  id: string;
  subject: string;
  number: string;
  title: string;
  credits: number;
}

interface Outcome {
  id: string;
  type: 'PLO' | 'CLO';
  owner_code: string;
  code: string;
  level: 'I' | 'D' | 'M';
  description: string;
}

interface Alignment {
  id: string;
  program_code: string;
  plo_code: string;
  course_subject: string;
  course_number: string;
  clo_code: string;
  level: 'I' | 'D' | 'M';
  weight: number;
}

export default function AlignmentPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [alignments, setAlignments] = useState<Alignment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [programsRes, coursesRes, outcomesRes, alignmentsRes] = await Promise.all([
        supabase.from('programs').select('*').order('name'),
        supabase.from('courses').select('*').order('subject, number'),
        supabase.from('learning_outcomes').select('*').order('type, code'),
        supabase.from('simple_alignments').select('*')
      ]);

      if (programsRes.error) throw programsRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (outcomesRes.error) throw outcomesRes.error;
      if (alignmentsRes.error) throw alignmentsRes.error;

      setPrograms(programsRes.data || []);
      setCourses(coursesRes.data || []);
      setOutcomes(outcomesRes.data || []);
      setAlignments(alignmentsRes.data || []);

      if ((programsRes.data || []).length > 0) {
        setSelectedProgram((programsRes.data || [])[0].code);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProgramData = programs.find(p => p.code === selectedProgram);
  const programPLOs = outcomes.filter(o => o.type === 'PLO' && o.owner_code === selectedProgram);
  const programAlignments = alignments.filter(a => a.program_code === selectedProgram);

  // Group courses by alignments
  const alignedCourses = programAlignments.reduce((acc, alignment) => {
    const courseKey = `${alignment.course_subject} ${alignment.course_number}`;
    if (!acc[courseKey]) {
      const course = courses.find(c => 
        c.subject === alignment.course_subject && c.number === alignment.course_number
      );
      acc[courseKey] = {
        course: course || { subject: alignment.course_subject, number: alignment.course_number, title: 'Unknown Course', credits: 0 },
        alignments: []
      };
    }
    acc[courseKey].alignments.push(alignment);
    return acc;
  }, {} as { [key: string]: { course: any; alignments: Alignment[] } });

  const generateAlignmentMatrix = () => {
    if (!selectedProgram || programPLOs.length === 0) return null;

    const matrix: { [ploCode: string]: { [courseKey: string]: Alignment[] } } = {};
    
    // Initialize matrix
    programPLOs.forEach(plo => {
      matrix[plo.code] = {};
      Object.keys(alignedCourses).forEach(courseKey => {
        matrix[plo.code][courseKey] = [];
      });
    });

    // Fill matrix with alignments
    programAlignments.forEach(alignment => {
      const courseKey = `${alignment.course_subject} ${alignment.course_number}`;
      if (matrix[alignment.plo_code]) {
        if (!matrix[alignment.plo_code][courseKey]) {
          matrix[alignment.plo_code][courseKey] = [];
        }
        matrix[alignment.plo_code][courseKey].push(alignment);
      }
    });

    return matrix;
  };

  const alignmentMatrix = generateAlignmentMatrix();

  const levelColors = {
    'I': '#e3f2fd', // Light blue
    'D': '#fff3e0', // Light orange  
    'M': '#e8f5e8'  // Light green
  };

  const levelIcons = {
    'I': '🟦', // Introduced
    'D': '🟨', // Developed
    'M': '🟩'  // Mastered
  };

  if (isLoading) {
    return (
      <main style={{ padding: '2.5rem', maxWidth: 1200 }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <div>Loading curriculum data...</div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2.5rem', maxWidth: 1400 }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Curriculum Alignment Map</h1>
          <a href="/enterprise/dashboard" className="btn outline">← Back to Dashboard</a>
        </div>
        <p style={{ color: '#666', margin: 0 }}>
          Visualize how Program Learning Outcomes align with Course Learning Outcomes across your curriculum.
        </p>
      </header>

      {/* Program Selector */}
      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e0e6f0',
        borderRadius: '8px', 
        padding: '20px', 
        marginBottom: '2rem' 
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
              Select Program:
            </label>
            <select 
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              style={{ 
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minWidth: '300px'
              }}
            >
              {programs.map(program => (
                <option key={program.code} value={program.code}>
                  {program.name} ({program.code})
                </option>
              ))}
            </select>
          </div>
          
          {selectedProgramData && (
            <div style={{ 
              background: '#fff', 
              border: '1px solid #e0e6f0',
              borderRadius: '6px', 
              padding: '12px',
              fontSize: '0.9rem'
            }}>
              <div><strong>Degree:</strong> {selectedProgramData.degree_type}</div>
              <div><strong>PLOs:</strong> {programPLOs.length}</div>
              <div><strong>Aligned Courses:</strong> {Object.keys(alignedCourses).length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        background: '#fff',
        border: '1px solid #e0e6f0',
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '2rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontWeight: '600' }}>Learning Levels:</div>
        {Object.entries(levelIcons).map(([level, icon]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <span style={{ fontSize: '0.9rem' }}>
              <strong>{level}</strong> - {level === 'I' ? 'Introduced' : level === 'D' ? 'Developed' : 'Mastered'}
            </span>
          </div>
        ))}
      </div>

      {/* Alignment Matrix */}
      {selectedProgram && alignmentMatrix && Object.keys(alignedCourses).length > 0 ? (
        <section>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>📋 PLO-Course Alignment Matrix</h2>
          
          <div style={{ overflowX: 'auto', border: '1px solid #e0e6f0', borderRadius: '8px', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #e0e6f0',
                    borderRight: '1px solid #e0e6f0',
                    fontWeight: '600',
                    minWidth: '200px'
                  }}>
                    Program Learning Outcomes
                  </th>
                  {Object.keys(alignedCourses).map(courseKey => {
                    const courseData = alignedCourses[courseKey].course;
                    return (
                      <th key={courseKey} style={{ 
                        padding: '12px', 
                        textAlign: 'center', 
                        borderBottom: '1px solid #e0e6f0',
                        borderRight: '1px solid #e0e6f0',
                        fontWeight: '600',
                        minWidth: '120px',
                        maxWidth: '150px'
                      }}>
                        <div style={{ marginBottom: '4px' }}>{courseKey}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>
                          {courseData.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>
                          {courseData.credits} credits
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {programPLOs.map(plo => (
                  <tr key={plo.code}>
                    <td style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #e0e6f0',
                      borderRight: '1px solid #e0e6f0',
                      background: '#fafbfc',
                      verticalAlign: 'top'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{plo.code}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {plo.description.length > 80 
                          ? plo.description.substring(0, 80) + '...' 
                          : plo.description}
                      </div>
                    </td>
                    {Object.keys(alignedCourses).map(courseKey => {
                      const cellAlignments = alignmentMatrix[plo.code]?.[courseKey] || [];
                      return (
                        <td key={courseKey} style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e6f0',
                          borderRight: '1px solid #e0e6f0',
                          background: cellAlignments.length > 0 ? levelColors[cellAlignments[0].level] : 'transparent',
                          verticalAlign: 'middle'
                        }}>
                          {cellAlignments.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <div style={{ fontSize: '1.2rem' }}>
                                {levelIcons[cellAlignments[0].level]}
                              </div>
                              <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                {cellAlignments[0].level}
                              </div>
                              {cellAlignments[0].weight && cellAlignments[0].weight > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                  w: {cellAlignments[0].weight}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#f8fafc',
          border: '1px solid #e0e6f0',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Alignment Data</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            {programs.length === 0 
              ? 'Import your curriculum data first to view alignments.'
              : 'No curriculum alignments found for this program. Import alignment data to see the mapping.'}
          </p>
          <a href="/enterprise/dashboard/import" className="btn primary" style={{ textDecoration: 'none' }}>
            Import Alignment Data
          </a>
        </div>
      )}

      {/* PLO Details */}
      {selectedProgram && programPLOs.length > 0 && (
        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>📝 Program Learning Outcomes Details</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {programPLOs.map(plo => {
              const ploAlignments = programAlignments.filter(a => a.plo_code === plo.code);
              const alignedCourseCount = new Set(ploAlignments.map(a => `${a.course_subject} ${a.course_number}`)).size;
              
              return (
                <div key={plo.code} style={{ 
                  border: '1px solid #e0e6f0', 
                  borderRadius: '8px', 
                  background: '#fff',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{plo.code}</h3>
                      <p style={{ margin: 0, color: '#444', lineHeight: 1.5 }}>{plo.description}</p>
                    </div>
                    <div style={{ 
                      background: '#f8fafc',
                      border: '1px solid #e0e6f0',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginLeft: '16px',
                      textAlign: 'center',
                      minWidth: '100px'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0066cc' }}>
                        {alignedCourseCount}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        courses
                      </div>
                    </div>
                  </div>
                  
                  {ploAlignments.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#666' }}>
                        Mapped to:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Array.from(new Set(ploAlignments.map(a => `${a.course_subject} ${a.course_number}`))).map(courseKey => (
                          <span key={courseKey} style={{ 
                            background: '#e3f2fd',
                            color: '#1565c0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {courseKey}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
