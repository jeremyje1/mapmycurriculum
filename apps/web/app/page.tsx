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
          <h2>Simple Tiering</h2>
          <div className="pricing-grid">
            <div className="price-card">
              <h3>Essential</h3>
              <p className="price-line">Entry</p>
              <ul>
                <li>1 State RulePack</li>
                <li>Manual Upload</li>
                <li>On‑Demand Evaluations</li>
                <li>Evidence PDF</li>
              </ul>
              <a className="btn outline full" href="https://platform.mapmycurriculum.com/signup">Start</a>
            </div>
            <div className="price-card highlight">
              <h3>Growth</h3>
              <p className="price-line">Most Popular</p>
              <ul>
                <li>All Essential +</li>
                <li>Weekly Scans</li>
                <li>Connectors</li>
                <li>SSO / RBAC</li>
              </ul>
              <a className="btn primary full" href="https://platform.mapmycurriculum.com/signup">Upgrade</a>
            </div>
            <div className="price-card">
              <h3>District / System</h3>
              <p className="price-line">Custom</p>
              <ul>
                <li>Multi‑College Aggregation</li>
                <li>Unlimited Programs</li>
                <li>Private Exports</li>
                <li>Advanced Analytics</li>
              </ul>
              <a className="btn outline full" href="https://platform.mapmycurriculum.com/contact">Talk to Us</a>
            </div>
          </div>
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
