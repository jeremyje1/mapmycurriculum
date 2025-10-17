const { PrismaClient } = require('../apps/web/node_modules/@prisma/client');

const DIRECT_DATABASE_URL = 'postgresql://postgres:syTjzMLOGGieR0gf@db.dsxiiakytpufxsqlimkf.supabase.co:5432/postgres?sslmode=require';

const prisma = new PrismaClient({ datasourceUrl: DIRECT_DATABASE_URL });

async function main() {
  const result = await prisma.$queryRaw`SELECT to_regclass('"User"') AS regclass;`;
  console.log(result);
}

main()
  .catch(err => {
    console.error('check-user-table error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
