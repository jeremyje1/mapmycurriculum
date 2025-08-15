# Texas RulePack (Demo) — US-TX/2025.09

Purpose: Illustrative policy-as-code pack for Texas Core Curriculum and a Business transfer framework (FOSC-style) to drive compliance scoring and impact analysis.

DISCLAIMER: Demo content only. Replace datasets and references with authoritative state sources before production use.

Contents:
- pack.yaml — metadata & pointers.
- datasets/* — minimal component areas, transfer framework, numbering, sample catalog.
- rules/* — JSONLogic-style YAML rules (program, course, term plan scopes).
- references/citations.json — placeholder citations.
- tests/fixtures/business_aa.json — snapshot metrics fixture.
- tests/spec.md — acceptance notes.

Usage:
1. Load via loader (e.g., loadRulePack("US-TX","2025.09")).
2. Build ProgramSnapshot computing metrics.core, metrics.program.totalCredits, metrics.transfer.businessFOSC.missingCount, metrics.outcomes.ploMasteryCoveragePct, metrics.termplan.maxTermCredits.
3. Run evaluate(rulePack, snapshot) -> RuleResult[].

Key Demo Rules:
- Core 42 total credits
- Core area minima
- Associate degree 60–66 SCH window
- Business FOSC foundation completeness
- PLO mastery coverage (≥1 'M' per PLO)
- Term max 18 SCH

Next Steps:
- Swap datasets with official sources.
- Expand rule set (credit residency, upper/lower division ratios, sequencing).
- Author additional state packs (CA, FL) for multi-state demo.
