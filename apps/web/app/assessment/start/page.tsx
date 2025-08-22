import React from 'react';
import { PLANS, PlanKey, getPlan } from '../../../lib/plans';

export const metadata = { title: 'Getting Started | NorthPath Assessment' };

export default function AssessmentStartPage({ searchParams }: { readonly searchParams: { tier?: string } }) {
  const tier = (searchParams.tier || '') as PlanKey;
  const plan = getPlan(tier);
  return (
    <main style={{ padding: '3rem 1rem', maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '.75rem' }}>Assessment Onboarding</h1>
      {plan ? (
        <p className="muted" style={{ maxWidth: 640 }}>Welcome – your <strong>{plan.label}</strong> tier features are now active. Start by importing data and running your first evaluation.</p>
      ) : (
        <p className="muted" style={{ maxWidth: 640 }}>Select a tier to unlock features. (No recognized tier parameter provided.)</p>
      )}
      {plan && (
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Included Features</h2>
          <ul style={{ marginTop: '.75rem', lineHeight: 1.5 }}>
            {plan.features.map(f => <li key={f}>{f}</li>)}
            <li>Universal: One‑Click Org Chart + Curriculum Mapping</li>
          </ul>
        </section>
      )}
      <section style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Next Steps</h2>
        <ol style={{ marginTop: '.75rem', lineHeight: 1.55 }}>
          <li>Download CSV templates on the <a href="/assessment/onboarding">Onboarding</a> page.</li>
          <li>Upload Programs, Courses, Outcomes, Alignments.</li>
          <li>Run initial RulePack evaluation.</li>
          <li>Review compliance & mastery metrics.</li>
          <li>Generate your first Evidence PDF (Pro+ tiers).</li>
        </ol>
      </section>
      <p className="tiny" style={{ marginTop: '2rem' }}><a href="/enterprise/dashboard">Enterprise Dashboard</a> (Enterprise tiers) | <a href="/">Marketing Site</a></p>
    </main>
  );
}
