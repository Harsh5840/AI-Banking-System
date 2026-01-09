import { LedgerEntry } from "../core/types";
import { amountAnomalyDetector } from "./model";

export const HIGH_AMOUNT_THRESHOLD = 50000; // Adjusted for Z-Score usage
export const CATEGORY_PENALTY = 20;
export const TIME_PENALTY = 15;

export async function mlRiskScore(entry: LedgerEntry): Promise<number> {
  // Simulate heavy computation or DB fetch
  await new Promise((resolve) => setTimeout(resolve, 50)); 

  let score = 0;

  // 1. Z-Score Anomaly Detection (Statistical)
  const zScore = amountAnomalyDetector.getZScore(entry.amount);
  const isStatisticalAnomaly = Math.abs(zScore) > 3; // > 3 Sigma
  
  if (isStatisticalAnomaly) {
      score += 50 + (Math.abs(zScore) * 10); // Base 50 + scale by severity
  }

  // Update the model online (optional, maybe only update on non-fraud)
  // amountAnomalyDetector.update(entry.amount); 

  // 2. Rule-Based Checks (Supplementary)
  if (entry.amount > HIGH_AMOUNT_THRESHOLD) score += 30;

  if (!entry.category || entry.category === "others") score += CATEGORY_PENALTY;

  const hour = new Date(entry.timestamp).getHours();
  if (hour < 5 || hour > 23) score += TIME_PENALTY; // Late night transactions

  return Math.min(score, 100); // Cap at 100
}

export function classifyRisk(score: number): "low" | "medium" | "high" {
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  return "low";
}