// server/rag/contextBuilder.js
const { semanticSearch } = require("./vectorStore");
const User = require("../models/User");
const Order = require("../models/Order");

module.exports.buildContext = async function (query, intentObj, { userId } = {}) {
  const intent = intentObj.intent || intentObj;

  if (intent === "product_search" || intent === "product_detail") {
    return { type: "product", items: await semanticSearch(await embedQuery(query)) };
  }

  if (intent === "order_status") {
    if (!userId) return { type: "order", items: [] };
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return { type: "order", items: orders };
  }

  if (intent === "user_account") {
    const user = await User.findById(userId).select("-password");
    return { type: "user", items: [user] };
  }

  return { type: "general", items: [] };
};

async function embedQuery(text) {
  const { pipeline } = require("@xenova/transformers");
  const model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
