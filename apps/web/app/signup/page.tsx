import React from 'react';

export const metadata = {
  title: 'Get Started | Map My Curriculum',
  description: 'Create a sandbox account to evaluate curriculum compliance.'
};

export default function SignupPage() {
  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1>Create Sandbox Account</h1>
      <p className="muted" style={{ maxWidth: '62ch' }}>
        Spin up a sandbox to import a program and run your first policy‑aware evaluation. (Submission is a placeholder – wiring to backend pending.)
      </p>
      <form onSubmit={(e)=>{e.preventDefault(); alert('Signup not yet enabled.');}} style={{ maxWidth: 520, display:'flex', flexDirection:'column', gap:'0.95rem', marginTop:'1.5rem' }}>
        <Field label="Institution Name">
          <input required name="institution" placeholder="Example Community College" style={inputStyle} />
        </Field>
        <Field label="Work Email">
          <input required type="email" name="email" placeholder="you@college.edu" style={inputStyle} />
        </Field>
        <Field label="Password">
          <input required type="password" name="password" placeholder="••••••••" style={inputStyle} />
        </Field>
        <Field label="State / RulePack Focus">
          <select required name="state" style={inputStyle} defaultValue="">
            <option value="" disabled>Select State</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
            <option value="OTHER">Other / Multi-State</option>
          </select>
        </Field>
        <Field label="Primary Goal (optional)">
          <select name="goal" style={inputStyle} defaultValue="">
            <option value="">Select</option>
            <option value="transfer">Transfer Pathway Alignment</option>
            <option value="outcomes">Outcomes Mastery Tracking</option>
            <option value="accreditation">Accreditation Evidence</option>
            <option value="simulation">Impact Simulation</option>
          </select>
        </Field>
        <button className="btn primary" type="submit">Launch Sandbox</button>
        <p className="tiny">Already have an account? <a href="/login">Login</a></p>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
  fontSize:'.9rem'
};
