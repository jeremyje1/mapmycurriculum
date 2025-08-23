"use client";
import React, { useState } from 'react';
import { PLANS, PlanKey } from '../../lib/plans';

type Plan = PlanKey;
const selectablePlans = PLANS.filter(p => p.checkout);

export default function SignupPage() {
  const [plan, setPlan] = useState<Plan>(selectablePlans[0].key);
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
        Choose a plan to get started. All plans include a 14-day free trial. Cancel anytime.
      </p>
      <form onSubmit={startCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          {selectablePlans.map(p => (
            <button key={p.key} type="button" onClick={() => setPlan(p.key)} className={`btn ${plan === p.key ? 'primary' : 'outline'}`} style={{ minWidth: 160 }}>{p.label}</button>
          ))}
        </div>
        <L label="Work Email"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@college.edu" style={inputStyle} /></L>
        <L label="Institution"><input required value={institution} onChange={e=>setInstitution(e.target.value)} placeholder="Example Community College" style={inputStyle} /></L>
        <L label="State">
          <select value={stateCode} onChange={e=>setStateCode(e.target.value)} required style={inputStyle}>
            <option value="" disabled>Select State</option>
            <option value="US-AL">Alabama</option>
            <option value="US-AK">Alaska</option>
            <option value="US-AZ">Arizona</option>
            <option value="US-AR">Arkansas</option>
            <option value="US-CA">California</option>
            <option value="US-CO">Colorado</option>
            <option value="US-CT">Connecticut</option>
            <option value="US-DE">Delaware</option>
            <option value="US-FL">Florida</option>
            <option value="US-GA">Georgia</option>
            <option value="US-HI">Hawaii</option>
            <option value="US-ID">Idaho</option>
            <option value="US-IL">Illinois</option>
            <option value="US-IN">Indiana</option>
            <option value="US-IA">Iowa</option>
            <option value="US-KS">Kansas</option>
            <option value="US-KY">Kentucky</option>
            <option value="US-LA">Louisiana</option>
            <option value="US-ME">Maine</option>
            <option value="US-MD">Maryland</option>
            <option value="US-MA">Massachusetts</option>
            <option value="US-MI">Michigan</option>
            <option value="US-MN">Minnesota</option>
            <option value="US-MS">Mississippi</option>
            <option value="US-MO">Missouri</option>
            <option value="US-MT">Montana</option>
            <option value="US-NE">Nebraska</option>
            <option value="US-NV">Nevada</option>
            <option value="US-NH">New Hampshire</option>
            <option value="US-NJ">New Jersey</option>
            <option value="US-NM">New Mexico</option>
            <option value="US-NY">New York</option>
            <option value="US-NC">North Carolina</option>
            <option value="US-ND">North Dakota</option>
            <option value="US-OH">Ohio</option>
            <option value="US-OK">Oklahoma</option>
            <option value="US-OR">Oregon</option>
            <option value="US-PA">Pennsylvania</option>
            <option value="US-RI">Rhode Island</option>
            <option value="US-SC">South Carolina</option>
            <option value="US-SD">South Dakota</option>
            <option value="US-TN">Tennessee</option>
            <option value="US-TX">Texas</option>
            <option value="US-UT">Utah</option>
            <option value="US-VT">Vermont</option>
            <option value="US-VA">Virginia</option>
            <option value="US-WA">Washington</option>
            <option value="US-WV">West Virginia</option>
            <option value="US-WI">Wisconsin</option>
            <option value="US-WY">Wyoming</option>
            <option value="OTHER">Other / Multi-State</option>
          </select>
        </L>
  <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Redirecting…' : `Subscribe – ${PLANS.find(p=>p.key===plan)?.label}`}</button>
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


