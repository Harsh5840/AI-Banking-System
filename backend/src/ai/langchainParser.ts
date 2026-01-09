// This file uses LangChain with Google Gemini API for intelligent query parsing
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { redis } from "../lib/redis"; // Import Redis

dotenv.config();

interface NLPResult {
  intent: string;
  filters: any;
  limit?: number;
}

const RATE_LIMIT_WINDOW = 60; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const CACHE_TTL = 3600; // 1 hour

/**
 * Rate Limiter using Redis
 * @returns true if allowed, false if limit exceeded
 */
async function checkRateLimit(userId: string = 'global'): Promise<boolean> {
  const key = `ai_ratelimit:${userId}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }
  return current <= RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Parse user query using Google Gemini AI via LangChain
 * Falls back to basic parsing if AI fails or rate limit exceeded
 */
export async function parseQueryWithLangChain(question: string, userId: string = 'anon'): Promise<NLPResult> {
  try {
    // 1. Check Rate Limit
    const isAllowed = await checkRateLimit(userId);
    if (!isAllowed) {
      console.warn(`⚠️ Rate limit exceeded for user ${userId}. Using fallback parser.`);
      return fallbackParser(question);
    }

    // 2. Check Cache
    const normalizedQuestion = question.trim().toLowerCase();
    const cacheKey = `ai_query_cache:${Buffer.from(normalizedQuestion).toString('base64')}`;
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      console.log('⚡ Using cached AI response');
      return JSON.parse(cachedResult);
    }

    // Check if Google API key is configured
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      console.warn('⚠️  Google API key not configured. Using fallback parser.');
      return fallbackParser(question);
    }

    // Initialize Google Gemini model
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-pro",
      temperature: 0.1, // Low temperature for consistent, deterministic parsing
      maxRetries: 2,
    });

    // Create structured prompt for financial query parsing
    const prompt = PromptTemplate.fromTemplate(`
You are a financial transaction query parser for a banking system. Parse the user's natural language question into structured JSON.

User Question: "{question}"

Instructions:
1. Identify the intent from these options:
   - TOTAL_SPENT: User wants to know total amount spent
   - TOP_CATEGORIES: User wants top spending categories
   - TRANSACTION_LIST: User wants to see transactions
   - ACCOUNT_BALANCE: User wants account balance
   - UNKNOWN: Cannot determine intent

2. Extract filters:
   - category: (food, transport, shopping, entertainment, utilities, healthcare, education, travel, fitness, others)
   - month: (0-11, where 0=January, 11=December)
   - year: (e.g., 2025)
   - minAmount: minimum transaction amount
   - maxAmount: maximum transaction amount
   - timeframe: (today, this week, this month, last month, this year)

3. Extract limit: number of results to return (default: 10)

Current date context: October 2025

Respond ONLY with valid JSON in this exact format:
{{
  "intent": "TOTAL_SPENT",
  "filters": {{
    "category": "food",
    "month": 9,
    "year": 2025
  }},
  "limit": 10
}}

Do not include any explanation, only the JSON object.
`);

    const formattedPrompt = await prompt.format({ question });
    const response = await model.invoke(formattedPrompt);

    // Parse AI response
    const content = response.content as string;
    
    // Extract JSON from response (in case AI adds extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed: NLPResult = JSON.parse(jsonMatch[0]);

    const finalResult = {
      intent: parsed.intent || "UNKNOWN",
      filters: parsed.filters || {},
      limit: parsed.limit || 10,
    };

    // 3. Cache Success Result
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(finalResult));

    return finalResult;

  } catch (error) {
    console.error('❌ Error parsing query with Google Gemini AI:', error);
    console.log('🔄 Falling back to rule-based parser...');
    return fallbackParser(question);
  }
}

/**
 * Fallback parser using simple pattern matching
 * Used when AI is unavailable or fails
 */
function fallbackParser(question: string): NLPResult {
  const lower = question.toLowerCase();
  const now = new Date();

  // Detect intent
  let intent = "UNKNOWN";
  if (lower.includes("how much") || lower.includes("total") || lower.includes("spent")) {
    intent = "TOTAL_SPENT";
  } else if (lower.includes("top") && (lower.includes("categor") || lower.includes("expense"))) {
    intent = "TOP_CATEGORIES";
  } else if (lower.includes("transaction") || lower.includes("list") || lower.includes("show")) {
    intent = "TRANSACTION_LIST";
  } else if (lower.includes("balance")) {
    intent = "ACCOUNT_BALANCE";
  }

  // Extract filters
  const filters: any = {};

  // Category detection
  const categories = ["food", "transport", "shopping", "entertainment", "utilities", "healthcare", "education", "travel", "fitness"];
  for (const cat of categories) {
    if (lower.includes(cat)) {
      filters.category = cat;
      break;
    }
  }

  // Time detection
  if (lower.includes("last month")) {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    filters.month = lastMonth.getMonth();
    filters.year = lastMonth.getFullYear();
  } else if (lower.includes("this month")) {
    filters.month = now.getMonth();
    filters.year = now.getFullYear();
  } else if (lower.includes("this year")) {
    filters.year = now.getFullYear();
  }

  // Extract limit
  const limitMatch = lower.match(/top (\d+)|(\d+) (transaction|result)/);
  const limit = limitMatch ? parseInt(limitMatch[1] || limitMatch[2]) : 10;

  return { intent, filters, limit };
}

/**
 * Alias for parseQueryWithLangChain
 */
export async function parseQueryWithLLM(question: string): Promise<NLPResult> {
  return parseQueryWithLangChain(question);
}