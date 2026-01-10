import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { redis } from "../lib/redis"; // Using existing redis client

// --- Interfaces ---
export interface NLPQuery {
  intent: "TOTAL_SPENT" | "TOP_CATEGORIES" | "UNKNOWN";
  filters: {
    category?: string;
    month?: number;
    year?: number;
    department?: string; // Added for B2B robustness
  };
  limit?: number;
}

// --- Rule-Based Fallback (from nlp.ts) ---
function parseMonth(monthStr: string): number | undefined {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const index = months.findIndex(m => m.startsWith(monthStr.toLowerCase()));
  return index >= 0 ? index : undefined;
}

function parseRuleBased(question: string): NLPQuery {
  const lower = question.toLowerCase();
  const now = new Date();
  
  // "How much did I spend on [category] in [month]?"
  if (lower.includes("how much") && lower.includes("spend")) {
    const categoryMatch = lower.match(/on ([\w\s]+)/);
    const monthMatch = lower.match(/in (\w+)/);
    const rawCategory = categoryMatch?.[1]?.trim();
    const monthName = monthMatch?.[1];
    
    const filters: NLPQuery["filters"] = {
      month: monthName ? parseMonth(monthName) : now.getMonth(),
      year: now.getFullYear(),
    };
    
    if (rawCategory) filters.category = rawCategory.toLowerCase();
    
    if (lower.includes("last month")) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filters.month = lastMonth.getMonth();
      filters.year = lastMonth.getFullYear();
    }

    return { intent: "TOTAL_SPENT", filters };
  }
  
  // "What are my top expenses?"
  if (lower.includes("top") && lower.includes("expense")) {
    const limitMatch = lower.match(/top (\d+)/);
    return {
      intent: "TOP_CATEGORIES",
      filters: { month: now.getMonth(), year: now.getFullYear() },
      limit: limitMatch ? parseInt(limitMatch[1]) : 3,
    };
  }

  return { intent: "UNKNOWN", filters: {} };
}

// --- LLM Parser (from langchainParser.ts) ---
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  intent: "The intent of the query: 'TOTAL_SPENT' or 'TOP_CATEGORIES'.",
  category: "The expense category found in the query, or null if none.",
  month: "The numeric month (0-11) extracted from the query, or current month if 'this month', or previous if 'last month'.", 
  year: "The full year (e.g., 2025).",
  limit: "The number of items to return (for TOP_CATEGORIES), default 3."
});

const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  template: `
    You are a financial assistant. Analyze the user's query and extract structured data.
    Query: "{question}"
    Current Date: {currentDate}
    
    {format_instructions}
    
    If the users asks about spending, assume 'TOTAL_SPENT'.
    If the users asks for top expenses/categories, assume 'TOP_CATEGORIES'.
    If unclear, return intent 'UNKNOWN'.
  `,
  inputVariables: ["question", "currentDate"],
  partialVariables: { format_instructions: formatInstructions },
});

export async function parseQuery(question: string): Promise<NLPQuery> {
  // 1. Check Cache (Redis)
  const cacheKey = `ai:query:${question.toLowerCase().trim()}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
        console.log("⚡ AI Cache Hit");
        return JSON.parse(cached);
    }
  } catch (err) {
    // Redis failed, proceed without cache
    console.warn("Redis unavailable for AI cache, skipping.");
  }

  // 2. Try Rule-Based (Fastest & Free)
  const ruleResult = parseRuleBased(question);
  if (ruleResult.intent !== "UNKNOWN") {
      return ruleResult;
  }

  // 3. Fallback to LLM (Gemini)
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("⚠️ No GOOGLE_API_KEY found. Returning UNKNOWN intent.");
    return { intent: "UNKNOWN", filters: {} };
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-pro",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const input = await prompt.format({
      question,
      currentDate: new Date().toISOString(),
    });

    const response = await model.invoke(input);
    const content = response.content.toString();
    const parsed = await parser.parse(content);

    const result: NLPQuery = {
      intent: parsed.intent as any,
      filters: {
        category: parsed.category ? parsed.category.toLowerCase() : undefined,
        month: parsed.month !== null ? Number(parsed.month) : undefined,
        year: parsed.year !== null ? Number(parsed.year) : undefined,
      },
      limit: parsed.limit ? Number(parsed.limit) : undefined,
    };

    // Cache successful LLM result (1 hour)
    try {
        await redis.setex(cacheKey, 3600, JSON.stringify(result));
    } catch (e) { /* ignore redis error */ }

    return result;

  } catch (error) {
    console.error("❌ LLM Parsing Failed:", error);
    return { intent: "UNKNOWN", filters: {} };
  }
}

// --- Executor Logic (Mock Implementation) ---
export async function executeUserQuery(query: string, userId: string) {
    const parsed = await parseQuery(query);
  
    if (parsed.intent === "UNKNOWN") {
      return "Sorry, I couldn't understand your question.";
    }
  
    // Placeholder logic - this would call Analytics Service
    switch (parsed.intent) {
      case "TOTAL_SPENT":
        return `You spent $XXX on ${parsed.filters.category || 'everything'} in ${parsed.filters.month ?? 'this month'}. (Mock)`;
      case "TOP_CATEGORIES":
        return `Your top ${parsed.limit ?? 3} categories are: Food, Utilities, Transport. (Mock)`;
      default:
        return "I can't answer that yet.";
    }
}
