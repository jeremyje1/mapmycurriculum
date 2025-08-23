"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
export const dynamic = 'force-dynamic';

function SetupPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email');
  const sessionId = searchParams?.get('session_id');
  
  const [userEmail, setUserEmail] = useState(email);
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingSession, setFetchingSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId && !email) {
      // Look up session details
      setFetchingSession(true);
      fetch(`/api/stripe/session-info?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            setUserEmail(data.email);
            setInstitution(data.institution || '');
          } else {
            setError('Unable to retrieve account information');
          }
        })
        .catch(() => {
          setError('Unable to retrieve account information');
        })
        .finally(() => {
          setFetchingSession(false);
        });
    } else if (!email && !sessionId) {
      router.push('/login');
    }
  }, [email, sessionId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Password setup failed');
      }
      
      // Redirect to dashboard after successful password setup
      router.push('/enterprise/dashboard' as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetchingSession) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p>Loading account information...</p>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p>Unable to load account information. Please try again or contact support.</p>
          <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
            Set Up Your Password
          </h1>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Welcome! Complete your account setup to access your curriculum mapping dashboard.
          </p>
          <p style={{ color: '#4a5568', fontSize: '0.9rem', marginTop: '10px' }}>
            Account: <strong>{userEmail}</strong>
          </p>
          {institution && (
            <p style={{ color: '#4a5568', fontSize: '0.9rem' }}>
              Institution: <strong>{institution}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2d3748' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ccd2e5',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#f7fafc'
              }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2d3748' }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ccd2e5',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#f7fafc'
              }}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              background: '#fed7d7', 
              color: '#c53030', 
              borderRadius: '6px', 
              fontSize: '0.9rem' 
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#a0aec0' : '#667eea',
              color: 'white',
              padding: '14px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Setting Up...' : 'Complete Setup & Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Already set up your password?{' '}
            <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>}>
      <SetupPasswordInner />
    </Suspense>
  );
}
