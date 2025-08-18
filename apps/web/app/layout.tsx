import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Map My Curriculum – Policy‑Aware Curriculum Intelligence Platform',
  description: 'Automated policy-aware curriculum mapping, compliance analytics, transferability scoring, and evidence generation.'
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="canonical" href="https://platform.mapmycurriculum.com" />
        <meta property="og:site_name" content="Map My Curriculum" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://platform.mapmycurriculum.com" />
        <meta property="og:title" content="Map My Curriculum" />
        <meta property="og:description" content="Policy‑aware curriculum intelligence & compliance automation." />
      </head>
      <body>
        <header className="site-header">
          <div className="container nav-row">
            <a className="logo" href="https://platform.mapmycurriculum.com">Map<span>My</span>Curriculum</a>
            <nav aria-label="Primary">
              <a href="https://platform.mapmycurriculum.com#features">Features</a>
              <a href="https://platform.mapmycurriculum.com#how-it-works">Flow</a>
              <a href="https://platform.mapmycurriculum.com#implementation">Implementation</a>
              <a href="https://platform.mapmycurriculum.com#credibility">Credibility</a>
              <a href="https://platform.mapmycurriculum.com#pricing">Pricing</a>
              <a className="btn small" href="https://platform.mapmycurriculum.com/login">Portal Login</a>
              <a className="btn primary small" href="https://platform.mapmycurriculum.com/signup">Get Started</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <strong>Map My Curriculum</strong>
              <p className="muted">Policy‑aware curriculum intelligence platform.</p>
              <p className="tiny">© {new Date().getFullYear()} MapMyCurriculum. All rights reserved.</p>
            </div>
            <div>
              <h4>Platform</h4>
              <ul>
                <li><a href="https://platform.mapmycurriculum.com#features">Features</a></li>
                <li><a href="https://platform.mapmycurriculum.com#how-it-works">Flow</a></li>
                <li><a href="https://platform.mapmycurriculum.com#implementation">Implementation</a></li>
                <li><a href="https://platform.mapmycurriculum.com#pricing">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li><a href="https://platform.mapmycurriculum.com/login">Portal Login</a></li>
                <li><a href="https://platform.mapmycurriculum.com/signup">Get Started</a></li>
                <li><a href="mailto:hello@mapmycurriculum.com">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4>Compliance</h4>
              <ul>
                <li><a href="https://platform.mapmycurriculum.com#credibility">Security & Trust</a></li>
                <li><a href="https://platform.mapmycurriculum.com/privacy">Privacy</a></li>
                <li><a href="https://platform.mapmycurriculum.com/terms">Terms</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
