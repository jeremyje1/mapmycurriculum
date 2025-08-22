import React from 'react';

// Onboarding assessment tiers page. All tiers include One‑Click Org Chart + Curriculum Mapping.
// Progressive enhancements: higher tiers add analytics, scenario builder, collaboration, transformation services.

interface TierCardProps { title: string; price: string; cadence?: string; bullets: string[]; cta: { href: string; label: string }; highlight?: boolean; }

function TierCard({ title, price, cadence, bullets, cta, highlight }: TierCardProps) {
  return (
    <div className={`tier-card${highlight ? ' highlight' : ''}`}>
      <h3>{title}</h3>
      <p className="price">{price}{cadence && <span className="cadence">{cadence}</span>}</p>
      <ul className="features">
        {bullets.map(b => <li key={b}>{b}</li>)}
      </ul>
      <a className={`btn ${highlight ? 'primary' : 'outline'} full`} href={cta.href}>{cta.label}</a>
    </div>
  );
}

export default function OnboardingAssessmentPage() {
  const universal = 'One‑Click Org Chart + Curriculum Mapping';
  return (
    <main style={{ padding: '3rem 1rem', maxWidth: 1280, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Assessment & Onboarding Tiers</h1>
      <p className="muted" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 2.5rem' }}>
        Every tier starts with universal visibility: {universal}. Higher tiers layer advanced analytics, governance scenario modeling, and collaborative transformation support.
      </p>
      <div className="tiers-grid">
        <TierCard
          title="One‑Time Diagnostic"
          price="$4,995"
          bullets={[
            universal,
            'Baseline compliance & gap report',
            'Initial outcomes alignment snapshot',
            'Org structure ingestion assistance',
            'Template pack (CSV) imports'
          ]}
          cta={{ href: '/assessment/onboarding?select=diagnostic', label: 'Get Started' }}
        />
        <TierCard
          title="Monthly"
          price="$2,995"
          cadence="/mo"
          highlight
          bullets={[
            universal,
            'Continuous gap monitoring',
            'Monthly analytics PDF',
            'Scenario builder (what‑if)',
            'Priority email support'
          ]}
          cta={{ href: '/assessment/onboarding?select=monthly', label: 'Subscribe' }}
        />
        <TierCard
          title="Comprehensive"
          price="$9,900"
          bullets={[
            universal,
            'Advanced analytics & trend dashboards',
            'Program change impact simulation',
            'Collaboration workspace (roles)',
            'Quarterly strategic review'
          ]}
          cta={{ href: '/assessment/onboarding?select=comprehensive', label: 'Contact Sales' }}
        />
        <TierCard
          title="Enterprise Transformation"
            price="$24,000"
          bullets={[
            universal,
            'Full analytics + custom KPI modules',
            'Bulk scaling & multi‑unit governance',
            'Dedicated success architect',
            'Change management playbooks'
          ]}
          cta={{ href: '/assessment/onboarding?select=enterprise', label: 'Request Proposal' }}
        />
      </div>
      <section style={{ marginTop: '3rem' }}>
        <h2>Data Import Templates</h2>
        <p className="tiny muted" style={{ maxWidth: 640 }}>Download starter CSV templates to accelerate mapping. Populate and upload via the platform importer.</p>
        <ul className="templates">
          <li><a href="/templates/org_units.csv" download>org_units.csv</a></li>
          <li><a href="/templates/positions.csv" download>positions.csv</a></li>
          <li><a href="/templates/people.csv" download>people.csv</a></li>
          <li><a href="/templates/systems_inventory.csv" download>systems_inventory.csv</a></li>
        </ul>
      </section>
      <style>{`
        .tiers-grid { display:grid; gap:1.25rem; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); }
        .tier-card { background:#fff; border:1px solid #dfe3ec; border-radius:12px; padding:1.15rem 1.1rem 1.5rem; display:flex; flex-direction:column; }
        .tier-card.highlight { border:2px solid #2b5cff; }
        .tier-card h3 { margin:0 0 .4rem; font-size:1rem; }
        .tier-card .price { font-weight:600; margin:.25rem 0 1rem; font-size:.95rem; }
        .tier-card .cadence { font-weight:400; color:#5a6b82; margin-left:.15rem; }
        .tier-card ul.features { list-style:none; margin:0 0 1.1rem; padding:0; font-size:.78rem; line-height:1.45; }
        .tier-card ul.features li { margin:0 0 .45rem; }
        .btn { text-decoration:none; text-align:center; font-size:.75rem; padding:.6rem .8rem; border-radius:6px; font-weight:600; border:1px solid #2b5cff; color:#2b5cff; }
        .btn.full { width:100%; }
        .btn.primary { background:#2b5cff; color:#fff; }
        .btn.primary:hover { background:#1e49d2; }
        .btn.outline:hover { background:#f3f7ff; }
        section .templates { list-style:none; padding:0; margin: .75rem 0 0; display:flex; flex-wrap:wrap; gap:.75rem; font-size:.75rem; }
        section .templates a { padding:.45rem .65rem; border:1px solid #d0d7e4; border-radius:6px; background:#fff; text-decoration:none; }
        @media (prefers-color-scheme: dark){
          .tier-card { background:#161b22; border-color:#2a3342; }
          .tier-card.highlight { border-color:#3962ff; }
          .btn.outline { border-color:#3962ff; color:#dfe6f2; }
          body, main { color:#e6ebf3; }
          section .templates a { border-color:#2a3342; background:#1b222c; }
        }
      `}</style>
    </main>
  );
}
