# AI & NLP Module Documentation

## Overview
This module provides AI-powered financial query parsing and fraud detection capabilities for the LedgerX banking system.

## 🤖 AI Implementation Status

### ✅ **Implemented Features**

#### 1. **Google Gemini AI Query Parser** (`langchainParser.ts`)
- **Status**: ✅ Fully implemented and ready to use
- **API**: Google Gemini Pro via LangChain
- **Purpose**: Parse natural language queries into structured financial data
- **Fallback**: Rule-based parser if AI fails

**Example Usage:**
```typescript
import { parseQueryWithLLM } from './ai/langchainParser';

// Parse user question
const result = await parseQueryWithLLM("How much did I spend on food last month?");

console.log(result);
// Output:
// {
//   intent: "TOTAL_SPENT",
//   filters: { category: "food", month: 9, year: 2025 },
//   limit: 10
// }
```

**Supported Intents:**
- `TOTAL_SPENT` - Calculate total amount spent
- `TOP_CATEGORIES` - Get top spending categories
- `TRANSACTION_LIST` - List transactions
- `ACCOUNT_BALANCE` - Get account balance
- `UNKNOWN` - Cannot determine intent

**Supported Filters:**
- `category`: food, transport, shopping, entertainment, utilities, healthcare, education, travel, fitness, others
- `month`: 0-11 (January = 0, December = 11)
- `year`: e.g., 2025
- `minAmount`, `maxAmount`: transaction amount range
- `timeframe`: today, this week, this month, last month, this year

#### 2. **Rule-Based NLP Parser** (`nlp.ts`)
- **Status**: ✅ Working
- **Purpose**: Fast, free pattern matching for simple queries
- **Use Case**: Fallback when AI is unavailable

#### 3. **Rule-Based Fraud Detection** (`rules.ts`)
- **Status**: ✅ Working
- **Purpose**: Pattern matching for suspicious transactions
- **Checks**: Amount thresholds, timing, frequency

#### 4. **Category Classification** (`fraud.ts`)
- **Status**: ✅ Working
- **Purpose**: Auto-categorize transactions by description
- **Method**: Keyword matching

### ⚠️ **Partially Implemented**

#### 5. **ML Risk Scoring** (`ml.ts`)
- **Status**: ⚠️ Placeholder only
- **Purpose**: Machine learning-based fraud detection
- **TODO**: Implement actual ML model

#### 6. **AI Model Logic** (`model.ts`)
- **Status**: ⚠️ Empty placeholder
- **Purpose**: Custom ML model implementations

---

## 🔧 Configuration

### Environment Variables Required:

```bash
# Required for Google Gemini AI
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Optional: OpenAI (not currently used)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional: HuggingFace (not currently used)
HUGGINGFACE_API_TOKEN=your_huggingface_token_here
```

---

## 📊 AI API Comparison

| Feature | Google Gemini | OpenAI GPT-4 | HuggingFace |
|---------|--------------|--------------|-------------|
| **Status** | ✅ Configured | ⚠️ Placeholder | ⚠️ Placeholder |
| **Cost** | Free tier | ~$0.03/1K tokens | Free |
| **Speed** | Fast | Medium | Fastest |
| **Accuracy** | High | Very High | Medium |
| **Privacy** | Cloud | Cloud | Self-hosted |
| **Best For** | NLP parsing | Complex analysis | Custom models |

---

## 🚀 Usage Examples

### Example 1: Parse Simple Query
```typescript
import { parseQueryWithLLM } from './ai/langchainParser';

const result = await parseQueryWithLLM("Show me my top 5 expenses this month");
// {
//   intent: "TOP_CATEGORIES",
//   filters: { month: 9, year: 2025 },
//   limit: 5
// }
```

### Example 2: Complex Time-Based Query
```typescript
const result = await parseQueryWithLLM("How much did I spend on restaurants in September?");
// {
//   intent: "TOTAL_SPENT",
//   filters: { category: "food", month: 8, year: 2025 },
//   limit: 10
// }
```

### Example 3: Fallback to Rule-Based
```typescript
// If Google API key is invalid or AI fails, automatically falls back to rule-based parser
const result = await parseQueryWithLLM("transactions from last week");
// Uses fallback parser internally
```

### Example 4: Fraud Detection
```typescript
import { mlRiskScore, classifyRisk } from './ai/fraud';

const riskScore = mlRiskScore({
  amount: 50000,
  category: "shopping",
  timestamp: new Date(),
  userId: "user123"
});

const riskLevel = classifyRisk(riskScore);
console.log(riskLevel); // "high", "medium", or "low"
```

### Example 5: Category Classification
```typescript
import { classifyCategory } from './ai/fraud';

const category = classifyCategory("AMZN*MARKETPLACE US", 149.99);
console.log(category); // "shopping"

const category2 = classifyCategory("Starbucks Coffee", 5.50);
console.log(category2); // "food"
```

---

## 🔍 Testing

### Test the Google Gemini Parser:
```bash
cd backend
npx tsx src/ai/test-langchain.ts
```

### Expected Output:
```
✅ AI Parser Test Passed!
Query: "How much did I spend on food last month?"
Result: {
  intent: "TOTAL_SPENT",
  filters: { category: "food", month: 9, year: 2025 },
  limit: 10
}
```

---

## 🛠️ Troubleshooting

### Issue: "Google API key not configured"
**Solution**: Check that `GOOGLE_API_KEY` is set in `.env` file and is valid.

### Issue: AI returns "UNKNOWN" intent
**Solution**: The query might be too complex or ambiguous. Try rephrasing or the fallback parser will handle it.

### Issue: Slow response times
**Solution**: 
1. Check internet connection
2. Consider caching common queries
3. Use rule-based parser for simple queries

### Issue: API rate limit exceeded
**Solution**: 
1. Google Gemini free tier: 15 requests/minute
2. Implement request throttling
3. Cache results for common queries

---

## 📈 Future Improvements

### Short-term (Next Sprint):
- [ ] Add caching for common queries (Redis)
- [ ] Implement request rate limiting
- [ ] Add more test cases
- [ ] Monitor AI response accuracy

### Medium-term (1-2 months):
- [ ] Implement OpenAI GPT-4 for advanced fraud detection
- [ ] Add sentiment analysis for transaction descriptions
- [ ] Build ML model for personalized spending insights
- [ ] Create AI-powered financial advisor chatbot

### Long-term (3+ months):
- [ ] Fine-tune custom model on financial data
- [ ] Implement anomaly detection with unsupervised learning
- [ ] Add multi-language support
- [ ] Build predictive budgeting AI

---

## 🔐 Security Considerations

1. **API Key Protection**: Never commit API keys to git
2. **Rate Limiting**: Implement to prevent abuse
3. **Input Validation**: Sanitize user queries before sending to AI
4. **Error Handling**: Don't expose AI errors to end users
5. **Data Privacy**: Don't send sensitive financial data to AI (only query text)

---

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [HuggingFace Models](https://huggingface.co/models)

---

## 💡 Tips for Best Results

1. **Use specific queries**: "food expenses in September" vs "my spending"
2. **Include timeframes**: "last month", "this year", "in 2025"
3. **Be explicit about limits**: "top 5 categories" vs "top categories"
4. **Use standard category names**: food, transport, shopping (not "groceries", "uber rides")

---

## 📞 Support

For AI module issues or questions:
1. Check this README first
2. Review `langchainParser.ts` comments
3. Test with simple queries to isolate the problem
4. Check Google API key validity

---

**Last Updated**: October 20, 2025
**Module Status**: ✅ Production Ready (Google Gemini Parser)
