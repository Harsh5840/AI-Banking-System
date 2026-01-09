import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for B2B SaaS Demo...');

  // Create Demo Organization
  const org = await prisma.organization.upsert({
    where: { taxId: 'TC-2025-001' },
    update: {},
    create: {
      name: 'TechCorp Inc.',
      taxId: 'TC-2025-001',
    },
  });
  console.log(`✅ Organization: ${org.name}`);

  // Create Departments with Budgets
  // Note: Department names are not unique in schema, so we check first.
  let engineering = await prisma.department.findFirst({
    where: { name: 'Engineering', organizationId: org.id }
  });

  if (!engineering) {
    engineering = await prisma.department.create({
      data: {
        name: 'Engineering',
        budgetLimit: 50000,
        organizationId: org.id,
      },
    });
  } else {
     await prisma.department.update({
        where: { id: engineering.id },
        data: { budgetLimit: 50000 }
     });
  }
  console.log(`✅ Department: ${engineering.name}`);

  let sales = await prisma.department.findFirst({
    where: { name: 'Sales & Marketing', organizationId: org.id }
  });

  if (!sales) {
    sales = await prisma.department.create({
      data: {
        name: 'Sales & Marketing',
        budgetLimit: 30000,
        organizationId: org.id,
      },
    });
  } else {
     await prisma.department.update({
        where: { id: sales.id },
        data: { budgetLimit: 30000 }
     });
  }
  console.log(`✅ Department: ${sales.name}`);

  // Create Users
  // 1. Employee (John)
  const john = await prisma.user.upsert({
    where: { email: 'john.doe@techcorp.com' },
    update: {
        departmentId: engineering.id,
        organizationId: org.id,
        role: 'EMPLOYEE'
    },
    create: {
      name: 'John Doe',
      email: 'john.doe@techcorp.com',
      password: '$argon2id$v=19$m=65536,t=3,p=4$passwordhashPlaceholder$randomsalt', // Placeholder
      role: 'EMPLOYEE',
      organizationId: org.id,
      departmentId: engineering.id,
    },
  });
  console.log(`✅ User: ${john.name} (Employee)`);

  // 2. Finance Manager (Alice)
  const alice = await prisma.user.upsert({
    where: { email: 'alice.finance@techcorp.com' },
    update: {
        departmentId: sales.id,
        organizationId: org.id,
        role: 'FINANCE_MANAGER'
    },
    create: {
      name: 'Alice Finance',
      email: 'alice.finance@techcorp.com', // Fixed email
      password: '$argon2id$v=19$m=65536,t=3,p=4$passwordhashPlaceholder$randomsalt',
      role: 'FINANCE_MANAGER',
      organizationId: org.id,
      departmentId: sales.id,
    },
  });
  console.log(`✅ User: ${alice.name} (Finance Manager)`);

  // 3. Org Admin (Bob)
  const bob = await prisma.user.upsert({
    where: { email: 'bob.admin@techcorp.com' },
    update: {
        organizationId: org.id,
        role: 'ORG_ADMIN'
    },
    create: {
      name: 'Bob Admin',
      email: 'bob.admin@techcorp.com',
      password: '$argon2id$v=19$m=65536,t=3,p=4$passwordhashPlaceholder$randomsalt',
      role: 'ORG_ADMIN',
      organizationId: org.id,
    },
  });
  console.log(`✅ User: ${bob.name} (Org Admin)`);

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
