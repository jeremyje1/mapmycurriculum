"use client";
import React, { useState } from 'react';

type Plan = 'essential' | 'growth' | 'district';
const planLabels: Record<Plan, string> = { essential: 'Essential', growth: 'Growth', district: 'District / System' };

export default function SignupPage() {
  const [plan, setPlan] = useState<Plan>('essential');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, institution, state: stateCode, plan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: 760 }}>
      <h1>Get Started</h1>
      <p className="muted" style={{ maxWidth: '62ch' }}>
        Choose a plan and launch secure Stripe checkout. After payment you'll return here while we provision your workspace.
      </p>
      <form onSubmit={startCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          {(['essential','growth','district'] as Plan[]).map(p => (
            <button key={p} type="button" onClick={() => setPlan(p)} className={`btn ${plan === p ? 'primary' : 'outline'}`} style={{ minWidth: 120 }}>{planLabels[p]}</button>
          ))}
        </div>
        <L label="Work Email"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@college.edu" style={inputStyle} /></L>
        <L label="Institution"><input required value={institution} onChange={e=>setInstitution(e.target.value)} placeholder="Example Community College" style={inputStyle} /></L>
        <L label="State / Focus">
          <select value={stateCode} onChange={e=>setStateCode(e.target.value)} required style={inputStyle}>
            <option value="" disabled>Select State</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
            <option value="OTHER">Other / Multi-State</option>
          </select>
        </L>
        <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Redirecting…' : `Subscribe – ${planLabels[plan]}`}</button>
        {error && <p className="tiny" style={{ color: '#c00' }}>{error}</p>}
        <p className="tiny muted">Redirects to secure Stripe. No card data hits our servers.</p>
      </form>
      <p className="tiny" style={{ marginTop: '2rem' }}>Already subscribed? <a href="/login">Login</a></p>
    </main>
  );
}

function L({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return <label style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}><span>{label}</span>{children}</label>;
}

const inputStyle: React.CSSProperties = { border:'1px solid #ccd2e5', borderRadius:6, padding:'0.65rem 0.75rem', fontSize:'.9rem' };


