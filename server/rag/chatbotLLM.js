// server/rag/chatbotLLM.js - LLM Response Generation with RAG Context

/**
 * Generate final answer using context and LLM
 */
module.exports.generateFinalAnswer = async function ({ query, intent, context }) {
  try {
    // If error in context, return fallback
    if (context.error) {
      return `I encountered an issue retrieving data. Let me help you based on my knowledge: ${getGeneralAnswer(query)}`;
    }

    const contextType = context.type || context.route;

    // Route to appropriate response generator
    if (context.type === "product_semantic") {
      return generateProductSemanticResponse(query, context);
    }

    if (context.type === "product_exact") {
      return generateProductExactResponse(query, context);
    }

    if (context.type === "product_comparison") {
      return generateComparisonResponse(query, context);
    }

    if (context.type === "product_recommendation") {
      return generateRecommendationResponse(query, context);
    }

    if (context.type === "order_tracking") {
      return generateOrderTrackingResponse(query, context);
    }

    if (context.type === "order_support") {
      return generateOrderSupportResponse(query, context);
    }

    if (context.type === "user_account") {
      return generateUserAccountResponse(query, context);
    }

    // Default: General LLM response
    return getGeneralAnswer(query);
  } catch (error) {
    console.error("LLM generation error:", error.message);
    return "I apologize, but I encountered an error. Please try again.";
  }
};

/**
 * Product Semantic Search Response
 */
function generateProductSemanticResponse(query, context) {
  const products = context.items || [];

  if (products.length === 0) {
    return `I couldn't find products matching your query "${query}". Try searching for a specific product name or category.`;
  }

  let response = `I found ${products.length} product(s) based on your search for: **${query}**\n\n`;

  products.slice(0, 5).forEach((p, i) => {
    const title = p.title || p.description || "Product";
    const price = p.price ? `₹${p.price}` : "Price not available";
    const rating = p.rating ? `⭐ ${p.rating}/5` : "";
    const features = p.features
      ? `• Features: ${p.features.slice(0, 3).join(", ")}`
      : "";

    response += `\n**${i + 1}. ${title}**\n`;
    response += `   ${price} ${rating}\n`;
    if (p.description) response += `   ${p.description.slice(0, 100)}...\n`;
    if (features) response += `   ${features}\n`;
  });

  response += `\n💡 Would you like more details about any of these products?`;
  return response;
}

/**
 * Product Exact Match Response
 */
function generateProductExactResponse(query, context) {
  const products = context.items || [];

  if (products.length === 0) {
    return `I couldn't find an exact match for "${query}". Would you like me to suggest similar products instead?`;
  }

  let response = `I found the product you're looking for: **${products[0].title}**\n\n`;

  const p = products[0];
  response += `💰 **Price:** ₹${p.price}\n`;
  response += `${p.rating ? `⭐ **Rating:** ${p.rating}/5\n` : ""}`;
  response += `📝 **Details:** ${p.description}\n`;

  if (p.features && p.features.length > 0) {
    response += `\n✨ **Key Features:**\n`;
    p.features.slice(0, 5).forEach((f) => {
      response += `• ${f}\n`;
    });
  }

  if (p.stock) {
    response += `\n📦 **Stock:** ${p.stock > 0 ? `${p.stock} available` : "Out of stock"}\n`;
  }

  response += `\n🛒 Ready to add to cart?`;
  return response;
}

/**
 * Product Comparison Response
 */
function generateComparisonResponse(query, context) {
  let products = context.items || [];

  // If we have fewer than 2 products but have items from semantic search
  if (products.length === 1) {
    // Try to find similar products to compare with
    let response = `\n⚖️ **Product Comparison - ${products[0].title}**\n\n`;
    response += `I found: **${products[0].title}**\n`;
    response += `💰 Price: ₹${products[0].price}\n`;
    response += `⭐ Rating: ${products[0].rating || 'N/A'}/5\n\n`;
    response += `Would you like me to compare this with similar products in this category? Just let me know! 🔍\n`;
    return response;
  }

  if (products.length < 2) {
    // Try semantic search as fallback
    if (context.message) {
      return context.message;
    }
    return `I need at least 2 products to compare. Could you specify which products you'd like to compare? For example: "Compare iPhone 15 and Samsung S24" 📱`;
  }

  let response = `### **⚖️ Product Comparison**\n\n`;

  // Create comparison table with up to 5 products
  const comparableProducts = products.slice(0, 5);
  response += `| Feature | ${comparableProducts.map((p) => p.title).join(" | ")} |\n`;
  response += `|---------|${comparableProducts.map(() => "---|").join("")}\n`;
  response += `| **Price** | ${comparableProducts.map((p) => `₹${p.price}`).join(" | ")} |\n`;
  response += `| **Rating** | ${comparableProducts.map((p) => (p.rating ? `${p.rating}/5 ⭐` : "N/A")).join(" | ")} |\n`;
  response += `| **Stock** | ${comparableProducts.map((p) => (p.stock > 0 ? "✓ In Stock" : "✗ Out")).join(" | ")} |\n`;

  if (comparableProducts.every((p) => p.features && p.features.length > 0)) {
    response += `| **Top Features** | ${comparableProducts
      .map((p) => p.features.slice(0, 2).join(", "))
      .join(" | ")} |\n`;
  }

  response += `\n💡 **My Recommendation:** `;
  const bestByRating = comparableProducts.reduce((prev, current) =>
    (current.rating || 0) > (prev.rating || 0) ? current : prev
  );
  const bestByPrice = comparableProducts.reduce((prev, current) =>
    (current.price || 0) < (prev.price || 0) ? current : prev
  );

  if (bestByRating.rating >= 4.5) {
    response += `Based on ratings, **${bestByRating.title}** is the best choice. `;
  }
  if (bestByPrice !== bestByRating) {
    response += `For best value, consider **${bestByPrice.title}**.`;
  }

  response += `\n\n🛒 Ready to add any to your cart?`;
  return response;
}

