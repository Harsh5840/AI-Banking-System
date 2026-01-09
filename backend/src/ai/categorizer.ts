/**
 * Enhanced category classification
 * Uses rule-based logic to classify transactions into categories based on description keywords.
 */
export function classifyCategory(description?: string, amount?: number): string {
  if (!description) return 'others';
  
  const desc = description.toLowerCase().trim();
  
  // Travel
  if (
    desc.includes('hotel') ||
    desc.includes('airbnb') ||
    desc.includes('flight') ||
    desc.includes('travel') ||
    desc.includes('vacation') ||
    desc.includes('trip') ||
    desc.includes('airline')
  ) {
    return 'travel';
  }
  
  // Entertainment
  if (
    desc.includes('netflix') || 
    desc.includes('spotify') || 
    desc.includes('prime video') ||
    desc.includes('disney') ||
    desc.includes('hulu') ||
    desc.includes('youtube') ||
    desc.includes('entertainment') || 
    desc.includes('movie') || 
    desc.includes('cinema') ||
    desc.includes('theater') ||
    desc.includes('steam') ||
    desc.includes('playstation') ||
    desc.includes('xbox') ||
    desc.includes('game')
  ) {
    return 'entertainment';
  }
  
  // Food & Dining
  if (
    desc.includes('food') || 
    desc.includes('restaurant') || 
    desc.includes('cafe') ||
    desc.includes('coffee') ||
    desc.includes('pizza') ||
    desc.includes('burger') ||
    desc.includes('nav') || // generic food
    desc.includes('kitchen') ||
    desc.includes('grocery') ||
    desc.includes('market') ||
    desc.includes('delivery') ||
    desc.includes('uber eats') ||
    desc.includes('doordash') ||
    desc.includes('grubhub')
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
    desc.includes('parking') ||
    desc.includes('metro') ||
    desc.includes('bus') ||
    desc.includes('train')
  ) {
    return 'transport';
  }
  
  // Shopping
  if (
    desc.includes('shop') || 
    desc.includes('store') || 
    desc.includes('amazon') ||
    desc.includes('ebay') ||
    desc.includes('walmart') ||
    desc.includes('target') ||
    desc.includes('mall') ||
    desc.includes('clothing') ||
    desc.includes('shoe') ||
    desc.includes('electronic')
  ) {
    return 'shopping';
  }
  
  // Utilities
  if (
    desc.includes('utility') || 
    desc.includes('electric') || 
    desc.includes('water') || 
    desc.includes('internet') ||
    desc.includes('wifi') ||
    desc.includes('mobile') ||
    desc.includes('bill') ||
    desc.includes('rent') ||
    desc.includes('mortgage')
  ) {
    return 'utilities';
  }
  
  // Healthcare
  if (
    desc.includes('health') || 
    desc.includes('medical') || 
    desc.includes('hospital') || 
    desc.includes('doctor') ||
    desc.includes('pharmacy') ||
    desc.includes('drug') ||
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
    desc.includes('learning')
  ) {
    return 'education';
  }
  
  // Salary / Income
  if (
    desc.includes('salary') ||
    desc.includes('payroll') ||
    desc.includes('wages') ||
    desc.includes('deposit') ||
    desc.includes('dividend')
  ) {
    return 'income';
  }
  
  return 'others';
}
