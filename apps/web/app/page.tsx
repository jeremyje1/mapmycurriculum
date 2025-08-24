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
          <h2>Simple, Transparent Pricing</h2>
          <p style={{textAlign:'center',fontSize:'1.1rem',marginBottom:'2rem'}}>Choose the plan that fits your institution. All plans include our AI-powered curriculum engine.</p>
          <div className="pricing-grid">
            {/* Starter Plan */}
            <div className="price-card">
              <p className="price-tier">Starter Plan</p>
              <h3 style={{margin:0}}>
                <span className="price-amount">$2,495</span>
                <span className="price-period">/ year</span>
              </h3>
              <p className="price-users">Up to 500 students / 50 faculty</p>
              <ul>
                <li>Upload curriculum maps (CSV, Excel, PDF)</li>
                <li>Auto-alignment with national/state standards</li>
                <li>AI-generated gap analysis report (10 pages)</li>
                <li>Exportable curriculum maps (CSV/Word/PDF)</li>
                <li>Email support only</li>
              </ul>
              <a className="btn outline full cta-button" href="https://platform.mapmycurriculum.com/signup?plan=starter">Start Free Trial</a>
            </div>
            {/* Professional Plan */}
            <div className="price-card highlight">
              <p className="price-tier">Professional Plan</p>
              <h3 style={{margin:0}}>
                <span className="price-amount">$5,995</span>
                <span className="price-period">/ year</span>
              </h3>
              <p className="price-users">Up to 2,500 students / 200 faculty</p>
              <ul>
                <li>Everything in Starter, plus:</li>
                <li>AI narrative report (20–25 pages)</li>
                <li>Multi-program support (5 programs/departments)</li>
                <li>Faculty collaboration portal</li>
                <li>Scenario modeling (curriculum redesign options)</li>
                <li>Standards crosswalks (state → accreditation body)</li>
                <li>Monthly office hours session with consultant</li>
              </ul>
              <a className="btn primary full cta-button" href="https://platform.mapmycurriculum.com/signup?plan=professional">Start Free Trial</a>
            </div>
            {/* Comprehensive Plan */}
            <div className="price-card">
              <p className="price-tier">Comprehensive Plan</p>
              <h3 style={{margin:0}}>
                <span className="price-amount">$12,500</span>
                <span className="price-period">/ year</span>
              </h3>
              <p className="price-users">Up to 10,000 students / 1,000 faculty</p>
              <ul>
                <li>Everything in Professional, plus:</li>
                <li>Custom accreditation alignment (regional + professional)</li>
                <li>AI-powered curriculum visualization dashboards</li>
                <li>Unlimited program uploads</li>
                <li>Real-time gap closure tracking</li>
                <li>Annual curriculum strategy workshop (virtual)</li>
                <li>40–50 page AI narrative & accreditation package</li>
              </ul>
              <a className="btn outline full cta-button" href="https://platform.mapmycurriculum.com/contact?plan=comprehensive">Get Quote</a>
            </div>
            {/* Enterprise Plan */}
            <div className="price-card">
              <p className="price-tier">Enterprise Transformation</p>
              <h3 style={{margin:0}}>
                <span className="price-amount">$25,000+</span>
                <span className="price-period">custom pricing</span>
              </h3>
              <p className="price-users">Unlimited users and programs</p>
              <ul>
                <li>Everything in Comprehensive, plus:</li>
                <li>Dedicated customer success manager</li>
                <li>API integrations (Canvas, Banner, Workday, etc.)</li>
                <li>Power BI / Tableau dashboard embed</li>
                <li>Quarterly progress audits</li>
                <li>On-site or hybrid accreditation support</li>
                <li>Full white-glove implementation</li>
              </ul>
              <a className="btn outline full cta-button" href="https://platform.mapmycurriculum.com/contact?plan=enterprise">Contact Sales</a>
            </div>
          </div>
          <div style={{marginTop:'3rem',textAlign:'center'}}>
            <p style={{fontSize:'0.9rem',color:'#6b7280'}}>
              🔒 All plans include: Secure data handling • Regular platform updates • Standards library access<br/>
              💳 Payment options: Annual billing • Purchase orders accepted • Multi-year discounts available
            </p>
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
