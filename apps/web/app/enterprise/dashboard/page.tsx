"use client";
import React, { useEffect, useState } from 'react';

// Auth handling pattern per spec: no server redirect; client decides.
// Replace useMockAuth with real provider (NextAuth, custom JWT, etc.).
type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';
interface User { email: string; plan?: string }

function useMockAuth(): { status: AuthStatus; user: User | null } {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('demo_user') : null;
      if (stored) {
        try { setUser(JSON.parse(stored)); setStatus('authenticated'); return; } catch { /* ignore */ }
      }
      setStatus('unauthenticated');
    }, 250);
    return () => clearTimeout(timer);
  }, []);
  return { status, user };
}

export default function EnterpriseDashboard() {
  const { status, user } = useMockAuth();

  if (status === 'loading') {
    return <main style={{ padding: '3rem' }}><p className="muted">Loading dashboard…</p></main>;
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <main style={{ padding: '3rem', maxWidth: 860 }}>
        <h1>Enterprise Dashboard</h1>
        <p className="muted" style={{ maxWidth: '60ch' }}>Sign in with an Enterprise (District Enterprise / Institution) subscription to view analytics. (No server redirect to preserve prerender.)</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.75rem' }}>
          <a className="btn primary" href="/auth">Authenticate</a>
          <a className="btn outline" href="/contact">Request Enterprise Access</a>
        </div>
  <p className="tiny muted" style={{ marginTop: '1.25rem' }}>Demo shortcut: <code>localStorage.setItem('demo_user', JSON.stringify(&#123; email: 'you@example.edu', plan: 'district_enterprise' &#125;))</code> then refresh.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2.5rem', maxWidth: 1200 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '.35rem' }}>Enterprise Dashboard</h1>
          <p className="tiny muted" style={{ margin: 0 }}>Signed in as {user.email}{user.plan ? ` · ${user.plan}` : ''}</p>
        </div>
        <nav style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="btn outline" onClick={() => { window.localStorage.removeItem('demo_user'); window.location.reload(); }}>Sign Out</button>
        </nav>
      </header>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Compliance & Coverage Snapshot</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', marginTop: '1rem' }}>
          {[
            { label: 'Total Programs', value: 24 },
            { label: 'Evaluated Versions', value: 31 },
            { label: 'RulePacks Active', value: 3 },
            { label: 'Open Gaps', value: 0 },
            { label: 'Avg PLO Mastery', value: '98%' },
            { label: 'Last Evaluation', value: '3h ago' }
          ].map(card => (
            <div key={card.label} style={{ border: '1px solid #e0e6f0', borderRadius: 8, padding: '0.9rem 1rem', background: '#fff' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>{card.value}</div>
              <div style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.5px', color: '#5a6980' }}>{card.label}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Next Actions</h2>
        <ul style={{ marginTop: '.75rem', lineHeight: 1.5 }}>
          <li>Replace mock auth with production provider & feature flags.</li>
          <li>Embed Power BI once client + workspace/report IDs available.</li>
          <li>Query live metrics via Prisma snapshots.</li>
          <li>Add drill‑down views (program coverage, outcome mastery, rule failures).</li>
        </ul>
      </section>
    </main>
  );
}
