// Quick script to check database state
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();
const prisma = new PrismaClient();

async function main() {
  const institutions = await prisma.institution.findMany({
    include: { users: true }
  });
  
  console.log('🏫 Institutions:', institutions.length);
  institutions.forEach(inst => {
    console.log(`  - ${inst.name} (${inst.state}) - ${inst.users.length} users`);
    inst.users.forEach(user => {
      console.log(`    👤 ${user.email} (${user.role})`);
    });
  });
  
  if (institutions.length === 0) {
    console.log('  No institutions found. Ready for first signup!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
