import { z } from 'zod';

export const ReferenceSchema = z.object({
  label: z.string(),
  url: z.string().url()
});

export const RuleSchema = z.object({
  id: z.string().min(1),
  scope: z.enum(['programVersion', 'course', 'termPlan']),
  severity: z.enum(['ERROR', 'WARNING', 'INFO']),
  description: z.string().min(1),
  predicate: z.any(),
  remediation: z.string().optional(),
  references: z.array(ReferenceSchema).optional()
});
export type Rule = z.infer<typeof RuleSchema>;

export const PackMetadataSchema = z.object({
  state: z.string().regex(/^[A-Z]{2}-[A-Z]{2}$/),
  version: z.string().regex(/^\d{4}\.\d{2}$/),
  title: z.string(),
  effective_from: z.string(),
  description: z.string().optional(),
  datasets: z.record(z.string(), z.string()),
  rules: z.union([
    z.array(z.string()),
    z.record(z.string(), z.array(z.string()))
  ]),
  references: z.object({ citations: z.string() }).partial().optional(),
  tests: z.any().optional()
});
export type PackMetadata = z.infer<typeof PackMetadataSchema>;

export interface LoadedRulePack {
  meta: PackMetadata;
  baseDir: string;
  rules: { program: Rule[]; course: Rule[]; termPlan: Rule[] };
  datasets: Record<string, any>;
}

export const LoadedRulePackSchema = z.object({
  meta: PackMetadataSchema,
  baseDir: z.string(),
  rules: z.object({
    program: z.array(RuleSchema),
    course: z.array(RuleSchema),
    termPlan: z.array(RuleSchema)
  }),
  datasets: z.record(z.any())
});

export type ValidationIssue = { level: 'error' | 'warn'; message: string };
