"use client";
import React from 'react';

export type AuthMode = 'login' | 'signup';

interface AuthFormProps { readonly mode: AuthMode; }

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === 'signup';
  return (
    <form aria-label={isSignup ? 'Signup form (disabled placeholder)' : 'Login form (disabled placeholder)'}
      onSubmit={(e)=> e.preventDefault()}
      style={{ maxWidth: isSignup ? 520 : 420, display:'flex', flexDirection:'column', gap:'0.95rem', marginTop:'1.5rem' }}>
      {isSignup && (
        <Field label="Institution Name">
          <input disabled required name="institution" placeholder="Example Community College" style={inputStyle} />
        </Field>
      )}
      <Field label="Work Email">
        <input disabled required type="email" name="email" placeholder="you@college.edu" style={inputStyle} />
      </Field>
      <Field label="Password">
        <input disabled required type="password" name="password" placeholder="••••••••" style={inputStyle} />
      </Field>
      {isSignup && (
        <>
          <Field label="State / RulePack Focus">
            <select disabled required name="state" style={inputStyle} defaultValue="">
              <option value="" disabled>Select State</option>
              <option value="TX">Texas</option>
              <option value="CA">California</option>
              <option value="FL">Florida</option>
              <option value="NY">New York</option>
              <option value="OTHER">Other / Multi-State</option>
            </select>
          </Field>
          <Field label="Primary Goal (optional)">
            <select disabled name="goal" style={inputStyle} defaultValue="">
              <option value="">Select</option>
              <option value="transfer">Transfer Pathway Alignment</option>
              <option value="outcomes">Outcomes Mastery Tracking</option>
              <option value="accreditation">Accreditation Evidence</option>
              <option value="simulation">Impact Simulation</option>
            </select>
          </Field>
        </>
      )}
      <button className="btn primary" type="submit" disabled title="Authentication not yet enabled">
        {isSignup ? 'Launch Sandbox' : 'Login'}
      </button>
      <p className="tiny muted" style={{ marginTop: '-0.25rem' }}>
        Auth not yet enabled in this early access build. Forms are disabled intentionally.
      </p>
      <p className="tiny">
        {isSignup ? 'Already have an account? ' : 'Need an account? '}
        <a href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Get Started'}</a>
      </p>
    </form>
  );
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  border:'1px solid #ccd2e5',
  borderRadius:6,
  padding:'0.65rem 0.75rem',
  fontSize:'.9rem',
  background:'#f5f7fb'
};
