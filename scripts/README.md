# Texas RulePack (Demo) — US-TX/2025.09

**Purpose:** Provide an illustrative, policy-as-code pack for Texas Core Curriculum and a Business transfer framework (FOSC-style) to drive compliance scoring and impact analysis.

> This is demo content for pilots. Replace datasets and references with official sources before production.

## Files

- `pack.yaml`: metadata and pointers to datasets/rules.
- `datasets/*`: minimal component areas, transfer framework, numbering (TCCNS), and sample course catalog entries.
- `rules/*`: JSONLogic-style predicates in YAML for program, course, and term rules.
- `references/citations.json`: placeholder for official citations.
- `tests/fixtures/business_aa.json`: snapshot-style metrics fixture for local rule testing.
- `tests/spec.md`: acceptance notes for the demo pack.

## Usage

1. Load the pack via `loadRulePack("US-TX","2025.09")`.
2. Build a ProgramSnapshot that computes `metrics.*` (core totals, area breakdown, total SCH, outcomes coverage, etc.).
3. Run `evaluate(rulePack, snapshot)` and persist `RuleResult[]`.