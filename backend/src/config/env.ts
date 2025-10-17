import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

export const JWT_SECRET = process.env.JWT_SECRET;

// System accounts for income/expense transactions
export const SYSTEM_INCOME_ACCOUNT_ID = process.env.SYSTEM_INCOME_ACCOUNT_ID || "";
export const SYSTEM_EXPENSE_ACCOUNT_ID = process.env.SYSTEM_EXPENSE_ACCOUNT_ID || "";

// Warn if system accounts are not configured
if (!SYSTEM_INCOME_ACCOUNT_ID || !SYSTEM_EXPENSE_ACCOUNT_ID) {
  console.warn("⚠️  System accounts not configured. Run: npx tsx src/scripts/setupSystemAccounts.ts");
}