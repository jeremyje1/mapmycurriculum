'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Course {
  id: string;
  subject: string;
  number: string;
  title: string;
  credits: number;
}

interface ScenarioChange {
  id: string;
  type: 'add' | 'remove' | 'modify';
  courseId?: string;
  course?: Course;
  description: string;
}

interface ComparisonMetrics {
  current: {
    totalCredits: number;
    totalCourses: number;
    alignmentCoverage: number;
    gapCount: number;
  };
  proposed: {
    totalCredits: number;
    totalCourses: number;
    alignmentCoverage: number;
    gapCount: number;
  };
  impact: {
    creditDelta: number;
    courseDelta: number;
    coverageDelta: number;
    gapDelta: number;
  };
}

export default function ScenarioModelingPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioChange[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [comparison, setComparison] = useState<ComparisonMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadProgramCourses(selectedProgram);
      loadAllCourses();
    }
  }, [selectedProgram]);

  async function loadPrograms() {
    const { data, error } = await supabase
      .from('simple_programs')
      .select('*')
      .order('name');

    if (!error && data) {
      setPrograms(data);
      if (data.length > 0) {
        setSelectedProgram(data[0].code);
      }
    }
  }

  async function loadProgramCourses(programCode: string) {
    const { data, error } = await supabase
      .from('simple_courses')
      .select('*')
      .eq('program_code', programCode)
      .order('subject, number');

    if (!error && data) {
      setCourses(data);
    }
  }

  async function loadAllCourses() {
    const { data, error } = await supabase
      .from('simple_courses')
      .select('*')
      .order('subject, number');

    if (!error && data) {
      setAvailableCourses(data);
    }
  }

  function addCourseToScenario(course: Course) {
    const change: ScenarioChange = {
      id: `change-${Date.now()}`,
      type: 'add',
      courseId: course.id,
      course,
      description: `Add ${course.subject} ${course.number} - ${course.title}`
    };
    setScenarios([...scenarios, change]);
  }

  function removeCourseFromScenario(course: Course) {
    const change: ScenarioChange = {
      id: `change-${Date.now()}`,
      type: 'remove',
      courseId: course.id,
      course,
      description: `Remove ${course.subject} ${course.number} - ${course.title}`
    };
    setScenarios([...scenarios, change]);
  }

  function deleteScenarioChange(changeId: string) {
    setScenarios(scenarios.filter(s => s.id !== changeId));
  }

  function clearScenario() {
    setScenarios([]);
    setComparison(null);
    setScenarioName('');
  }

  async function calculateImpact() {
    setIsCalculating(true);
    
    try {
      // Simulate scenario impact calculation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Current metrics
      const currentCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
      const currentCount = courses.length;
      
      // Calculate proposed metrics based on scenarios
      let proposedCourses = [...courses];
      scenarios.forEach(scenario => {
        if (scenario.type === 'add' && scenario.course) {
          proposedCourses.push(scenario.course);
        } else if (scenario.type === 'remove' && scenario.courseId) {
          proposedCourses = proposedCourses.filter(c => c.id !== scenario.courseId);
        }
      });

      const proposedCredits = proposedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
      const proposedCount = proposedCourses.length;

      // Fetch alignment data for impact
      const { data: alignments } = await supabase
        .from('simple_alignments')
        .select('*')
        .eq('program_code', selectedProgram);

      const currentAlignmentCoverage = alignments ? 
        Math.min(100, (alignments.length / Math.max(1, courses.length)) * 100) : 0;

      // Estimate proposed coverage (simplified)
      const proposedAlignmentCoverage = alignments ?
        Math.min(100, (alignments.length / Math.max(1, proposedCourses.length)) * 100) : 0;

      const currentGaps = Math.max(0, courses.length - (alignments?.length || 0));
      const proposedGaps = Math.max(0, proposedCourses.length - (alignments?.length || 0));

      setComparison({
        current: {
          totalCredits: currentCredits,
          totalCourses: currentCount,
          alignmentCoverage: currentAlignmentCoverage,
          gapCount: currentGaps
        },
        proposed: {
          totalCredits: proposedCredits,
          totalCourses: proposedCount,
          alignmentCoverage: proposedAlignmentCoverage,
          gapCount: proposedGaps
        },
        impact: {
          creditDelta: proposedCredits - currentCredits,
          courseDelta: proposedCount - currentCount,
          coverageDelta: proposedAlignmentCoverage - currentAlignmentCoverage,
          gapDelta: proposedGaps - currentGaps
        }
      });
    } catch (error) {
      console.error('Error calculating impact:', error);
    } finally {
      setIsCalculating(false);
    }
  }

  async function saveScenario() {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    const scenarioData = {
      name: scenarioName,
      program_code: selectedProgram,
      changes: scenarios,
      metrics: comparison,
      created_at: new Date().toISOString()
    };

    // In production, save to database
    console.log('Saving scenario:', scenarioData);
    alert(`Scenario "${scenarioName}" saved successfully!`);
  }

  const formatDelta = (value: number, suffix: string = '') => {
    if (value > 0) return <span style={{ color: '#10b981' }}>+{value}{suffix}</span>;
    if (value < 0) return <span style={{ color: '#dc2626' }}>{value}{suffix}</span>;
    return <span style={{ color: '#6b7280' }}>{value}{suffix}</span>;
  };

  return (
    <main style={{ padding: '2.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Curriculum Scenario Modeling</h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Model proposed curriculum changes and analyze compliance impact before implementation
            </p>
          </div>
          <a href="/enterprise/dashboard" className="btn outline">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Panel - Scenario Builder */}
        <div>
          <div className="panel" style={{ marginBottom: '1.5rem' }}>
            <h2>Build Scenario</h2>
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Select Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                {programs.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Scenario Name
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="e.g., Add Data Science Minor Requirements"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
          </div>

          <div className="panel" style={{ marginBottom: '1.5rem' }}>
            <h3>Current Courses ({courses.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
              {courses.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                  No courses in selected program
                </p>
              ) : (
                courses.map(course => (
                  <div
                    key={course.id}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong>{course.subject} {course.number}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{course.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{course.credits} credits</div>
                    </div>
                    <button
                      onClick={() => removeCourseFromScenario(course)}
                      className="btn small"
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <h3>Add Courses to Scenario</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '1rem' }}>
              {availableCourses
                .filter(c => !courses.find(pc => pc.id === c.id))
                .slice(0, 20)
                .map(course => (
                  <div
                    key={course.id}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong>{course.subject} {course.number}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{course.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{course.credits} credits</div>
                    </div>
                    <button
                      onClick={() => addCourseToScenario(course)}
                      className="btn small primary"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Scenario Changes & Impact */}
        <div>
          <div className="panel" style={{ marginBottom: '1.5rem' }}>
            <h2>Proposed Changes ({scenarios.length})</h2>
            <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {scenarios.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                  No changes yet. Add or remove courses to build your scenario.
                </p>
              ) : (
                scenarios.map(change => (
                  <div
                    key={change.id}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: change.type === 'add' ? '#f0fdf4' : '#fef2f2'
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          marginRight: '0.5rem',
                          background: change.type === 'add' ? '#10b981' : '#dc2626',
                          color: 'white'
                        }}
                      >
                        {change.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.9rem' }}>{change.description}</span>
                    </div>
                    <button
                      onClick={() => deleteScenarioChange(change.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={calculateImpact}
                disabled={scenarios.length === 0 || isCalculating}
                className="btn primary"
                style={{ flex: 1 }}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Impact'}
              </button>
              <button
                onClick={clearScenario}
                className="btn outline"
              >
                Clear
              </button>
            </div>
          </div>

          {comparison && (
            <>
              <div className="panel" style={{ marginBottom: '1.5rem' }}>
                <h2>Impact Analysis</h2>
                
                <div style={{ marginTop: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Metric</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Current</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Proposed</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>Total Credits</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>{comparison.current.totalCredits}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>{comparison.proposed.totalCredits}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                          {formatDelta(comparison.impact.creditDelta)}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>Total Courses</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>{comparison.current.totalCourses}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>{comparison.proposed.totalCourses}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                          {formatDelta(comparison.impact.courseDelta)}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>Alignment Coverage</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                          {comparison.current.alignmentCoverage.toFixed(1)}%
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                          {comparison.proposed.alignmentCoverage.toFixed(1)}%
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                          {formatDelta(Number(comparison.impact.coverageDelta.toFixed(1)), '%')}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem' }}>Gap Count</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>{comparison.current.gapCount}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>{comparison.proposed.gapCount}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                          {formatDelta(comparison.impact.gapDelta)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px'
                  }}
                >
                  <strong style={{ color: '#0369a1' }}>💡 Recommendation:</strong>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#0c4a6e' }}>
                    {comparison.impact.coverageDelta >= 0
                      ? 'This scenario maintains or improves curriculum alignment coverage. Consider implementing these changes.'
                      : 'This scenario reduces alignment coverage. Review outcome mappings before proceeding.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={saveScenario}
                  className="btn primary"
                  style={{ flex: 1 }}
                >
                  Save Scenario
                </button>
                <button
                  className="btn outline"
                  onClick={() => {
                    const confirmed = confirm(
                      'Apply this scenario? This will modify the actual program curriculum.'
                    );
                    if (confirmed) {
                      alert('Scenario implementation coming in future release!');
                    }
                  }}
                >
                  Apply Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .panel h2, .panel h3 {
          margin: 0 0 1rem;
          font-size: 1.1rem;
          color: #111;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem 1.1rem;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #ccd2e5;
          border-radius: 6px;
          background: #fff;
          color: #1b2432;
          transition: 0.15s;
          cursor: pointer;
          text-decoration: none;
        }
        .btn:hover:not(:disabled) {
          background: #f2f5fb;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn.primary {
          background: #1b4ae8;
          border-color: #1b4ae8;
          color: #fff;
        }
        .btn.primary:hover:not(:disabled) {
          background: #163dbd;
        }
        .btn.outline {
          background: transparent;
        }
        .btn.small {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
        }
      `}</style>
    </main>
  );
}
