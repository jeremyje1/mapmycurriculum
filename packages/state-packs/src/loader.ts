import { promises as fs, Dirent } from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { PackMetadataSchema, RuleSchema, LoadedRulePack, Rule } from './types';

function isVersionDir(name: string) { return /^\d{4}\.\d{2}$/.test(name); }

async function listVersions(stateDir: string): Promise<string[]> {
  const entries = await fs.readdir(stateDir, { withFileTypes: true }) as unknown as Dirent[];
  return entries
    .filter((e: Dirent) => e.isDirectory() && isVersionDir(e.name))
    .map((e: Dirent) => e.name)
    .sort();
}

async function readYamlFile<T=any>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return parseYaml(raw) as T;
}

async function readJsonOrYaml(filePath: string): Promise<any> {
  const raw = await fs.readFile(filePath, 'utf8');
  if (filePath.endsWith('.json')) return JSON.parse(raw);
  return parseYaml(raw);
}

async function loadRuleFiles(files: string[], baseDir: string): Promise<Rule[]> {
  const all: Rule[] = [];
  for (const rel of files) {
    const full = path.resolve(baseDir, rel);
    let arr: any;
    try { arr = await readYamlFile<any[]>(full); } catch (e: any) {
      throw new Error(`Failed reading rule file ${rel}: ${e.message}`);
    }
    if (!Array.isArray(arr)) throw new Error(`Rule file ${rel} did not return an array`);
    for (const r of arr) {
      const parsed = RuleSchema.safeParse(r);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(issue => issue.message).join('; ');
        const rid = (r && (r as any).id) ? (r as any).id : 'UNKNOWN';
        throw new Error(`Rule validation failed in ${rel} for id='${rid}': ${issues}`);
      }
      all.push(parsed.data);
    }
  }
  return all;
}

export async function loadRulePack(state: string, version?: string): Promise<LoadedRulePack> {
  const repoRoot = process.cwd();
  const packsRoot = path.resolve(repoRoot, 'state-packs');
  const stateDir = path.resolve(packsRoot, state);
  try { await fs.access(stateDir); } catch { throw new Error(`State directory not found: ${stateDir}`); }

  let pickedVersion = version;
  if (!pickedVersion) {
    const versions = await listVersions(stateDir);
    if (versions.length === 0) throw new Error(`No version directories under ${stateDir}`);
    pickedVersion = versions[versions.length - 1];
  }
  const baseDir = path.resolve(stateDir, pickedVersion);
  try { await fs.access(baseDir); } catch { throw new Error(`Version directory not found: ${baseDir}`); }

  const metaPath = path.resolve(baseDir, 'pack.yaml');
  const metaRaw = await readYamlFile(metaPath);
  const metaParsed = PackMetadataSchema.safeParse(metaRaw);
  if (!metaParsed.success) {
    const issuesStr = metaParsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error('pack.yaml invalid: ' + issuesStr);
  }
  const meta = metaParsed.data;

  const datasets: Record<string, any> = {};
  for (const [key, rel] of Object.entries(meta.datasets)) {
    const full = path.resolve(baseDir, rel);
    try {
      datasets[key] = await readJsonOrYaml(full);
    } catch (e: any) {
      throw new Error(`Dataset '${key}' failed to load at ${rel}: ${e.message}`);
    }
  }

  let ruleFilePaths: string[] = [];
  if (Array.isArray(meta.rules)) {
    ruleFilePaths = meta.rules;
  } else {
    const values = Object.values(meta.rules) as string[][];
    ruleFilePaths = values.flat();
  }
  ruleFilePaths = [...new Set(ruleFilePaths)];
  const allRules = await loadRuleFiles(ruleFilePaths, baseDir);
  const rules = {
    program: allRules.filter(r => r.scope === 'programVersion'),
    course: allRules.filter(r => r.scope === 'course'),
    termPlan: allRules.filter(r => r.scope === 'termPlan')
  };

  return { meta, baseDir, rules, datasets };
}

export async function validateRulePack(state: string, version?: string): Promise<{ ok: boolean; message: string; counts?: { program: number; course: number; termPlan: number } }> {
  try {
    const rp = await loadRulePack(state, version);
    return { ok: true, message: `${rp.meta.state}/${rp.meta.version} valid`, counts: { program: rp.rules.program.length, course: rp.rules.course.length, termPlan: rp.rules.termPlan.length } };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
}
