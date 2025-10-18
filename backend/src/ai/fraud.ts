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
 * Enhanced category classification
 * Uses rule-based logic to classify transactions into categories
 */
export function classifyCategory(description?: string, amount?: number): string {
  if (!description) return 'others';
  
  const desc = description.toLowerCase().trim();
  
  // Travel (check before education to avoid "book" collision)
  if (
    desc.includes('hotel') ||
    desc.includes('airbnb') ||
    desc.includes('flight booking') ||
    desc.includes('travel') ||
    desc.includes('vacation') ||
    desc.includes('trip')
  ) {
    return 'travel';
  }
  
  // Entertainment & Streaming Services
  if (
    desc.includes('netflix') || 
    desc.includes('spotify') || 
    desc.includes('prime video') ||
    desc.includes('disney') ||
    desc.includes('hulu') ||
    desc.includes('youtube premium') ||
    desc.includes('apple music') ||
    desc.includes('entertainment') || 
    desc.includes('movie') || 
    desc.includes('cinema') ||
    desc.includes('theater') ||
    desc.includes('concert') ||
    desc.includes('game') ||
    desc.includes('gaming') ||
    desc.includes('playstation') ||
    desc.includes('xbox') ||
    desc.includes('steam')
  ) {
    return 'entertainment';
  }
  
  // Food & Dining (check after shopping to avoid conflicts)
  if (
    desc.includes('food') || 
    desc.includes('restaurant') || 
    desc.includes('cafe') ||
    desc.includes('coffee') ||
    desc.includes('pizza') ||
    desc.includes('burger') ||
    desc.includes('starbucks') ||
    desc.includes('mcdonald') ||
    desc.includes('kfc') ||
    desc.includes('domino') ||
    desc.includes('grocery') ||
    desc.includes('supermarket')
  ) {
    return 'food';
  }
  
  // Transportation
  if (
    desc.includes('transport') || 
    desc.includes('uber') || 
    desc.includes('lyft') ||
    desc.includes('taxi') || 
    desc.includes('gas') ||
    desc.includes('fuel') ||
    desc.includes('petrol') ||
    desc.includes('parking') ||
    desc.includes('metro') ||
    desc.includes('bus') ||
    desc.includes('train') ||
    desc.includes('flight') ||
    desc.includes('airline')
  ) {
    return 'transport';
  }
  
  // Shopping & Retail
  if (
    desc.includes('shop') || 
    desc.includes('store') || 
    desc.includes('amazon') ||
    desc.includes('ebay') ||
    desc.includes('walmart') ||
    desc.includes('target') ||
    desc.includes('mall') ||
    desc.includes('clothing') ||
    desc.includes('fashion') ||
    desc.includes('shoes') ||
    desc.includes('electronics')
  ) {
    return 'shopping';
  }
  
  // Utilities & Bills
  if (
    desc.includes('utility') || 
    desc.includes('electric') || 
    desc.includes('water') || 
    desc.includes('internet') ||
    desc.includes('wifi') ||
    desc.includes('phone bill') ||
    desc.includes('mobile') ||
    desc.includes('broadband') ||
    desc.includes('gas bill') ||
    desc.includes('rent') ||
    desc.includes('mortgage')
  ) {
    return 'utilities';
  }
  
  // Healthcare & Medical
  if (
    desc.includes('health') || 
    desc.includes('medical') || 
    desc.includes('hospital') || 
    desc.includes('doctor') ||
    desc.includes('pharmacy') ||
    desc.includes('medicine') ||
    desc.includes('clinic') ||
    desc.includes('dental') ||
    desc.includes('insurance')
  ) {
    return 'healthcare';
  }
  
  // Education
  if (
    desc.includes('education') || 
    desc.includes('school') || 
    desc.includes('course') ||
    desc.includes('tuition') ||
    desc.includes('college') ||
    desc.includes('university') ||
    desc.includes('book') ||
    desc.includes('udemy') ||
    desc.includes('coursera')
  ) {
    return 'education';
  }
  
  // Fitness & Wellness
  if (
    desc.includes('gym') ||
    desc.includes('fitness') ||
    desc.includes('yoga') ||
    desc.includes('sports') ||
    desc.includes('wellness')
  ) {
    return 'fitness';
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
