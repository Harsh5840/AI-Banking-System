import { parseQuery } from "./nlp";
// import { prisma } from "../services/db"; // Integrate with your DB layer
import { ruleBasedScore } from "./rules";
import { mlRiskScore } from "./ml";
import { LedgerEntry } from "../core/types";

// --- 1. Handle natural language queries ---
export async function executeUserQuery(query: string, userId: string) {
  const parsed = parseQuery(query);

  if (!parsed || parsed.intent === "UNKNOWN") {
    return "Sorry, I couldn't understand your question.";
  }

  switch (parsed.intent) {
    case "TOTAL_SPENT":
      // return await getTotalSpent(userId, parsed.filters); // Integrate with analyticsService
      return "[getTotalSpent logic should be called here]";
    case "TOP_CATEGORIES":
      // return await getTopSpendingCategories(userId, parsed.filters, parsed.limit ?? 3); // Integrate with analyticsService
      return "[getTopSpendingCategories logic should be called here]";
    default:
      return "Sorry, I don't support that type of query yet.";
  }
}

// --- 4. Evaluate anomaly risk score ---
export async function evaluateAnomaly(entry: LedgerEntry) {
  const ruleScore = ruleBasedScore(entry);
  const mlScore = await mlRiskScore(entry);

  const totalScore = (ruleScore + mlScore) / 2;

  const riskLevel =
    totalScore >= 70 ? "high" :
    totalScore >= 40 ? "medium" :
    "low";

  return {
    ruleScore,
    mlScore,
    totalScore,
    riskLevel,
  };
}