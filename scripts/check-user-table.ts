import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  const table = await prisma.$queryRaw<{ regclass: string | null }[]>`
    SELECT to_regclass('"User"') AS regclass;
  `;
  console.log('User table presence:', table[0].regclass);
}

main()
  .catch(err => {
    console.error('check-user-table error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
