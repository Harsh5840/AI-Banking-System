import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for B2B SaaS Demo...');

  // Create Demo Organization
  const org = await prisma.organization.create({
    data: {
      name: 'TechCorp Inc.',
      taxId: 'TC-2025-001',
    },
  });
  console.log(`✅ Created Organization: ${org.name}`);

  // Create Departments with Budgets
  const engineering = await prisma.department.create({
    data: {
      name: 'Engineering',
      budgetLimit: 50000, // $50,000/month
      organizationId: org.id,
    },
  });
  console.log(`✅ Created Department: ${engineering.name} (Budget: $${engineering.budgetLimit})`);

  const sales = await prisma.department.create({
    data: {
      name: 'Sales & Marketing',
      budgetLimit: 25000, // $25,000/month
      organizationId: org.id,
    },
  });
  console.log(`✅ Created Department: ${sales.name} (Budget: $${sales.budgetLimit})`);

  // Create sample users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@techcorp.com',
      name: 'Alice Johnson',
      password: '$2b$10$dummyhash', // Replace with actual bcrypt hash in production
      role: 'EMPLOYEE',
      organizationId: org.id,
      departmentId: engineering.id,
    },
  });
  console.log(`✅ Created User: ${alice.name} (${engineering.name})`);

  const bob = await prisma.user.create({
    data: {
      email: 'bob@techcorp.com',
      name: 'Bob Smith',
      password: '$2b$10$dummyhash',
      role: 'EMPLOYEE',
      organizationId: org.id,
      departmentId: sales.id,
    },
  });
  console.log(`✅ Created User: ${bob.name} (${sales.name})`);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@techcorp.com',
      name: 'Carol Admin',
      password: '$2b$10$dummyhash',
      role: 'ORG_ADMIN',
      organizationId: org.id,
      // Admins may not belong to a department
    },
  });
  console.log(`✅ Created Admin: ${admin.name}`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Organization: ${org.name}`);
  console.log(`- Departments: 2 (Engineering: $50k, Sales: $25k)`);
  console.log(`- Users: 3 (2 employees, 1 admin)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
