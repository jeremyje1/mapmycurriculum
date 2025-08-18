import React from 'react';

export const metadata = { title: 'Subscription Started | Map My Curriculum' };

export default function SignupSuccessPage({ searchParams }: { readonly searchParams: { session_id?: string } }) {
  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: 680 }}>
      <h1>Subscription Initiated</h1>
      <p>Your payment was successful. We are provisioning your workspace.</p>
      {searchParams.session_id && <p className="tiny muted">Stripe Session: {searchParams.session_id}</p>}
      <ol className="flow" style={{ marginTop: '1.5rem' }}>
        <li><strong>Provision</strong> – Workspace & initial org record.</li>
        <li><strong>Email Invite</strong> – Welcome email with access instructions.</li>
        <li><strong>Onboard</strong> – Import catalog CSVs or request assisted import.</li>
        <li><strong>Evaluate</strong> – Run first RulePack evaluation & review scorecard.</li>
      </ol>
      <p style={{ marginTop: '1.5rem' }}>If no email arrives within a few minutes, check spam or contact <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a>.</p>
      <p className="tiny"><a href="/login">Go to Login</a></p>
    </main>
  );
}
