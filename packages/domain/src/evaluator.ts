import jsonLogic from 'json-logic-js';
import { LoadedRulePack, Rule } from '@cmt/state-packs';
import { ProgramSnapshot } from './snapshot';

export interface EvaluationResult {
  ruleId: string;
  scope: 'programVersion' | 'course' | 'termPlan';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  description: string;
  passed: boolean;
  message?: string;
  remediation?: string;
  references?: Array<{ label: string; url: string }>;
}

export interface EvaluationReport {
  programVersionId: string;
  timestamp: string;
  rulePack: {
    state: string;
    version: string;
    title: string;
  };
  results: EvaluationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    warnings: number;
    info: number;
  };
}

function evaluateRule(rule: Rule, data: any): { passed: boolean; message?: string } {
  try {
    const result = jsonLogic.apply(rule.predicate, data);
    
    // If result is boolean, use it directly
    if (typeof result === 'boolean') {
      return { passed: result };
    }
    
    // If result is an object with passed property
    if (result && typeof result === 'object' && 'passed' in result) {
      return { passed: !!result.passed, message: result.message };
    }
    
    // Otherwise, truthy means passed
    return { passed: !!result };
  } catch (error: any) {
    return { passed: false, message: `Evaluation error: ${error.message}` };
  }
}

export function evaluateSnapshot(
  snapshot: ProgramSnapshot,
  rulePack: LoadedRulePack
): EvaluationReport {
  const results: EvaluationResult[] = [];
  const timestamp = new Date().toISOString();

  // Evaluate program-level rules
  for (const rule of rulePack.rules.program) {
    const data = {
      snapshot,
      courses: snapshot.courses,
      termPlans: snapshot.termPlans,
      outcomes: snapshot.outcomes,
      metrics: snapshot.metrics,
      datasets: snapshot.datasets
    };
    
    const { passed, message } = evaluateRule(rule, data);
    
    results.push({
      ruleId: rule.id,
      scope: rule.scope,
      severity: rule.severity,
      description: rule.description,
      passed,
      message,
      remediation: rule.remediation,
      references: rule.references
    });
  }

  // Evaluate course-level rules
  for (const course of snapshot.courses) {
    for (const rule of rulePack.rules.course) {
      const data = {
        course,
        snapshot,
        datasets: snapshot.datasets
      };
      
      const { passed, message } = evaluateRule(rule, data);
      
      results.push({
        ruleId: rule.id,
        scope: rule.scope,
        severity: rule.severity,
        description: rule.description,
        passed,
        message: message || `Course ${course.subject} ${course.number}: ${passed ? 'Pass' : 'Fail'}`,
        remediation: rule.remediation,
        references: rule.references
      });
    }
  }

  // Evaluate term plan rules
  for (const termPlan of snapshot.termPlans) {
    for (const rule of rulePack.rules.termPlan) {
      const data = {
        termPlan,
        snapshot,
        datasets: snapshot.datasets
      };
      
      const { passed, message } = evaluateRule(rule, data);
      
      results.push({
        ruleId: rule.id,
        scope: rule.scope,
        severity: rule.severity,
        description: rule.description,
        passed,
        message: message || `Term ${termPlan.termNumber}: ${passed ? 'Pass' : 'Fail'}`,
        remediation: rule.remediation,
        references: rule.references
      });
    }
  }

  // Calculate summary
  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    errors: results.filter(r => !r.passed && r.severity === 'ERROR').length,
    warnings: results.filter(r => !r.passed && r.severity === 'WARNING').length,
    info: results.filter(r => !r.passed && r.severity === 'INFO').length
  };

  return {
    programVersionId: snapshot.programVersionId,
    timestamp,
    rulePack: {
      state: rulePack.meta.state,
      version: rulePack.meta.version,
      title: rulePack.meta.title
    },
    results,
    summary
  };
}
