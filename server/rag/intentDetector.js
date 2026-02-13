// server/rag/intentDetector.js - Adaptive RAG Intent Detection
const INTENT_RULES = [
  // Order-related intents
  {
    intent: "order_tracking",
    keywords: ["track", "order", "delivery", "shipped", "where is", "status", "my order"],
    confidence: 0.95,
  },
  {
    intent: "order_support",
    keywords: ["return", "refund", "cancel", "replace", "issue"],
    confidence: 0.9,
  },

  // Product exact match intents
  {
    intent: "product_exact",
    keywords: ["show me", "get", "buy", "purchase", "product name"],
    confidence: 0.85,
  },

  // Product comparison intents
  {
    intent: "product_comparison",
    keywords: ["compare", "which is better", "difference", "vs", "versus"],
    confidence: 0.9,
  },

  // Product recommendation intents
  {
    intent: "product_recommendation",
    keywords: ["recommend", "suggest", "best", "top", "popular"],
    confidence: 0.85,
  },

  // Product semantic search (features, specs)
  {
    intent: "product_semantic",
    keywords: ["features", "specs", "specifications", "price range", "budget"],
    confidence: 0.85,
  },

  // Account-related intents
  {
    intent: "user_account",
    keywords: ["account", "profile", "address", "update", "email", "phone"],
    confidence: 0.9,
  },
];

async function detectIntent(query) {
  const q = query.toLowerCase().trim();

  // Try rule-based matching first
  for (const rule of INTENT_RULES) {
    for (const kw of rule.keywords) {
      if (q.includes(kw)) {
        return { intent: rule.intent, confidence: rule.confidence, reason: `Matched keyword: ${kw}` };
      }
    }
  }

  // If query seems to ask about products (without specific intent)
  const productKeywords = ["product", "item", "thing", "gadget", "device", "laptop", "phone", "camera"];
  for (const kw of productKeywords) {
    if (q.includes(kw)) {
      return { intent: "product_semantic", confidence: 0.7, reason: "Product-related query" };
    }
  }

  return { intent: "general", confidence: 0.3, reason: "No specific intent matched" };
}

module.exports = { detectIntent };