/**
 * Product Recommendation Response
 */
function generateRecommendationResponse(query, context) {
  const products = context.items || [];

  if (products.length === 0) {
    return `I don't have any product recommendations at this moment. Please check back soon!`;
  }

  let response = `🌟 **Top Recommendations for You**\n\n`;

  products.slice(0, 5).forEach((p, i) => {
    response += `**${i + 1}. ${p.title}**\n`;
    response += `   ⭐ ${p.rating || "N/A"}/5 | ₹${p.price}\n`;
    response += `   ${p.description ? p.description.slice(0, 60) : ""}...\n\n`;
  });

  response += `✨ These are our most popular and highly-rated products. Click any to view details!`;
  return response;
}

/**
 * Order Tracking Response
 */
function generateOrderTrackingResponse(query, context) {
  const orders = context.items || [];

  if (orders.length === 0) {
    return `You don't have any recent orders. Start shopping to place your first order! 🛍️`;
  }

  let response = `### **Your Orders** 📦\n\n`;

  orders.slice(0, 3).forEach((order, i) => {
    const status = order.status || "Processing";
    const statusEmoji = {
      processing: "⏳",
      shipped: "📦",
      delivered: "✅",
      cancelled: "❌",
    }[status.toLowerCase()] || "📋";

    response += `**Order #${order._id.toString().slice(-6).toUpperCase()}**\n`;
    response += `   ${statusEmoji} **Status:** ${status}\n`;
    response += `   💰 Amount: ₹${order.totalAmount}\n`;
    response += `   📅 Date: ${new Date(order.createdAt).toLocaleDateString()}\n`;

    if (order.expectedDelivery) {
      response += `   📍 Expected: ${new Date(order.expectedDelivery).toLocaleDateString()}\n`;
    }

    response += `\n`;
  });

  response += `📞 Need help? Contact our support team!`;
  return response;
}

/**
 * Order Support Response
 */
function generateOrderSupportResponse(query, context) {
  const orders = context.items || [];
  const hasOrder = orders.length > 0;

  let response = `I'm here to help with your order concerns!\n\n`;

  if (hasOrder) {
    const recentOrder = orders[0];
    response += `📦 **Your Recent Order:** #${recentOrder._id.toString().slice(-6).toUpperCase()}\n`;
    response += `   Amount: ₹${recentOrder.totalAmount}\n`;
    response += `   Status: ${recentOrder.status}\n\n`;
  }

  response += `I can help you with:\n`;
  response += `• ↩️ Returns & Refunds\n`;
  response += `• 🔄 Exchange or Replacement\n`;
  response += `• ❓ Delivery Issues\n`;
  response += `• 💳 Payment Problems\n\n`;

  response += `Please describe your issue, and I'll assist you right away!`;

  return response;
}

/**
 * User Account Response
 */
function generateUserAccountResponse(query, context) {
  const user = context.items?.[0];

  if (!user) {
    return `I need you to be logged in to access your account details. Please log in first.`;
  }

  let response = `👤 **Your Account**\n\n`;
  response += `**Name:** ${user.name}\n`;
  response += `**Email:** ${user.email}\n`;
  response += `**Phone:** ${user.phone || "Not provided"}\n`;
  response += `**Address:** ${user.address || "Not set"}\n`;
  response += `**Member Since:** ${new Date(user.createdAt).toLocaleDateString()}\n\n`;

  response += `🔧 You can update your details from your account page.`;

  return response;
}

/**
 * Get General Answer (Fallback)
 */
function getGeneralAnswer(query) {
  const responses = {
    shipping:
      "We offer fast shipping across the country! Most orders are delivered within 3-5 business days.",
    return:
      "We have a 30-day easy return policy. Items must be unused and in original packaging.",
    warranty: "All our products come with a manufacturer's warranty. Details vary by product.",
    payment: "We accept all major credit/debit cards, UPI, and digital wallets.",
    contact:
      "You can reach our support team at support@electromart.com or call us at 1-800-ELECTRO.",
  };

  const q = query.toLowerCase();
  for (const [key, answer] of Object.entries(responses)) {
    if (q.includes(key)) return answer;
  }

  return `I'm ElectroMart's AI Assistant! I can help you with:\n• Product search and recommendations\n• Order tracking\n• Account management\n• Shipping and returns\n\nWhat would you like to know?`;
}

module.exports.generateFinalAnswer = module.exports.generateFinalAnswer;
