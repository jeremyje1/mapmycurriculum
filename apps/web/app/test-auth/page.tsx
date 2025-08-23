import React from 'react';
import AuthFormSupabase from '../components/AuthFormSupabase';
import AuthStatus from '../components/AuthStatus';

export const metadata = {
  title: 'Test Supabase Auth | Map My Curriculum',
  description: 'Test the new Supabase authentication system.'
};

export default function TestAuthPage() {
  return (
    <main className="container">
      <div className="hero-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Test Supabase Authentication</h1>
        <p className="subtitle">
          Test the new Supabase authentication system for Map My Curriculum
        </p>
      </div>
      
      <AuthStatus />
      
      <div className="auth-grid">
        <div className="auth-section">
          <h2>Sign Up</h2>
          <AuthFormSupabase mode="signup" />
        </div>
        
        <div className="auth-section">
          <h2>Sign In</h2>
          <AuthFormSupabase mode="login" />
        </div>
      </div>
      
      <div className="info-box">
        <h3>🧪 Testing Instructions</h3>
        <ol>
          <li>Try creating a new account with the "Sign Up" form</li>
          <li>Check your email for a confirmation link (expires in ~5 minutes)</li>
          <li>If the link expires, use the "Resend" feature above</li>
          <li>After confirming, try signing in with the "Sign In" form</li>
          <li>You should see your authentication status above</li>
        </ol>
      </div>
      
      <div className="nav-links">
        <a href="/login" className="btn btn-outline">← Back to original login</a>
        <a href="/signup" className="btn btn-outline">Back to signup →</a>
      </div>

      <style jsx>{`
        .hero-section {
          margin: 4rem 0 3rem 0;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin-top: 1rem;
          max-width: 60ch;
          margin-left: auto;
          margin-right: auto;
        }

        .auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin: 3rem 0;
        }

        @media (max-width: 768px) {
          .auth-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .auth-section h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .info-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #0ea5e9;
          margin: 3rem 0;
        }

        .info-box h3 {
          margin-bottom: 1rem;
          color: #0c4a6e;
        }

        .info-box ol {
          margin: 0;
          padding-left: 1.5rem;
        }

        .info-box li {
          margin-bottom: 0.5rem;
          color: #0c4a6e;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 3rem 0;
        }

        .nav-links a {
          text-decoration: none;
        }

        /* Auth Form Styles */
        :global(.auth-form-container) {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        :global(.auth-form) {
          margin-bottom: 1.5rem;
        }

        :global(.form-group) {
          margin-bottom: 1.5rem;
        }

        :global(.form-group label) {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        :global(.form-group input) {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        :global(.form-group input:focus) {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        :global(.btn) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          font-size: 1rem;
        }

        :global(.btn-primary) {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          width: 100%;
          margin-bottom: 1rem;
        }

        :global(.btn-primary:hover:not(:disabled)) {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        :global(.btn-primary:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }

        :global(.btn-google) {
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
          width: 100%;
          gap: 0.5rem;
        }

        :global(.btn-google:hover:not(:disabled)) {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        :global(.btn-outline) {
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
        }

        :global(.btn-outline:hover) {
          background: #3b82f6;
          color: white;
        }

        :global(.google-icon) {
          width: 20px;
          height: 20px;
        }

        :global(.divider) {
          position: relative;
          margin: 1.5rem 0;
          text-align: center;
        }

        :global(.divider::before) {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }

        :global(.divider span) {
          background: white;
          padding: 0 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        :global(.auth-switch) {
          text-align: center;
          margin-top: 1.5rem;
        }

        :global(.auth-switch p) {
          color: #6b7280;
          margin: 0;
        }

        :global(.auth-switch a) {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        :global(.auth-switch a:hover) {
          color: #1d4ed8;
        }

        :global(.alert) {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        :global(.alert-success) {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          color: #166534;
        }

        :global(.alert-error) {
          background: #fef2f2;
          border: 1px solid #ef4444;
          color: #b91c1c;
        }
      `}</style>
    </main>
  );
}
