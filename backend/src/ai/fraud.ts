/**
 * Fraud detection module - consolidates AI/ML risk scoring and analysis functions
 * Re-exports functions from ml.ts, rules.ts, nlp.ts, and langchainParser.ts
 */

import { LedgerEntry } from '../core/types';

// ML-based risk scoring
export { mlRiskScore, classifyRisk } from './ml';

// Rule-based risk scoring
export { ruleBasedScore, classifyRuleRisk } from './rules';

// NLP query parsing
export { parseQuery } from './nlp';

// LangChain-based query parsing
export { parseQueryWithLLM, parseQueryWithLangChain } from './langchainParser';

// Anomaly evaluation from executor
export { evaluateAnomaly, executeUserQuery } from './executor';

/**
 * Placeholder for category classification
 * This can be enhanced with actual ML model or rule-based logic
 */
export function classifyCategory(description?: string, amount?: number): string {
  if (!description) return 'others';
  
  const desc = description.toLowerCase();
  
  // Simple rule-based classification
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('grocery')) {
    return 'food';
  }
  if (desc.includes('transport') || desc.includes('uber') || desc.includes('taxi') || desc.includes('gas')) {
    return 'transport';
  }
  if (desc.includes('shop') || desc.includes('store') || desc.includes('amazon')) {
    return 'shopping';
  }
  if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('game')) {
    return 'entertainment';
  }
  if (desc.includes('utility') || desc.includes('electric') || desc.includes('water') || desc.includes('internet')) {
    return 'utilities';
  }
  if (desc.includes('health') || desc.includes('medical') || desc.includes('hospital') || desc.includes('doctor')) {
    return 'healthcare';
  }
  if (desc.includes('education') || desc.includes('school') || desc.includes('course')) {
    return 'education';
  }
  
  return 'others';
}

/**
 * Placeholder for total spent calculation
 * This should be implemented based on actual business logic
 */
export async function getTotalSpent(filters: any): Promise<number> {
  // This is a placeholder - actual implementation should be in analyticsService
  return 0;
}

/**
 * Placeholder for top spending categories
 * This should be implemented based on actual business logic
 */
export async function getTopSpendingCategories(filters: any, limit: number = 3): Promise<any[]> {
  // This is a placeholder - actual implementation should be in analyticsService
  return [];
}
