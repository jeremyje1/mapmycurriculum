"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export type AuthMode = 'login' | 'signup';

interface AuthFormProps { readonly mode: AuthMode; }

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getButtonText = () => {
    if (loading) return 'Processing...';
    return isSignup ? 'Launch Sandbox' : 'Access Account';
  };
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle special case where user needs password setup
        if (result.needsPasswordSetup) {
          router.push(`/setup-password?email=${encodeURIComponent(data.email as string)}` as any);
          return;
        }
        throw new Error(result.error || 'Authentication failed');
      }
      
      // Redirect to dashboard or assessment page
      if (isSignup) {
        router.push('/assessment/onboarding' as any);
      } else {
        router.push('/enterprise/dashboard' as any);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form aria-label={isSignup ? 'Signup form' : 'Login form'}
      onSubmit={handleSubmit}
      style={{ maxWidth: isSignup ? 520 : 420, display:'flex', flexDirection:'column', gap:'0.95rem', marginTop:'1.5rem' }}>
      {isSignup && (
        <Field label="Institution Name">
          <input required name="institution" placeholder="Example Community College" style={inputStyle} />
        </Field>
      )}
      <Field label="Work Email">
        <input required type="email" name="email" placeholder="you@college.edu" style={inputStyle} />
      </Field>
      {!isSignup && (
        <p className="tiny" style={{ color: '#666', margin: '0.5rem 0' }}>
          Enter your email to access your account. No password required for existing subscribers.
        </p>
      )}
      {isSignup && (
        <Field label="Password">
          <input required type="password" name="password" placeholder="••••••••" style={inputStyle} />
        </Field>
      )}
      {isSignup && (
        <>
          <Field label="State / RulePack Focus">
            <select required name="state" style={inputStyle} defaultValue="">
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
        </>
      )}
      <button className="btn primary" type="submit" disabled={loading}>
        {getButtonText()}
      </button>
      {error && (
        <p className="tiny" style={{ color: '#c00', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}
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
