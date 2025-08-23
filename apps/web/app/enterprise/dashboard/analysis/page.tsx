"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface GapAnalysisResult {
  programCode: string;
  programName: string;
  totalPLOs: number;
  mappedPLOs: number;
  unmappedPLOs: string[];
  totalCLOs: number;
  mappedCLOs: number;
  unmappedCLOs: string[];
  coveragePercentage: number;
  recommendedActions: string[];
}

interface ComplianceCheck {
  rule: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  details?: string;
}

export default function AnalysisPage() {
  const [analysisResults, setAnalysisResults] = useState<GapAnalysisResult[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [programs, setPrograms] = useState<Array<{code: string, name: string}>>([]);

  const supabase = createClient();

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('code, name')
        .order('name');
      
      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const runGapAnalysis = async () => {
    setIsLoading(true);
    try {
      // Get all programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*');
      
      if (programsError) throw programsError;

      // Get all outcomes
      const { data: outcomesData, error: outcomesError } = await supabase
        .from('learning_outcomes')
        .select('*');
      
      if (outcomesError) throw outcomesError;

      // Get all alignments
      const { data: alignmentsData, error: alignmentsError } = await supabase
        .from('simple_alignments')
        .select('*');
      
      if (alignmentsError) throw alignmentsError;

      // Process gap analysis for each program
      const results: GapAnalysisResult[] = [];

      for (const program of programsData || []) {
        // Get PLOs for this program
        const programPLOs = (outcomesData || []).filter(
          outcome => outcome.type === 'PLO' && outcome.owner_code === program.code
        );

        // Get CLOs that are mapped to this program
        const programAlignments = (alignmentsData || []).filter(
          alignment => alignment.program_code === program.code
        );

        const mappedPLOCodes = [...new Set(programAlignments.map(a => a.plo_code))];
        const mappedCLOCodes = [...new Set(programAlignments.map(a => a.clo_code))];

        // Find unmapped PLOs
        const unmappedPLOs = programPLOs
          .filter(plo => !mappedPLOCodes.includes(plo.code))
          .map(plo => plo.code);

        // Get all CLOs that could potentially map to this program
        const allCLOs = (outcomesData || []).filter(outcome => outcome.type === 'CLO');
        const unmappedCLOs = allCLOs
          .filter(clo => !mappedCLOCodes.includes(clo.code))
          .map(clo => clo.code);

        const coveragePercentage = programPLOs.length > 0 
          ? Math.round((mappedPLOCodes.length / programPLOs.length) * 100)
          : 0;

        // Generate recommendations
        const recommendations: string[] = [];
        if (unmappedPLOs.length > 0) {
          recommendations.push(`Map ${unmappedPLOs.length} unmapped PLO(s) to course outcomes`);
        }
        if (coveragePercentage < 80) {
          recommendations.push('Improve curriculum alignment to reach 80% coverage minimum');
        }
        if (programAlignments.length === 0) {
          recommendations.push('Create initial curriculum alignments between PLOs and CLOs');
        }

        results.push({
          programCode: program.code,
          programName: program.name,
          totalPLOs: programPLOs.length,
          mappedPLOs: mappedPLOCodes.length,
          unmappedPLOs,
          totalCLOs: allCLOs.length,
          mappedCLOs: mappedCLOCodes.length,
          unmappedCLOs: unmappedCLOs.slice(0, 10), // Limit for display
          coveragePercentage,
          recommendedActions: recommendations
        });
      }

      setAnalysisResults(results);

      // Run compliance checks
      await runComplianceChecks(programsData, outcomesData, alignmentsData);

    } catch (error) {
      console.error('Error running gap analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runComplianceChecks = async (programs: any[], outcomes: any[], alignments: any[]) => {
    const checks: ComplianceCheck[] = [];

    // Check 1: All programs have PLOs
    programs.forEach(program => {
      const programPLOs = outcomes.filter(o => o.type === 'PLO' && o.owner_code === program.code);
      checks.push({
        rule: `Program ${program.code} - PLO Requirement`,
        status: programPLOs.length >= 2 ? 'pass' : 'fail',
        description: 'Programs must have at least 2 Program Learning Outcomes',
        details: `Found ${programPLOs.length} PLO(s)`
      });
    });

    // Check 2: PLO-CLO alignment coverage
    programs.forEach(program => {
      const programPLOs = outcomes.filter(o => o.type === 'PLO' && o.owner_code === program.code);
      const programAlignments = alignments.filter(a => a.program_code === program.code);
      const mappedPLOs = [...new Set(programAlignments.map(a => a.plo_code))];
      const coverage = programPLOs.length > 0 ? (mappedPLOs.length / programPLOs.length) * 100 : 0;
      
      checks.push({
        rule: `Program ${program.code} - Alignment Coverage`,
        status: coverage >= 80 ? 'pass' : coverage >= 50 ? 'warning' : 'fail',
        description: 'PLO alignment coverage should be at least 80%',
        details: `Current coverage: ${Math.round(coverage)}%`
      });
    });

    // Check 3: Bloom's taxonomy progression
    const bloomsLevels = { 'I': 1, 'D': 2, 'M': 3 };
    programs.forEach(program => {
      const programAlignments = alignments.filter(a => a.program_code === program.code);
      const levels = programAlignments.map(a => bloomsLevels[a.level as keyof typeof bloomsLevels]).filter(Boolean);
      const hasProgression = levels.includes(1) && levels.includes(2) && levels.includes(3);
      
      checks.push({
        rule: `Program ${program.code} - Learning Progression`,
        status: hasProgression ? 'pass' : 'warning',
        description: 'Programs should demonstrate learning progression (I→D→M)',
        details: `Levels present: ${[...new Set(levels)].sort().join(', ')}`
      });
    });

    setComplianceChecks(checks);
  };

  const filteredResults = selectedProgram === 'all' 
    ? analysisResults 
    : analysisResults.filter(r => r.programCode === selectedProgram);

  const filteredChecks = selectedProgram === 'all'
    ? complianceChecks
    : complianceChecks.filter(c => c.rule.includes(selectedProgram));

  return (
    <main style={{ padding: '2.5rem', maxWidth: 1200 }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Gap Analysis & Compliance</h1>
          <a href="/enterprise/dashboard" className="btn outline">← Back to Dashboard</a>
        </div>
        <p style={{ color: '#666', margin: 0 }}>
          Analyze curriculum gaps and check compliance with state standards.
        </p>
      </header>

      {/* Controls */}
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
              Program Filter:
            </label>
            <select 
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              style={{ 
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minWidth: '200px'
              }}
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program.code} value={program.code}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={runGapAnalysis}
            disabled={isLoading}
            className="btn primary"
            style={{ marginTop: '20px' }}
          >
            {isLoading ? '🔄 Analyzing...' : '🔍 Run Analysis'}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <>
          {/* Summary Cards */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>📊 Analysis Summary</h2>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {[
                { 
                  label: 'Programs Analyzed', 
                  value: filteredResults.length,
                  color: '#0066cc'
                },
                { 
                  label: 'Avg Coverage', 
                  value: filteredResults.length > 0 
                    ? Math.round(filteredResults.reduce((sum, r) => sum + r.coveragePercentage, 0) / filteredResults.length) + '%'
                    : '0%',
                  color: '#28a745'
                },
                { 
                  label: 'Total PLOs', 
                  value: filteredResults.reduce((sum, r) => sum + r.totalPLOs, 0),
                  color: '#6610f2'
                },
                { 
                  label: 'Unmapped PLOs', 
                  value: filteredResults.reduce((sum, r) => sum + r.unmappedPLOs.length, 0),
                  color: '#dc3545'
                }
              ].map(card => (
                <div key={card.label} style={{ 
                  border: '1px solid #e0e6f0', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  background: '#fff',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color, marginBottom: '8px' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Compliance Checks */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>✅ Compliance Checks</h2>
            <div style={{ 
              border: '1px solid #e0e6f0', 
              borderRadius: '8px', 
              background: '#fff',
              overflow: 'hidden'
            }}>
              {filteredChecks.map((check, index) => (
                <div key={index} style={{ 
                  padding: '16px 20px',
                  borderBottom: index < filteredChecks.length - 1 ? '1px solid #e0e6f0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '1.5rem' }}>
                    {check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{check.rule}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2px' }}>
                      {check.description}
                    </div>
                    {check.details && (
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {check.details}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: check.status === 'pass' ? '#d4edda' : 
                               check.status === 'warning' ? '#fff3cd' : '#f8d7da',
                    color: check.status === 'pass' ? '#155724' : 
                           check.status === 'warning' ? '#856404' : '#721c24'
                  }}>
                    {check.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed Results */}
          <section>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>📋 Detailed Gap Analysis</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {filteredResults.map(result => (
                <div key={result.programCode} style={{ 
                  border: '1px solid #e0e6f0', 
                  borderRadius: '8px', 
                  background: '#fff',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    background: '#f8fafc', 
                    padding: '16px 20px', 
                    borderBottom: '1px solid #e0e6f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{result.programName}</h3>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Code: {result.programCode}</div>
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: result.coveragePercentage >= 80 ? '#28a745' : 
                             result.coveragePercentage >= 50 ? '#ffc107' : '#dc3545'
                    }}>
                      {result.coveragePercentage}%
                    </div>
                  </div>
                  
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>PLO Coverage</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                          {result.mappedPLOs} / {result.totalPLOs} mapped
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>CLO Utilization</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                          {result.mappedCLOs} / {result.totalCLOs} used
                        </div>
                      </div>
                    </div>

                    {result.unmappedPLOs.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#dc3545' }}>
                          ⚠️ Unmapped PLOs ({result.unmappedPLOs.length}):
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {result.unmappedPLOs.join(', ')}
                        </div>
                      </div>
                    )}

                    {result.recommendedActions.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>
                          💡 Recommended Actions:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#666' }}>
                          {result.recommendedActions.map((action, index) => (
                            <li key={index} style={{ marginBottom: '4px' }}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Empty State */}
      {analysisResults.length === 0 && !isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#f8fafc',
          border: '1px solid #e0e6f0',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Analysis Data</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Import your curriculum data first, then run the gap analysis to see results.
          </p>
          <a href="/enterprise/dashboard/import" className="btn primary" style={{ textDecoration: 'none' }}>
            Import Data First
          </a>
        </div>
      )}
    </main>
  );
}
