import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Map My Curriculum',
  description: 'Privacy practices for Map My Curriculum.'
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ paddingTop:'4rem', paddingBottom:'4rem', maxWidth: '72ch' }}>
      <h1>Privacy Policy (Placeholder)</h1>
      <p className="muted">A formal privacy policy will be published prior to production data onboarding. This placeholder summarizes intent.</p>
      <h3>Data Scope</h3>
      <p>We process institutional curriculum structure (programs, courses, outcomes, alignments) and related evaluation results. We do not ingest student-level PII in the current product scope.</p>
      <h3>Storage</h3>
      <p>Data will reside in secure managed cloud infrastructure with encrypted storage. Access is limited by role-based permissions.</p>
      <h3>Retention & Deletion</h3>
      <p>Sandbox data may be purged after inactivity. Production tenants will receive retention configuration options.</p>
      <h3>Contact</h3>
      <p>Questions: <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a></p>
    </main>
  );
}
