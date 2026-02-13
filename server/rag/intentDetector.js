// server/rag/intentDetector.js - Adaptive RAG Intent Detection
const INTENT_RULES = [
  // Order-related intents (must be checked BEFORE product intents due to keyword overlap)
  {
    intent: "order_tracking",
    keywords: ["track", "order", "delivery", "shipped", "where is", "status", "my order"],
    confidence: 0.95,
  },
  {
    intent: "order_support",
    keywords: ["return order", "refund order", "cancel order", "replace order", "issue with order", "order issue"],
    confidence: 0.9,
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

  // Product exact match intents
  {
    intent: "product_exact",
    keywords: ["show me", "get", "buy", "purchase", "product name"],
    confidence: 0.85,
  },

  // Product semantic search (features, specs) - BROAD MATCHING
  {
    intent: "product_semantic",
    keywords: ["features", "specs", "specifications", "price range", "budget", "with", "and", "display", "battery", "processor", "ram", "storage", "gpu", "camera", "refresh", "charge", "weight", "latency"],
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

  // Product-related keywords - check first to avoid false matches on "order_support" etc
  const productKeywords = ["laptop", "phone", "smartphone", "tv", "television", "earbuds", "headphones", "watch", "smartwatch", "charger", "mouse", "keyboard", "speaker", "monitor", "accessory", "wearable", "device", "gadget"];
  const isProductQuery = productKeywords.some(kw => q.includes(kw));

  // Try rule-based matching, but prioritize product semantic if it looks like a product spec query
  if (isProductQuery && (q.includes("with ") || q.includes(" and ") || q.includes("dpi") || q.includes("hz") || q.includes("w+") || q.includes("%") || q.includes("day"))) {
    return { intent: "product_semantic", confidence: 0.9, reason: "Product specification query detected" };
  }

  for (const rule of INTENT_RULES) {
    for (const kw of rule.keywords) {
      if (q.includes(kw)) {
        // Skip order_support matches if this is a product query
        if (rule.intent === "order_support" && isProductQuery) {
          continue;
        }
        return { intent: rule.intent, confidence: rule.confidence, reason: `Matched keyword: ${kw}` };
      }
    }
  }

  // If query seems to ask about products (without specific intent)
  if (isProductQuery) {
    return { intent: "product_semantic", confidence: 0.7, reason: "Product-related query" };
  }

  return { intent: "general", confidence: 0.3, reason: "No specific intent matched" };
}

module.exports = { detectIntent };
