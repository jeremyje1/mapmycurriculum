import React from 'react';

export const metadata = {
  title: 'Terms of Service | Map My Curriculum',
  description: 'Terms of service for Map My Curriculum.'
};

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop:'4rem', paddingBottom:'4rem', maxWidth:'78ch' }}>
      <h1>Terms of Service</h1>
      <p className="muted">Effective Date: TBD (Early Access Draft)</p>
      <section>
        <h3>1. Acceptance</h3>
        <p>By accessing the sandbox or early access environment you agree to these draft terms. Production contracts will supersede upon execution.</p>
      </section>
      <section>
        <h3>2. License & Use</h3>
        <p>Limited, revocable, non-transferable right to evaluate functionality for internal institutional planning. No resale or competitive analysis publication.</p>
      </section>
      <section>
        <h3>3. Data Responsibilities</h3>
        <p>Do not upload protected student information (FERPA or equivalent) in early access. Aggregate curriculum structures only.</p>
      </section>
      <section>
        <h3>4. Acceptable Use</h3>
        <ul className="checklist" style={{ marginTop: '0.5rem' }}>
          <li>No abusive automation or denial of service attempts</li>
          <li>No circumvention of access controls</li>
          <li>No unauthorized vulnerability scanning</li>
          <li>No exporting policy packs for redistribution</li>
        </ul>
      </section>
      <section>
        <h3>5. Availability & Changes</h3>
        <p>Service may change or pause for maintenance without notice during early access. We target reasonable uptime but no SLA is provided pre‑GA.</p>
      </section>
      <section>
        <h3>6. Intellectual Property</h3>
        <p>All platform code, rule evaluation logic, and generated analytics remain property of Map My Curriculum except institutional source curriculum data you supply.</p>
      </section>
      <section>
        <h3>7. Disclaimers</h3>
        <p>Provided “as is” without warranties. We disclaim implied warranties of merchantability, fitness, and non-infringement.</p>
      </section>
      <section>
        <h3>8. Limitation of Liability</h3>
        <p>No liability for indirect, incidental, or consequential damages. Aggregate liability capped at $100 for early access users.</p>
      </section>
      <section>
        <h3>9. Termination</h3>
        <p>We may revoke access for breach or misuse. You may discontinue use at any time; request data removal via email.</p>
      </section>
      <section>
        <h3>10. Governing Law</h3>
        <p>Will be specified in production agreements; draft governed by the laws of the operating jurisdiction (to be finalized).</p>
      </section>
      <section>
        <h3>11. Contact</h3>
        <p>Legal questions: <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a></p>
      </section>
    </main>
  );
}

