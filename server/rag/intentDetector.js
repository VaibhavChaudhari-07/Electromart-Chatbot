// server/rag/intentDetector.js
const RULES = [
  { intent: "order_status", keywords: ["track", "order", "delivery", "shipped"] },
  { intent: "product_search", keywords: ["show", "find", "search", "recommend"] },
  { intent: "product_detail", keywords: ["spec", "details", "price", "feature"] },
  { intent: "user_account", keywords: ["account", "profile", "address", "update"] },
  { intent: "admin_action", keywords: ["admin", "dashboard", "inventory", "delete"] },
];

async function detectIntent(query) {
  const q = query.toLowerCase();

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (q.includes(kw)) return { intent: rule.intent, confidence: 0.95 };
    }
  }

  return { intent: "general_chat", confidence: 0.5 };
}

module.exports = { detectIntent };
