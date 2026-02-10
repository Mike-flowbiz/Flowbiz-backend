import 'dotenv/config';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/** Generate demo client definitions with faker. Seeded for reproducibility. */
function generateClientDefinitions(count: number) {
  faker.seed(42);
  const clients: Array<{
    name: string;
    email: string;
    companyName: string | null;
    address: string;
    phone: string;
    vatNumber: string | null;
    notes: string;
    isActive?: boolean;
  }> = [];

  for (let i = 0; i < count; i++) {
    const isIndividual = i === 3; // one individual (no company/vat)
    const isInactive = i === 5;   // one inactive client
    const name = isIndividual
      ? faker.person.fullName()
      : faker.company.name();
    const email = faker.internet.email({
      firstName: name.split(' ')[0]?.toLowerCase() ?? 'client',
      provider: 'flowbiz.test',
    }).replace('@', `+c${i}@`);
    const address = faker.location.streetAddress({ useFullAddress: true }) + ', ' + faker.location.city() + ', UK';
    const phone = faker.phone.number({ style: 'international' });
    const notes = faker.lorem.sentence();

    clients.push({
      name,
      email,
      companyName: isIndividual ? null : name,
      address,
      phone,
      vatNumber: isIndividual ? null : 'GB' + faker.string.numeric(9),
      notes,
      ...(isInactive && { isActive: false }),
    });
  }
  return clients;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getDateForMonthOffset(monthOffset: number, day: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthOffset, day);
}


