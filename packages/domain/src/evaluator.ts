import jsonLogic, { RulesLogic } from 'json-logic-js';
import { LoadedRulePack, Rule } from '@cmt/state-packs';
import { ProgramSnapshot } from './snapshot';

export interface RuleEvaluationResult {
  ruleId: string;
  scope: Rule['scope'];
  targetId: string;
  targetLabel: string;
  passed: boolean;
  severity: Rule['severity'];
  description: string;
  remediation?: string;
  details?: { error?: string };
}

export interface RuleEvaluationSummary {
  program: RuleEvaluationResult[];
  courses: RuleEvaluationResult[];
  termPlans: RuleEvaluationResult[];
}

function applyPredicate(predicate: RulesLogic, context: Record<string, unknown>) {
  try {
    const outcome = jsonLogic.apply(predicate, context);
    return { passed: Boolean(outcome) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { passed: false, error: message };
  }
}

function buildBaseContext(snapshot: ProgramSnapshot) {
  return {
    program: snapshot.program,
    metrics: snapshot.metrics,
    datasets: snapshot.datasets,
    rulePack: snapshot.rulePack
  };
}

function evaluateRule(
  rule: Rule,
  context: Record<string, unknown>,
  targetId: string,
  targetLabel: string
): RuleEvaluationResult {
  const { passed, error } = applyPredicate(rule.predicate as RulesLogic, context);
  return {
    ruleId: rule.id,
    scope: rule.scope,
    targetId,
    targetLabel,
    passed,
    severity: rule.severity,
    description: rule.description,
    remediation: rule.remediation,
    details: error ? { error } : undefined
  };
}

export function evaluateRulePack(snapshot: ProgramSnapshot, pack: LoadedRulePack): RuleEvaluationSummary {
  const base = buildBaseContext(snapshot);
  const programResults = pack.rules.program.map((rule: Rule) =>
    evaluateRule(rule, { ...base }, snapshot.programVersionId, `${snapshot.program.code} (${snapshot.program.catalogYear})`)
  );

  const courseResults: RuleEvaluationResult[] = [];
  for (const course of snapshot.courses) {
    const courseContext = { ...base, course };
    for (const rule of pack.rules.course as Rule[]) {
      courseResults.push(
        evaluateRule(
          rule,
          courseContext,
          course.id,
          `${course.subject} ${course.number} – ${course.title}`
        )
      );
    }
  }

  const termResults: RuleEvaluationResult[] = [];
  for (const term of snapshot.termPlans) {
    const termContext = { ...base, term };
  for (const rule of pack.rules.termPlan as Rule[]) {
      termResults.push(
        evaluateRule(
          rule,
          termContext,
          `term-${term.termNumber}`,
          `Term ${term.termNumber}`
        )
      );
    }
  }

  return {
    program: programResults,
    courses: courseResults,
    termPlans: termResults
  };
}
