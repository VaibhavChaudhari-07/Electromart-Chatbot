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
 * Product Semantic Search Response - Enhanced with Specification Matching
 */
function generateProductSemanticResponse(query, context) {
  const products = context.items || [];

  if (products.length === 0) {
    return `I couldn't find products matching your query "${query}". Try searching for a specific product name or category.`;
  }

  let response = `I found **${products.length}** products matching your request for: **${query}**\n\n`;

  // Add category-based intro if available
  if (context.categoryMatches && Object.keys(context.categoryMatches).length > 0) {
    const categories = Object.keys(context.categoryMatches);
    response += `📂 **Categories:** ${categories.join(', ')}\n\n`;
  }

  response += `🏆 **Top Recommendations:**\n`;

  products.slice(0, 5).forEach((p, i) => {
    const title = p.title || p.description || "Product";
    const price = p.price ? `₹${p.price.toLocaleString()}` : "Price not available";
    const rating = p.rating ? `⭐ ${p.rating}/5` : "";
    const categoryBadge = p.category ? `[${p.category}]` : "";
    
    // Show specification matches if available
    let specInfo = '';
    if (p.matchedSpecs && p.matchedSpecs.length > 0) {
      specInfo = `\n   ✓ Matched specs: ${p.matchedSpecs.join(', ')}`;
    } else if (p.specifications) {
      const specArray = [];
      if (p.specifications.processor) specInfo += p.specifications.processor + ', ';
      if (p.specifications.ram) specInfo += p.specifications.ram + ', ';
      if (p.specifications.storage) specInfo += p.specifications.storage + ', ';
      if (p.specifications.battery_life) specInfo += p.specifications.battery_life + ' battery';
      specInfo = specInfo ? `\n   ⚙️ ${specInfo.replace(/,\s*$/, '')}` : '';
    }

    const features = p.features && p.features.length > 0
      ? `\n   🎯 ${p.features.slice(0, 2).join(', ')}`
      : "";

    response += `\n**${i + 1}. ${categoryBadge} ${title}**`;
    response += `\n   💰 ${price} ${rating}`;
    response += specInfo;
    response += features;
    if (p.stock) response += `\n   📦 ${p.stock > 0 ? '✓ In Stock' : '❌ Out of Stock'}`;
  });

  response += `\n\n💡 **Next Steps:** Would you like to add any of these to your cart, or need more information about specific features?`;
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

  const p = products[0];
  
  let response = `🎯 **Perfect Match Found: ${p.title}**\n\n`;

  response += `💰 **Price:** ₹${p.price.toLocaleString()}\n`;
  if (p.rating) {
    response += `⭐ **Rating:** ${p.rating}/5`;
    if (p.reviews) response += ` (${p.reviews} reviews)`;
    response += `\n`;
  }

  // Display stock status prominently
  if (p.stock !== undefined) {
    response += `${p.stock > 0 ? "✅ **In Stock:**" : "❌ **Out of Stock:**"} ${p.stock > 0 ? `${p.stock} available` : "Currently unavailable"}\n`;
  }

  // Display specifications in a clean format
  if (p.specifications) {
    response += `\n⚙️ **Key Specifications:**\n`;
    
    // Handle different spec formats (object, array, or string)
    if (typeof p.specifications === 'object') {
      if (Array.isArray(p.specifications)) {
        // Array format
        p.specifications.slice(0, 5).forEach((spec) => {
          if (typeof spec === 'string') {
            response += `• ${spec}\n`;
          } else if (typeof spec === 'object' && spec.name && spec.value) {
            response += `• **${spec.name}:** ${spec.value}\n`;
          }
        });
      } else {
        // Object format (key-value pairs)
        Object.entries(p.specifications).slice(0, 5).forEach(([key, value]) => {
          const displayKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          response += `• **${displayKey}:** ${value}\n`;
        });
      }
    } else if (typeof p.specifications === 'string' && p.specifications.trim()) {
      // String format (raw text)
      response += p.specifications.split('\n').slice(0, 5).join('\n') + '\n';
    }
  }

  // Display key features
  if (p.features && p.features.length > 0) {
    response += `\n✨ **Key Features:**\n`;
    p.features.slice(0, 4).forEach((f) => {
      response += `• ${f}\n`;
    });
  }

  // Description/Summary
  if (p.description) {
    response += `\n📝 **About this product:**\n${p.description}\n`;
  }

  response += `\n🛍️ **View full details and add to cart above!** ⬆️`;
  return response;
}

/**
 * Product Comparison Response - Side-by-Side Comparison Table
 */
