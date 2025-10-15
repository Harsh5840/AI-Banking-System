import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Re-export Prisma types
export { Role, Account, AccountType, User } from '@prisma/client';

// Re-export database functions from account module
export {
  createAccount,
  getUserAccounts,
  getAccountById,
  deleteAccount,
  updateAccountName,
} from './account';

// Re-export database functions from transaction module
export {
  addTransactionFromCore,
  reverseTransaction,
  getAllTransactions,
} from './transaction';

