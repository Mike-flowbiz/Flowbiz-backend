/**
 * Creates or updates a single ADMIN user for local/dev/staging.
 *
 * Usage:
 *   npx tsx prisma/seed-admin.ts
 *
 * Override defaults with env (recommended for production seeding):
 *   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='SecurePass1!' npx tsx prisma/seed-admin.ts
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env first.');
}

const email = (process.env.ADMIN_EMAIL || 'admin@flowbiz.local').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'FlowBizAdmin123!';
const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
const lastName = process.env.ADMIN_LAST_NAME || 'User';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      firstName,
      lastName,
      role: 'ADMIN',
    },
    create: {
      email,
      password: passwordHash,
      firstName,
      lastName,
      role: 'ADMIN',
    },
  });

  console.log('');
  console.log('✅ Admin user ready:');
  console.log(`   Email:    ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ${user.role}`);
  console.log('');
  console.log('   Sign in at /login. Change this password after first login in production.');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