function generateComparisonResponse(query, context) {
  let products = context.items || [];

  // If we have fewer than 2 products
  if (products.length < 2) {
    if (products.length === 1) {
      let response = `\n⚖️ **Comparison - ${products[0].title}**\n\n`;
      response += `I found only one product: **${products[0].title}**\n`;
      response += `💰 Price: ₹${products[0].price.toLocaleString()}\n`;
      response += `⭐ Rating: ${products[0].rating || 'N/A'}/5\n\n`;
      response += `Would you like me to find similar products to compare with this? Just let me know other product names! 🔍\n`;
      return response;
    }
    
    if (context.message) {
      return context.message;
    }
    return `I need at least 2 products to compare. Could you specify which products you'd like to compare? For example: "Compare iPhone 15 and Samsung S24" 📱`;
  }

  let response = ``;
  
  // Create comparison table with up to 5 products
  const comparableProducts = products.slice(0, 5);
  
  // Define required specification fields for comparison (map to specification keys)
  const specFieldMap = {
    'Processor': 'processor',
    'RAM': 'ram',
    'Storage': 'storage',
    'Display': 'display',
    'Battery': 'battery_life',
    'GPU': 'gpu',
    'Best For': 'best_for'
  };

  // Helper function to format specification values
  function formatSpecValue(val) {
    if (!val) return '-';
    if (typeof val === 'string') return val.substring(0, 28);
    if (typeof val === 'number') return String(val).substring(0, 28);
    return String(val).substring(0, 28);
  }

  // Helper function to truncate product names nicely
  function formatProductName(name) {
    if (name.length > 22) {
      return name.substring(0, 19) + '...';
    }
    return name;
  }
  
  // ===== HEADING SECTION =====
  response += `\n═══════════════════════════════════════\n`;
  response += `⚖️  PRODUCT COMPARISON\n`;
  response += `═══════════════════════════════════════\n\n`;
  response += `📊 Comparing **${comparableProducts.length} products**\n\n`;

  // ===== COMPARISON TABLE =====
  response += `**COMPARISON TABLE**\n`;
  response += `\n| Feature | ${comparableProducts.map(p => formatProductName(p.title)).join(" | ")} |\n`;
  response += `|:--------|${comparableProducts.map(() => ":-----|").join("")}\n`;

  // Price row - formatted nicely
  response += `| **💰 Price** | ${comparableProducts.map(p => `**₹${p.price.toLocaleString()}**`).join(" | ")} |\n`;

  // Rating row - formatted nicely
  response += `| **⭐ Rating** | ${comparableProducts.map(p => {
    if (p.rating) return `**${p.rating}**/5 ⭐`;
    if (p.ratingCount) return `${p.ratingCount} reviews`;
    return 'N/A';
  }).join(" | ")} |\n`;

  // Add specification rows in order
  Object.entries(specFieldMap).forEach(([displayName, specKey]) => {
    const icons = {
      'Processor': '⚙️',
      'RAM': '🎯',
      'Storage': '💾',
      'Display': '🖥️',
      'Battery': '🔋',
      'GPU': '🎮',
      'Best For': '🎯'
    };
    const icon = icons[displayName] || '📌';
    
    response += `| **${icon} ${displayName}** | ${comparableProducts.map(p => {
      if (p.specifications && p.specifications[specKey]) {
        return formatSpecValue(p.specifications[specKey]);
      }
      return '-';
    }).join(" | ")} |\n`;
  });

  response += `\n`;

  // ===== ANALYSIS SECTION =====
  response += `───────────────────────────────────────\n`;
  response += `💡 KEY INSIGHTS & RECOMMENDATIONS\n`;
  response += `───────────────────────────────────────\n\n`;

  // Best by rating
  const bestByRating = comparableProducts.reduce((prev, current) =>
    (current.rating || 0) > (prev.rating || 0) ? current : prev
  );
  
  // Best by price
  const bestByPrice = comparableProducts.reduce((prev, current) =>
    (current.price || 0) < (prev.price || 0) ? current : prev
  );

  if (bestByRating.rating && bestByRating.rating >= 4) {
    response += `⭐ **TOP RATED**\n`;
    response += `   ${bestByRating.title}\n`;
    response += `   Rating: ${bestByRating.rating}/5\n\n`;
  }
  
  if (bestByPrice) {
    response += `💰 **MOST AFFORDABLE**\n`;
    response += `   ${bestByPrice.title}\n`;
    response += `   Price: ₹${bestByPrice.price.toLocaleString()}\n\n`;
  }

  // Value for money analysis
  if (comparableProducts.length >= 2) {
    const valueScores = comparableProducts.map(p => {
      const ratingWeight = (p.rating || 0) * 100;
      const priceWeight = Math.max(0, 20000 - p.price) / 100;
      return { product: p, score: ratingWeight + priceWeight };
    });
    
    const bestValue = valueScores.reduce((a, b) => a.score > b.score ? a : b);
    response += `🏆 **BEST VALUE FOR MONEY**\n`;
    response += `   ${bestValue.product.title}\n`;
    response += `   Excellent balance of quality and price\n\n`;
  }

  // Add use case recommendations if available
  const hasUseCase = comparableProducts.some(p => p.specifications && p.specifications.best_for);
  if (hasUseCase) {
    response += `───────────────────────────────────────\n`;
    response += `🎯 PERFECT FOR\n`;
    response += `───────────────────────────────────────\n\n`;
    
    comparableProducts.forEach(p => {
      const useCase = p.specifications?.best_for || 'General Use';
      response += `• **${formatProductName(p.title)}** → ${useCase}\n`;
    });
    
    response += `\n`;
  }

  // Stock information
  response += `───────────────────────────────────────\n`;
  response += `📦 AVAILABILITY\n`;
  response += `───────────────────────────────────────\n\n`;
  
  comparableProducts.forEach(p => {
    const availability = p.stock > 0 
      ? `✅ In Stock (${p.stock} available)`
      : `❌ Out of Stock`;
    response += `• ${formatProductName(p.title)}: ${availability}\n`;
  });

  response += `\n`;
  response += `═══════════════════════════════════════\n`;
  response += `🛒 Ready to choose? Add to cart below!\n`;
  response += `═══════════════════════════════════════\n`;

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
