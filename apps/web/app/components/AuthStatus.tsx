'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

export default function AuthStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check for URL errors (expired links, etc.)
    const urlError = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (urlError) {
      if (errorCode === 'otp_expired') {
        setError('Email verification link has expired. Please request a new one below.');
      } else {
        setError(`Authentication error: ${errorDescription || urlError}`);
      }
    }

    // Check for successful verification
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setMessage('✅ Email verified successfully! You can now sign in.');
    }

    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          setMessage('✅ Successfully signed in!');
          setError('');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [searchParams, supabase.auth]);

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: resendEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('📧 New verification email sent! Check your inbox.');
      setError('');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessage('Signed out successfully');
    setError('');
  };

  if (loading && !error) {
    return <div>Loading authentication status...</div>;
  }

  return (
    <div className="auth-status">
      {/* Error Messages */}
      {error && (
        <div className="status-card error-card">
          <div className="status-header">
            <span className="status-icon">⚠️</span>
            <strong>Authentication Error</strong>
          </div>
          <p>{error}</p>
          
          {error.includes('expired') && (
            <div className="resend-section">
              <h4>Resend Verification Email</h4>
              <div className="resend-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="resend-input"
                />
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="btn btn-resend"
                >
                  {loading ? 'Sending...' : 'Resend'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Messages */}
      {message && (
        <div className="status-card success-card">
          <div className="status-header">
            <span className="status-icon">✅</span>
            <strong>Success</strong>
          </div>
          <p>{message}</p>
        </div>
      )}

      {/* Current User Status */}
      {user ? (
        <div className="status-card auth-card">
          <div className="status-header">
            <span className="status-icon">🔓</span>
            <h3>Authenticated User</h3>
          </div>
          <div className="user-details">
            <div className="user-field">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="user-field">
              <strong>Email Confirmed:</strong> 
              <span className={user.email_confirmed_at ? 'confirmed' : 'unconfirmed'}>
                {user.email_confirmed_at ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="user-field">
              <strong>User ID:</strong> 
              <code>{user.id}</code>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-signout"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="status-card pending-card">
          <div className="status-header">
            <span className="status-icon">🔐</span>
            <h3>Not Authenticated</h3>
          </div>
          <p>Please sign in or create an account using the forms below.</p>
        </div>
      )}

      <style jsx>{`
        .auth-status {
          margin-bottom: 3rem;
        }

        .status-card {
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 2px solid;
        }

        .error-card {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-color: #ef4444;
          color: #b91c1c;
        }

        .success-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #22c55e;
          color: #166534;
        }

        .auth-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #22c55e;
          color: #166534;
        }

        .pending-card {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-color: #f59e0b;
          color: #92400e;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .status-icon {
          font-size: 1.25rem;
        }

        .status-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .user-details {
          margin: 1rem 0;
        }

        .user-field {
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-field strong {
          min-width: 140px;
        }

        .user-field code {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }

        .confirmed {
          color: #166534;
          font-weight: 500;
        }

        .unconfirmed {
          color: #dc2626;
          font-weight: 500;
        }

        .resend-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(239, 68, 68, 0.3);
        }

        .resend-section h4 {
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .resend-form {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .resend-input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 2px solid #ef4444;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .resend-input:focus {
          outline: none;
          border-color: #dc2626;
        }

        .btn-resend {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-resend:hover:not(:disabled) {
          background: #dc2626;
        }

        .btn-resend:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-signout {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }

        .btn-signout:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}
