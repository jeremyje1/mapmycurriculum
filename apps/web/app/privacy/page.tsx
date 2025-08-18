import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Map My Curriculum',
  description: 'Privacy practices for Map My Curriculum.'
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ paddingTop:'4rem', paddingBottom:'4rem', maxWidth: '78ch' }}>
      <h1>Privacy Policy</h1>
      <p className="muted">Effective Date: TBD (Early Access Draft)</p>
      <section>
        <h3>1. Scope</h3>
        <p>Map My Curriculum ("Platform") processes institutional curriculum structures and related evaluation artifacts to provide compliance, transfer, and outcomes analytics. We intentionally exclude identifiable student performance records in the current release.</p>
      </section>
      <section>
        <h3>2. Data Categories</h3>
        <ul className="checklist" style={{ marginTop: '0.5rem' }}>
          <li>Program & version metadata</li>
          <li>Course identifiers & descriptors</li>
          <li>Learning outcomes & alignment mappings</li>
          <li>Policy rule evaluation outputs & snapshots</li>
          <li>User account (name, institutional email)</li>
        </ul>
      </section>
      <section>
        <h3>3. Processing Purposes</h3>
        <p>Deliver deterministic rule evaluation, generate accreditation evidence exports, surface transfer pathway gaps, and support governance simulation workflows.</p>
      </section>
      <section>
        <h3>4. Storage & Security</h3>
        <p>Encrypted at rest & in transit. Principle of least privilege role separation. Routine vulnerability patching cadence & dependency scanning.</p>
      </section>
      <section>
        <h3>5. Retention</h3>
    <p>Sandbox data may be purged after inactivity (&lt; 60 days). Production tenant retention configurable (policy to be finalized pre‑GA).</p>
      </section>
      <section>
        <h3>6. Subprocessors</h3>
        <p>Early access build uses managed cloud infrastructure (list to be published prior to GA).</p>
      </section>
      <section>
        <h3>7. Access & Deletion Requests</h3>
        <p>Institutional administrators may request export or deletion by emailing <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a>. We aim for response within 10 business days during early access.</p>
      </section>
      <section>
        <h3>8. Changes</h3>
        <p>Material updates will be versioned and indicated with a revision date.</p>
      </section>
      <section>
        <h3>9. Contact</h3>
        <p>Privacy questions: <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a></p>
      </section>
    </main>
  );
}

