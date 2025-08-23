"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User { 
  id: string;
  email: string; 
  role: string;
  institutionId: string;
}

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

function useAuth(): { status: AuthStatus; user: User | null } {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check for authentication via cookie
    fetch('/api/auth/me', {
      credentials: 'include'
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error('Not authenticated');
    })
    .then(data => {
      setUser(data.user);
      setStatus('authenticated');
    })
    .catch(() => {
      setStatus('unauthenticated');
    });
  }, []);

  return { status, user };
}

export default function EnterpriseDashboard() {
  const { status, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if API call fails
      router.push('/login');
    }
  };

  if (status === 'loading') {
    return (
      <main style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="muted">Loading dashboard…</p>
      </main>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <main style={{ padding: '3rem', maxWidth: 860 }}>
        <h1>Enterprise Dashboard</h1>
        <p className="muted" style={{ maxWidth: '60ch' }}>
          Please sign in to access your curriculum mapping dashboard and analytics.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.75rem' }}>
          <a className="btn primary" href="/login">Sign In</a>
          <a className="btn outline" href="/signup">Get Started</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2.5rem', maxWidth: 1200 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '.35rem' }}>Curriculum Dashboard</h1>
          <p className="tiny muted" style={{ margin: 0 }}>
            Welcome back, {user.email} · {user.role} role
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
            { label: 'Institution ID', value: user.institutionId.slice(0, 8) + '...', icon: '🏫' },
            { label: 'Account Status', value: 'Active', icon: '✅' },
            { label: 'Subscription', value: 'Professional', icon: '⭐' },
            { label: 'Data Sources', value: 'Ready', icon: '📁' }
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
            Your curriculum mapping platform is ready! Contact our team to begin importing your data and setting up your first analysis.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href="/contact" 
              className="btn primary"
              style={{ textDecoration: 'none' }}
            >
              Contact Support
            </a>
            <a 
              href="/assessment/onboarding" 
              className="btn outline"
              style={{ textDecoration: 'none' }}
            >
              View Resources
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
    </main>
  );
}
