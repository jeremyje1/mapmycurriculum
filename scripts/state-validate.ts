#!/usr/bin/env tsx
import { validateRulePack } from '../packages/state-packs/src/loader';

async function main() {
  const [, , state, version] = process.argv;
  if (!state) {
    console.error('Usage: pnpm state:validate <STATE> [VERSION]');
    process.exit(1);
  }
  const result = await validateRulePack(state, version);
  if (result.ok) {
    console.log(result.message);
    if (result.counts) {
      console.log(`Rules: program=${result.counts.program} course=${result.counts.course} termPlan=${result.counts.termPlan}`);
    }
    process.exit(0);
  } else {
    console.error(`Validation failed: ${result.message}`);
    process.exit(2);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(3);
});
