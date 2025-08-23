import React from 'react';
import { AuthForm } from '../components/AuthForm';

export const metadata = {
  title: 'Login | Map My Curriculum',
  description: 'Portal login for Map My Curriculum.'
};

export default function LoginPage() {
  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1>Sign In</h1>
      <p className="muted" style={{ maxWidth: '60ch' }}>
        Enter your email to access your curriculum mapping workspace. If you've subscribed, simply enter the email you used during checkout.
      </p>
      <AuthForm mode="login" />
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f8ff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '0.9rem', margin: 0, color: '#4a5568' }}>
          <strong>New subscriber?</strong> Use the same email address you provided during Stripe checkout. No password required - just enter your email and you'll be logged in automatically.
        </p>
      </div>
    </main>
  );
}

