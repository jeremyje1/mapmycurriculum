"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignupSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const fromPayment = sessionId !== null;
  
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    if (fromPayment) {
      // Auto-redirect to password setup after 10 seconds
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            window.location.href = `/setup-password?session_id=${sessionId}`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [fromPayment, sessionId]);

  if (fromPayment) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>
              Payment Successful!
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Welcome to MapMyCurriculum! Your subscription is now active.
            </p>
          </div>

          <div style={{ background: '#f7fafc', borderRadius: '8px', padding: '24px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
              Next Step: Set Up Your Account
            </h2>
            <p style={{ color: '#4a5568', fontSize: '0.95rem', marginBottom: '16px' }}>
              To access your curriculum mapping dashboard, you'll need to complete your account setup.
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Redirecting automatically in <strong>{timeRemaining}</strong> seconds...
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a 
              href={`/setup-password?session_id=${sessionId}`}
              style={{
                background: '#667eea',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Complete Setup Now
            </a>
            <a 
              href="/login"
              style={{
                background: 'transparent',
                color: '#667eea',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '1px solid #667eea'
              }}
            >
              Login Instead
            </a>
          </div>

          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              Need help? Contact us at{' '}
              <a href="mailto:hello@mapmycurriculum.com" style={{ color: '#667eea' }}>
                hello@mapmycurriculum.com
              </a>
            </p>
            {sessionId && (
              <p style={{ fontSize: '0.75rem', color: '#a0adb8', marginTop: '8px' }}>
                Session: {sessionId}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular signup success (not from payment)
  return (
    <div className="container">
      <h1 className="heading">Account Created Successfully!</h1>
      <p className="text-large">
        Welcome to MapMyCurriculum! You can now log in to your account and start mapping your curriculum.
      </p>
      <div style={{ marginTop: '30px' }}>
        <a href="/login" className="btn primary">
          Login to Your Account
        </a>
      </div>
    </div>
  );
}
