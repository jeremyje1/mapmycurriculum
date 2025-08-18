export default function MarketingHome() {
  return (
    <main>
      {/* Hero */}
      <section className="hero" id="hero">
        <div className="container hero-inner">
            <div className="hero-copy">
              <h1>Policy‑Aware Curriculum Intelligence</h1>
              <p className="lead">Continuously map, evaluate, & prove compliance and transferability across state frameworks, outcomes, and accreditation evidence – automatically.</p>
              <div className="cta-row">
                <a className="btn primary" href="https://platform.mapmycurriculum.com/signup">Get Started</a>
                <a className="btn outline" href="https://platform.mapmycurriculum.com/login">Portal Login</a>
              </div>
              <p className="trust tiny">Covers state core frameworks, transfer pathways, learning outcomes mastery, and evidence PDF generation.</p>
            </div>
            <div className="hero-panel">
              <div className="panel-card">
                <h3>Live Compliance Snapshot</h3>
                <ul className="mini-metrics">
                  <li><strong>63</strong><span>Total SCH</span></li>
                  <li><strong>42</strong><span>Core SCH</span></li>
                  <li><strong>100%</strong><span>PLO Mastery Coverage</span></li>
                  <li><strong>0</strong><span>Foundation Gaps</span></li>
                </ul>
                <p className="tiny muted">Demo data (Texas AA Business pathway)</p>
              </div>
            </div>
        </div>
      </section>

      {/* Problem */}
      <section className="contrast" id="problem">
        <div className="container two-col">
          <div>
            <h2>The Manual Curriculum Audit Cycle Is Broken</h2>
            <ul className="checklist">
              <li>Spreadsheet silos & stale copies</li>
              <li>Policy drift across state / system updates</li>
              <li>Slow impact analysis before catalog changes</li>
              <li>Fragmented evidence for accreditation visits</li>
            </ul>
          </div>
          <div>
            <h3>What If It Were Continuous?</h3>
            <p>Map My Curriculum treats curriculum as a living graph of Programs, Versions, Courses, Outcomes, and RulePacks. Changes trigger re‑evaluation, highlighting compliance & transfer gaps instantly.</p>
            <a className="text-link" href="https://platform.mapmycurriculum.com/signup">Start continuous mapping →</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div className="container">
          <h2>Platform Features</h2>
          <div className="feature-grid">
            <div className="feature">
              <h3>State RulePacks</h3>
              <p>Versioned policy-as-code (e.g. Core Curriculum, transfer fields of study) with transparent citations.</p>
            </div>
            <div className="feature">
              <h3>JSONLogic Engine</h3>
              <p>Deterministic evaluation across program, course, and term plan scopes.</p>
            </div>
            <div className="feature">
              <h3>Outcomes Mastery Matrix</h3>
              <p>I/D/M coverage tracking with automated PLO mastery percentage.</p>
            </div>
            <div className="feature">
              <h3>Impact Simulation</h3>
              <p>Preview compliance diffs before approving catalog changes.</p>
            </div>
            <div className="feature">
              <h3>Evidence PDF</h3>
              <p>One‑click export of narrative, coverage tables, and rule pass/fail appendix.</p>
            </div>
            <div className="feature">
              <h3>Queue & Scheduling</h3>
              <p>Background EVALUATE / IMPACT jobs with weekly scans on Growth tier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="contrast" id="how-it-works">
        <div className="container">
          <h2>Customer Flow</h2>
          <ol className="flow">
            <li><strong>Onboard</strong> – choose state, upload or import catalog CSVs.</li>
            <li><strong>Evaluate</strong> – run RulePack; view scorecard & mastery matrix.</li>
            <li><strong>Iterate</strong> – adjust courses / term sequencing; re‑check instantly.</li>
            <li><strong>Simulate</strong> – model proposed changes and quantify impact.</li>
            <li><strong>Evidence</strong> – generate PDF narrative & coverage tables.</li>
            <li><strong>Monitor</strong> – scheduled scans flag drift or new policy gaps.</li>
          </ol>
        </div>
      </section>

      {/* Implementation */}
      <section id="implementation">
        <div className="container two-col">
          <div>
            <h2>Implementation Timeline</h2>
            <table className="timeline">
              <tbody>
                <tr><th>Week 1</th><td>Account setup, state selection, data import</td></tr>
                <tr><th>Week 2</th><td>Baseline evaluations & outcome alignment review</td></tr>
                <tr><th>Week 3</th><td>Impact simulation & governance workflows</td></tr>
                <tr><th>Week 4</th><td>Evidence export readiness & scheduled scans live</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3>Data Ingestion Paths</h3>
            <ul className="checklist">
              <li>CSV bulk upload (Programs, Courses, Term Plans, Outcomes, Alignments)</li>
              <li>Planned SIS connectors (Growth tier)</li>
              <li>API + future LLM assisted mapping suggestions</li>
            </ul>
            <a className="btn small" href="https://platform.mapmycurriculum.com/signup">Request Sandbox Access</a>
          </div>
        </div>
      </section>

      {/* Credibility / Trust */}
      <section className="contrast" id="credibility">
        <div className="container trust-grid">
          <div>
            <h2>Credibility & Trust</h2>
            <p>Architected with transparent rule sources, deterministic evaluation, and exportable evidence artifacts. Security & privacy controls align to higher‑ed data handling expectations.</p>
          </div>
          <ul className="pill-grid" aria-label="Trust commitments">
            <li>Versioned RulePacks</li>
            <li>Deterministic Engine</li>
            <li>Immutable Snapshots</li>
            <li>Audit Trails (Planned)</li>
            <li>SSO & RBAC (Growth+)</li>
            <li>Zero Egress of Student Data</li>
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing">
        <div className="container pricing">
          <h2>Pricing</h2>
          <h3 style={{marginTop:'1rem'}}>K‑12</h3>
          <div className="pricing-grid" style={{marginBottom:'2.5rem'}}>
            <div className="price-card">
              <h3>School Starter</h3>
              <p className="price-line">$1,500 / school / yr</p>
              <ul>
                <li>1 program map</li>
                <li>3 users</li>
                <li>Standards library (state + national)</li>
                <li>Automated alignment & gap analysis</li>
                <li>1 narrative export / yr</li>
                <li>Email support</li>
              </ul>
              <a className="btn outline full" href="/signup">Get Started</a>
            </div>
            <div className="price-card highlight">
              <h3>School Pro</h3>
              <p className="price-line">$3,500 / school / yr</p>
              <ul>
                <li>5 program maps</li>
                <li>10 users</li>
                <li>Evidence pack builder</li>
                <li>Unlimited standards imports</li>
                <li>CSV / API export</li>
                <li>Priority email</li>
              </ul>
              <a className="btn primary full" href="/signup">Select</a>
            </div>
            <div className="price-card">
              <h3>District Pro</h3>
              <p className="price-line">$9,500 / district / yr*</p>
              <ul>
                <li>Up to 10 schools (+$700 each add'l)</li>
                <li>50 program maps pooled</li>
                <li>50 users pooled</li>
                <li>Bulk import</li>
                <li>SSO (Google / OIDC)</li>
                <li>Connectors add‑on ready</li>
              </ul>
              <a className="btn outline full" href="/contact">Talk to Sales</a>
            </div>
            <div className="price-card">
              <h3>District Enterprise</h3>
              <p className="price-line">$18,000 / district / yr</p>
              <ul>
                <li>Unlimited program maps</li>
                <li>Unlimited users</li>
                <li>SSO (SAML / OIDC) included</li>
                <li>Connectors bundle included</li>
                <li>Quarterly success review</li>
                <li>White‑glove onboarding (add-on)</li>
              </ul>
              <a className="btn outline full" href="/contact">Request Quote</a>
            </div>
          </div>
          <h3>Higher‑Ed</h3>
          <div className="pricing-grid">
            <div className="price-card">
              <h3>Department</h3>
              <p className="price-line">$6,000 / dept / yr</p>
              <ul>
                <li>Up to 5 program maps</li>
                <li>10 users</li>
                <li>Accreditation framework packs</li>
                <li>Narrative generator</li>
                <li>API export</li>
              </ul>
              <a className="btn outline full" href="/signup">Get Started</a>
            </div>
            <div className="price-card highlight">
              <h3>College</h3>
              <p className="price-line">$18,000 / college / yr</p>
              <ul>
                <li>Up to 20 program maps</li>
                <li>50 users</li>
                <li>SSO (OIDC) included</li>
                <li>LMS connector add‑on</li>
                <li>Priority support</li>
              </ul>
              <a className="btn primary full" href="/signup">Select</a>
            </div>
            <div className="price-card">
              <h3>Institution</h3>
              <p className="price-line">$45,000 / institution / yr</p>
              <ul>
                <li>Unlimited programs & users</li>
                <li>SSO (SAML / OIDC)</li>
                <li>LMS + SIS connectors</li>
                <li>Quarterly governance workshop</li>
                <li>Custom reporting</li>
              </ul>
              <a className="btn outline full" href="/contact">Request Quote</a>
            </div>
          </div>
          <p className="tiny muted" style={{marginTop:'1.25rem'}}>*+$700 each additional school. Consortia / equity discounts: 10% state co‑ops; 15% Title I (&gt;70% FRL).</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-final" id="cta">
        <div className="container">
          <h2>Ready to operationalize curriculum compliance?</h2>
          <p>Spin up a sandbox and evaluate a program in under 10 minutes.</p>
          <div className="cta-row">
            <a className="btn primary" href="https://platform.mapmycurriculum.com/signup">Launch Sandbox</a>
            <a className="btn" href="https://platform.mapmycurriculum.com/login">Login</a>
          </div>
        </div>
      </section>
    </main>
  );
}
