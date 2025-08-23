"use client";
import React from 'react';

export default function EnterpriseDashboard() {
  const handleSignOut = () => {
    // Clear any stored session data
    if (typeof window !== 'undefined') {
      document.cookie = 'session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    }
  };

  return (
    <main style={{ padding: '2.5rem', maxWidth: 1200 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '.35rem' }}>Curriculum Dashboard</h1>
          <p className="tiny muted" style={{ margin: 0 }}>
            Welcome to your MapMyCurriculum workspace
          </p>
        </div>
        <nav style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="btn outline" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>
      </header>

      <section style={{ marginTop: '2rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: '12px', 
          padding: '30px', 
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'white' }}>
            🎉 Welcome to MapMyCurriculum!
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px', opacity: 0.9 }}>
            Your account is now set up and ready to use. Here's what you can do next:
          </p>
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'white' }}>📊 Import Your Data</h3>
              <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>
                Upload your course catalog and program requirements to get started with mapping.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'white' }}>🎯 Define Outcomes</h3>
              <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>
                Set up program learning outcomes (PLOs) and course learning outcomes (CLOs).
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'white' }}>🔍 Run Analysis</h3>
              <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>
                Apply state rule packs to validate compliance and identify gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Quick Stats</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
          {[
            { label: 'Account Status', value: 'Active', icon: '✅' },
            { label: 'Subscription', value: 'Professional', icon: '⭐' },
            { label: 'Data Sources', value: 'Ready', icon: '📁' },
            { label: 'Analysis Tools', value: 'Available', icon: '�' }
          ].map(card => (
            <div key={card.label} style={{ 
              border: '1px solid #e0e6f0', 
              borderRadius: 8, 
              padding: '1.2rem', 
              background: '#fff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '4px' }}>{card.value}</div>
              <div style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.5px', color: '#5a6980' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Getting Started</h2>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '24px' }}>
          <p style={{ marginBottom: '16px', color: '#4a5568' }}>
            Your curriculum mapping platform is ready! Import your data or load demo data to get started.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href="/enterprise/dashboard/seed-demo" 
              className="btn primary"
              style={{ textDecoration: 'none' }}
            >
              🎯 Load Demo Data
            </a>
            <a 
              href="/enterprise/dashboard/import" 
              className="btn outline"
              style={{ textDecoration: 'none' }}
            >
              📊 Import Data
            </a>
            <a 
              href="/contact" 
              className="btn outline"
              style={{ textDecoration: 'none' }}
            >
              Contact Support
            </a>
            <a 
              href="mailto:hello@mapmycurriculum.com" 
              className="btn outline"
              style={{ textDecoration: 'none' }}
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Available Tools</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div style={{ border: '1px solid #e0e6f0', borderRadius: '8px', padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📊 Data Import</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
              Upload CSV files with your course catalog, programs, and outcomes data.
            </p>
            <a href="/enterprise/dashboard/import" className="btn small primary" style={{ textDecoration: 'none' }}>
              Start Import
            </a>
          </div>
          
          <div style={{ border: '1px solid #e0e6f0', borderRadius: '8px', padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🎯 Compliance Analysis</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
              Run state-specific rule packs to validate curriculum compliance.
            </p>
            <a href="/enterprise/dashboard/analysis" className="btn small primary" style={{ textDecoration: 'none' }}>
              Run Analysis
            </a>
          </div>

          <div style={{ border: '1px solid #e0e6f0', borderRadius: '8px', padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📈 Gap Analysis</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
              Generate detailed reports on curriculum gaps and recommendations.
            </p>
            <a href="/enterprise/dashboard/analysis" className="btn small primary" style={{ textDecoration: 'none' }}>
              View Gaps
            </a>
          </div>
          
          <div style={{ border: '1px solid #e0e6f0', borderRadius: '8px', padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🗺️ Alignment Map</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
              Visualize curriculum alignments between PLOs and CLOs.
            </p>
            <a href="/enterprise/dashboard/alignment" className="btn small primary" style={{ textDecoration: 'none' }}>
              View Map
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
