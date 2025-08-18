import React from 'react';
import { AuthForm } from '../components/AuthForm';

export const metadata = {
  title: 'Get Started | Map My Curriculum',
  description: 'Create a sandbox account to evaluate curriculum compliance.'
};

export default function SignupPage() {
  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h1>Create Sandbox Account</h1>
      <p className="muted" style={{ maxWidth: '62ch' }}>
        Spin up a sandbox to import a program and run your first policy‑aware evaluation.
      </p>
      <AuthForm mode="signup" />
    </main>
  );
}

