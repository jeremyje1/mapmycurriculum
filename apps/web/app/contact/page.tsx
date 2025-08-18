import React from 'react';

export const metadata = {
  title: 'Contact | Map My Curriculum',
  description: 'Contact Map My Curriculum.'
};

export default function ContactPage() {
  return (
    <main className="container" style={{ paddingTop:'4rem', paddingBottom:'4rem' }}>
      <h1>Contact</h1>
      <p>Reach us at <a href="mailto:hello@mapmycurriculum.com">hello@mapmycurriculum.com</a>.</p>
      <p className="tiny muted">More contact channels (support portal / ticketing) coming soon.</p>
    </main>
  );
}
