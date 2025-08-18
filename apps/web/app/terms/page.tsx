import React from 'react';

export const metadata = {
  title: 'Terms of Service | Map My Curriculum',
  description: 'Terms of service for Map My Curriculum.'
};

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop:'4rem', paddingBottom:'4rem', maxWidth:'72ch' }}>
      <h1>Terms of Service (Placeholder)</h1>
      <p className="muted">Binding terms will be finalized before production contracts. This draft conveys current expectations.</p>
      <h3>Use of Service</h3>
      <p>Sandbox environments are for evaluation only. Do not upload confidential student records.</p>
      <h3>Acceptable Use</h3>
      <p>No reverse engineering, abusive workload generation, or unauthorized data export.</p>
      <h3>Availability</h3>
      <p>Early access may include maintenance windows and feature experimentation without notice.</p>
      <h3>Liability</h3>
      <p>Service provided “as is” during pre‑GA period without warranties of fitness.</p>
      <h3>Contact</h3>
      <p>Legal questions: <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a></p>
    </main>
  );
}
