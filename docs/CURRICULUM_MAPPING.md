# Curriculum Mapping Implementation Guide

This document describes the curriculum mapping capabilities implemented in the Map My Curriculum system.

## Overview

The curriculum mapping system provides:
- **Demo Data Loading**: Load curriculum data from CSV files
- **Program Snapshot Building**: Transform curriculum data into structured snapshots with metrics
- **Rule Evaluation**: Evaluate program snapshots against state regulatory requirements using JSONLogic
- **Compliance Reporting**: Generate detailed compliance reports with pass/fail results

## Architecture

### Components

1. **Demo Data Loader** (`packages/domain/src/demo-data.ts`)
   - Loads CSV files: programs, courses, term plans, learning outcomes, alignments
   - Validates and transforms data into typed structures

2. **Metrics Calculator** (`packages/domain/src/metrics.ts`)
   - Computes program-level metrics (total credits, term credits)
   - Computes core curriculum metrics (core credits by area)
   - Computes transfer metrics (business foundation courses)
   - Computes outcome metrics (PLO mastery coverage)

3. **Snapshot Builder** (`packages/domain/src/snapshot.ts`)
   - Creates program snapshots from curriculum data
   - Includes courses, term plans, learning outcomes, and calculated metrics

4. **Evaluation Engine** (`packages/domain/src/evaluator.ts`)
   - Uses json-logic-js to evaluate rules against snapshots
   - Evaluates at three scopes: program, course, and term plan
   - Generates detailed evaluation reports

5. **State RulePacks** (`packages/state-packs`)
   - Loads versioned regulatory rules from state-packs directory
   - Parses YAML rule definitions and JSON datasets
   - Validates rule structure with Zod schemas

## Data Structures

### Demo Data CSV Format

**programs.csv**
```csv
code,name,degreeType,catalogYear
BUS-AA-TX,Associate of Arts in Business (Texas Transfer Pathway),AA,2025-2026
```

**courses.csv**
```csv
subject,number,title,credits,cip,tccns,coreArea
ENGL,1301,Composition I,3,23.1301,ENGL 1301,Communication
MATH,1325,Calculus for Business & Social Sciences,3,27.0101,MATH 1325,Mathematics
```

**termplan.csv**
```csv
programCode,term,subject,number,required
BUS-AA-TX,1,ENGL,1301,TRUE
BUS-AA-TX,1,MATH,1325,TRUE
```

**outcomes.csv**
```csv
type,ownerCode,code,level,description
PLO,BUS-AA-TX,PLO1,M,Apply accounting and quantitative analysis to business decisions.
CLO,ACCT 2301,CLO_ACCT2301_1,D,Prepare and interpret basic financial statements.
```

**alignments.csv**
```csv
programCode,ploCode,courseSubject,courseNumber,cloCode,level,weight
BUS-AA-TX,PLO1,MATH,1325,CLO_MATH1325_1,I,1.0
BUS-AA-TX,PLO1,ACCT,2301,CLO_ACCT2301_1,D,1.0
```

### Metrics Structure

The system calculates comprehensive metrics organized into categories:

```typescript
{
  program: {
    totalCredits: number,      // Total credit hours
    maxTermCredits: number     // Maximum credits in any term
  },
  core: {
    totalCredits: number,      // Total core curriculum credits
    areaCredits: {             // Credits by core area
      "Communication": number,
      "Mathematics": number,
      // ... other areas
    },
    areaBreakdown: {           // Detailed breakdown by area
      "Communication": {
        credits: number,
        courses: string[]
      }
    }
  },
  transfer: {
    businessFOSC: {            // Business Field of Study Curriculum
      missing: string[],       // Missing foundation subjects
      missingCount: number,    // Count of missing subjects
      complete: boolean        // Whether foundation is complete
    }
  },
  outcomes: {
    ploMasteryCoveragePct: number  // % of PLOs with mastery alignment
  }
}
```

## Running Evaluations

### Basic Demo Evaluation

From the repository root:

```bash
npm run demo:evaluate
```

This runs the Texas demo evaluation using data from `demo-data/` directory.

### From Domain Package

```bash
cd packages/domain
npm run demo:evaluate
```

### Custom Evaluation

To create your own evaluation:

```typescript
import { loadDemoData } from '@cmt/domain';
import { loadRulePack } from '@cmt/state-packs';
import { evaluateSnapshot } from '@cmt/domain';

// Load data
const demoData = await loadDemoData('./demo-data');
const rulePack = await loadRulePack('US-TX', '2025.09');

// Build snapshot (see demo-evaluate.ts for full example)
const snapshot = buildSnapshot(programData, rulePack);

// Evaluate
const report = evaluateSnapshot(snapshot, rulePack);

console.log(`Passed: ${report.summary.passed}/${report.summary.total}`);
```

## Rule Evaluation

Rules are defined in state-packs using JSONLogic syntax. Example rule:

```yaml
- id: TX_CORE_42_MIN_SH
  scope: programVersion
  severity: ERROR
  description: "Texas Core requires at least 42 SCH across component areas."
  predicate:
    ">=":
      - { "var": "metrics.core.totalCredits" }
      - 42
  remediation: "Increase mapped core courses or reclassify eligible courses into core areas."
  references:
    - { label: "Texas Core (demo)", url: "https://example.org/tx/core" }
```

The `predicate` uses JSONLogic to evaluate conditions against the snapshot data.

### Available Data in Rules

- **Program Scope**: Full snapshot including `metrics`, `courses`, `termPlans`, `outcomes`, `datasets`
- **Course Scope**: Individual `course` object plus full `snapshot` and `datasets`
- **Term Plan Scope**: Individual `termPlan` object plus full `snapshot` and `datasets`

## Testing

Run the test suite:

```bash
npm test
```

The tests validate:
- Metrics calculations
- CSV parsing and data loading
- Snapshot building
- Rule evaluation logic

## Adding New Data

To add new curriculum data:

1. Create CSV files in `demo-data/` directory
2. Follow the CSV format specifications above
3. Ensure fields with commas are properly quoted
4. Run `npm run demo:evaluate` to validate

## Extending Rules

To add new rules:

1. Navigate to appropriate state-pack (e.g., `state-packs/US-TX/2025.09/`)
2. Edit rule files in `rules/` directory
3. Follow the rule schema defined in `packages/state-packs/src/types.ts`
4. Test with `npm run demo:evaluate`

## Next Steps

- [ ] Integrate with database for persistent storage
- [ ] Add API endpoints for evaluation requests
- [ ] Create UI for curriculum management and evaluation
- [ ] Implement CSV import pipeline
- [ ] Generate compliance evidence PDFs