async function main() {
  console.log('🌱 Seeding demo data for Milestone 3 & 4 (dashboard + clients)...');

  // 1) Ensure a demo admin user exists
  const demoEmail = 'demo@flowbiz.test';
  const demoPassword = 'Password123!';

  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      password: passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log(`👤 Demo admin user ready: ${demoUser.email} / ${demoPassword}`);

  // 2) Create or reuse some demo clients (generated, not hardcoded)
  const clientDefinitions = generateClientDefinitions(6);

  const clients = [] as { id: string; name: string }[];

  for (const def of clientDefinitions) {
    const isActive = 'isActive' in def ? def.isActive : true;
    const client = await prisma.client.upsert({
      where: { email: def.email },
      update: {
        name: def.name,
        companyName: def.companyName,
        address: def.address,
        phone: def.phone,
        vatNumber: def.vatNumber,
        notes: def.notes,
        isActive,
      },
      create: {
        name: def.name,
        email: def.email,
        companyName: def.companyName,
        address: def.address,
        phone: def.phone,
        vatNumber: def.vatNumber,
        notes: def.notes,
        isActive,
      },
    });

    clients.push({ id: client.id, name: client.name });
  }

  console.log(`👥 Demo clients ready: ${clients.map((c) => c.name).join(', ')}`);

  // 3) Optional: ensure a basic business setting exists so invoices feel realistic
  await prisma.businessSetting.upsert({
    where: { id: 'demo-business-settings' },
    update: {},
    create: {
      id: 'demo-business-settings',
      companyName: 'FlowBiz Demo Ltd',
      companyEmail: 'info@flowbiz.test',
      companyAddress: '100 Demo Street, London, UK',
      vatNumber: 'GB123456789',
      vatRate: 20,
    },
  }).catch(() => {
    // If id is not unique in this environment just ignore, it is not critical
  });

  // 4) Clear existing demo invoices so the seed is repeatable
  const deleteResult = await prisma.invoice.deleteMany({
    where: { notes: 'Demo data for Milestone 3' },
  });

  if (deleteResult.count > 0) {
    console.log(`🧹 Removed ${deleteResult.count} existing demo invoices`);
  }

  // 5) Create demo invoices across the last 6 months
  const demoInvoices: {
    number: string;
    clientIndex: number;
    monthOffset: number; // 0 = current month, 1 = last month, etc.
    status: InvoiceStatus;
    subtotal: number;
    vatRate: number;
    isOverdue?: boolean;
  }[] = [
    // Current month – a couple of PAID invoices
    {
      number: 'INV-M3-0001',
      clientIndex: 0,
      monthOffset: 0,
      status: InvoiceStatus.PAID,
      subtotal: 1500,
      vatRate: 20,
    },
    {
      number: 'INV-M3-0002',
      clientIndex: 1,
      monthOffset: 0,
      status: InvoiceStatus.PAID,
      subtotal: 800,
      vatRate: 20,
    },
    // Last month – PAID + SENT
    {
      number: 'INV-M3-0003',
      clientIndex: 2,
      monthOffset: 1,
      status: InvoiceStatus.PAID,
      subtotal: 2200,
      vatRate: 20,
    },
    {
      number: 'INV-M3-0004',
      clientIndex: 0,
      monthOffset: 1,
      status: InvoiceStatus.SENT,
      subtotal: 600,
      vatRate: 20,
    },
    // Older months for the 6‑month chart
    {
      number: 'INV-M3-0005',
      clientIndex: 1,
      monthOffset: 2,
      status: InvoiceStatus.PAID,
      subtotal: 1200,
      vatRate: 20,
    },
    {
      number: 'INV-M3-0006',
      clientIndex: 2,
      monthOffset: 3,
      status: InvoiceStatus.PAID,
      subtotal: 950,
      vatRate: 20,
    },
    {
      number: 'INV-M3-0007',
      clientIndex: 0,
      monthOffset: 4,
      status: InvoiceStatus.PAID,
      subtotal: 1800,
      vatRate: 20,
    },
    {
      number: 'INV-M3-0008',
      clientIndex: 1,
      monthOffset: 5,
      status: InvoiceStatus.PAID,
      subtotal: 400,
      vatRate: 20,
    },
    // Overdue & pending invoices (SENT / OVERDUE)
    {
      number: 'INV-M3-0009',
      clientIndex: 2,
      monthOffset: 1,
      status: InvoiceStatus.OVERDUE,
      subtotal: 500,
      vatRate: 20,
      isOverdue: true,
    },
    {
      number: 'INV-M3-0010',
      clientIndex: 0,
      monthOffset: 0,
      status: InvoiceStatus.SENT,
      subtotal: 700,
      vatRate: 20,
    },
  ];

  for (const inv of demoInvoices) {
    const client = clients[inv.clientIndex];
    if (!client) continue;

    const issueDate = getDateForMonthOffset(inv.monthOffset, 5);
    const dueDate = getDateForMonthOffset(inv.monthOffset, 20);

    const vatAmount = (inv.subtotal * inv.vatRate) / 100;
    const total = inv.subtotal + vatAmount;

    const sentAt =
      inv.status === InvoiceStatus.SENT ||
      inv.status === InvoiceStatus.PAID ||
      inv.status === InvoiceStatus.OVERDUE
        ? issueDate
        : null;

    const paidAt = inv.status === InvoiceStatus.PAID ? getDateForMonthOffset(inv.monthOffset, 10) : null;

    await prisma.invoice.create({
      data: {
        invoiceNumber: inv.number,
        clientId: client.id,
        userId: demoUser.id,
        issueDate,
        dueDate,
        status: inv.status,
        subtotal: inv.subtotal,
        vatAmount,
        vatRate: inv.vatRate,
        total,
        notes: 'Demo data for Milestone 3',
        sentAt,
        paidAt,
        invoiceItems: {
          create: [
            {
              description: 'Consulting services',
              quantity: 1,
              unitPrice: inv.subtotal,
              amount: inv.subtotal,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Demo invoices created for the last 6 months.');
  console.log('');
  console.log('📊 You can now:');
  console.log('   - Log in as demo@flowbiz.test / Password123!');
  console.log('   - Visit /dashboard to see metrics, chart, and activity');
  console.log('   - Visit /clients to see the client listing with search & filters');
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
