import React from 'react';
import { AuthForm } from '../components/AuthForm';

export const metadata = {
  title: 'Login | Map My Curriculum',
  description: 'Portal login for Map My Curriculum.'
};

export default function LoginPage() {
  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1>Portal Login</h1>
      <p className="muted" style={{ maxWidth: '60ch' }}>
        Sign in to access your curriculum mapping workspace.
      </p>
      <AuthForm mode="login" />
    </main>
  );
}

