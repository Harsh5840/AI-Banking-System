import { LedgerEntry } from "../core/types";

export const HIGH_AMOUNT_THRESHOLD = 100000;
export const CATEGORY_PENALTY = 20;
export const TIME_PENALTY = 15;

export async function mlRiskScore(entry: LedgerEntry): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  let score = 0;
  if (entry.amount > HIGH_AMOUNT_THRESHOLD) score += 50;
  if (!entry.category || entry.category === "others") score += CATEGORY_PENALTY;
  const hour = new Date(entry.timestamp).getHours();
  if (hour < 6 || hour > 22) score += TIME_PENALTY;
  return score;
}

export function classifyRisk(score: number): "low" | "medium" | "high" {
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}