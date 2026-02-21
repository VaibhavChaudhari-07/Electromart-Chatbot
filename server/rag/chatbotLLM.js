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

  let response = '';
  // Always show only the matched products (2 for A vs B, 3 for A vs B vs C, etc)
  const comparableProducts = products;
  // Table fields
  const specFieldMap = {
    'Processor': 'processor',
    'RAM': 'ram',
    'Storage': 'storage',
    'Display': 'display',
    'Battery': 'battery_life',
    'GPU': 'gpu',
    'Best For': 'best_for'
  };
  function formatSpecValue(val) {
    if (!val) return '-';
    if (typeof val === 'string') return val.substring(0, 22);
    if (typeof val === 'number') return String(val).substring(0, 22);
    return String(val).substring(0, 22);
  }
  function formatProductName(name) {
    const maxLen = Math.floor(40 / Math.max(2, comparableProducts.length));
    if (name.length > maxLen) {
      return name.substring(0, maxLen - 3) + '...';
    }
    return name;
  }
  // Heading
  response += `\n⚖️ PRODUCT COMPARISON\n`;
  response += `══════════════════════════════════════════════\n\n`;
  response += `📊 Comparing ${comparableProducts.length} products\n\n`;
  // Markdown Table
  response += `| Feature | ${comparableProducts.map(p => formatProductName(p.title)).join(' | ')} |\n`;
  response += `|---------|${comparableProducts.map(() => '---------|').join('')}\n`;
  response += `| 💰 Price | ${comparableProducts.map(p => `₹${p.price.toLocaleString()}`).join(' | ')} |\n`;
  response += `| ⭐ Rating | ${comparableProducts.map(p => {
    if (p.rating) return `${p.rating}/5`;
    if (p.ratingCount) return `${p.ratingCount} reviews`;
    return 'N/A';
  }).join(' | ')} |\n`;
  Object.entries(specFieldMap).forEach(([displayName, specKey]) => {
    const icon = {
      'Processor': '⚙️',
      'RAM': '💾',
      'Storage': '📦',
      'Display': '🖥️',
      'Battery': '🔋',
      'GPU': '🎮',
      'Best For': '🎯'
    }[displayName] || '◾';
    response += `| ${icon} ${displayName} | ${comparableProducts.map(p => {
      if (p.specifications && p.specifications[specKey]) {
        return formatSpecValue(p.specifications[specKey]);
      }
      return '-';
    }).join(' | ')} |\n`;
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
  const filters = context.metadata?.appliedFilters || context.appliedFilters || {};

  if (products.length === 0) {
    return `I don't have any product recommendations at this moment. Please check back soon!`;
  }

  let response = `🌟 **Top Recommendations**\n\n`;

  // Show applied filters/rationale
  const filterLines = [];
  if (filters.category) filterLines.push(`Category: ${filters.category}`);
  if (filters.brands && filters.brands.length) filterLines.push(`Brands: ${filters.brands.join(', ')}`);
  if (filters.priceLimit) filterLines.push(`Budget: up to ₹${Number(filters.priceLimit).toLocaleString()}`);
  if (filters.minRating) filterLines.push(`Min rating: ${filters.minRating}/5`);
  if (filterLines.length > 0) {
    response += `🔎 Filters applied — ${filterLines.join(' • ')}\n\n`;
  }

  // Render a concise ranked list with rationale per item
  products.slice(0, 5).forEach((p, i) => {
    const title = p.title || p.name || 'Product';
    const price = p.price ? `₹${Number(p.price).toLocaleString()}` : 'Price N/A';
    const rating = p.rating ? `⭐ ${p.rating}/5` : 'Rating N/A';

    // Short spec summary
    let specSummary = '';
    if (p.specifications) {
      const s = p.specifications;
      const parts = [];
      if (s.processor) parts.push(s.processor);
      if (s.ram) parts.push(s.ram);
      if (s.storage) parts.push(s.storage);
      if (s.battery_life) parts.push(s.battery_life + ' battery');
      if (s.display) parts.push(s.display);
      specSummary = parts.slice(0, 4).join(' • ');
    }

    // Why recommended: build short rationale
    const reasons = [];
    if (p.rating && p.rating >= 4.5) reasons.push('Top rated');
    if (filters.priceLimit && p.price && p.price <= filters.priceLimit) reasons.push('Within budget');
    if (filters.brands && filters.brands.length && filters.brands.includes((p.brand || '').toLowerCase())) reasons.push('Preferred brand');
    if (p.specifications && filters && filters.useCases && filters.useCases.length) {
      const bestFor = (p.specifications.best_for || '').toLowerCase();
      if (filters.useCases.some(u => bestFor.includes(u))) reasons.push('Matches use-case');
    }

    response += `**${i + 1}. ${title}**\n`;
    response += `   ${rating} | ${price}\n`;
    if (specSummary) response += `   ⚙️ ${specSummary}\n`;
    if (reasons.length > 0) response += `   ✅ ${reasons.join(' • ')}\n`;
    if (p.description) response += `   📝 ${p.description.slice(0, 100)}\n`;
    response += `\n`;
  });

  response += `✨ These recommendations are based on ratings, popularity, and the filters you provided. Want me to show more, narrow the budget, or compare any of these?`;
  return response;
}

/**
 * Order Tracking Response - Enhanced with detailed stage tracking
 */
function generateOrderTrackingResponse(query, context) {
  const orders = context.items || [];
  const orderId = context.orderId || null;
  const mentionedProduct = context.mentionedProduct || null;

  if (orders.length === 0) {
    if (orderId) {
      return `🔍 Order **${orderId}** not found. Please check:\n• Order ID is correct\n• You are logged into the correct account\n\nNeed help? Contact support!`;
    }
    return `You don't have any recent orders. Start shopping to place your first order! 🛍️`;
  }

  let response = `## 📦 Order Tracking Details\n\n`;

  // If searching for specific order, highlight it
  if (orderId) {
    response += `🔎 **Searching for:** ${orderId}\n\n`;
  }

  orders.slice(0, 5).forEach((order, i) => {
    const status = (order.status || "pending").toLowerCase();
    
    // Status emoji mapping
    const statusIcons = {
      pending: { emoji: '⏳', label: 'Pending' },
      packing: { emoji: '📦', label: 'Packing' },
      shipped: { emoji: '🚚', label: 'Shipped' },
      'out-for-delivery': { emoji: '🚛', label: 'Out for Delivery' },
      delivered: { emoji: '✅', label: 'Delivered' },
      cancelled: { emoji: '❌', label: 'Cancelled' },
    };
    
    const statusInfo = statusIcons[status] || { emoji: '📋', label: status };
    const orderNum = order._id ? order._id.toString().slice(-6).toUpperCase() : i + 1;

    response += `### **Order #${orderNum}**\n`;
    response += `**Status:** ${statusInfo.emoji} ${statusInfo.label}\n`;
    response += `**Amount:** ₹${(order.totalAmount || 0).toLocaleString()}\n`;
    response += `**Ordered:** ${new Date(order.createdAt).toLocaleDateString('en-IN')}\n`;

    // Show ordered products
    if (order.items && order.items.length > 0) {
      response += `**Items:**\n`;
      order.items.forEach(item => {
        const title = item.title || item.name || 'Product';
        const quantity = item.quantity || 1;
        response += `  • ${title} (Qty: ${quantity}) - ₹${(item.price || 0).toLocaleString()}\n`;
      });
    }

    // Show delivery timeline
    if (order.stages) {
      response += `\n**Timeline:**\n`;
      
      const stageInfo = [
        { key: 'packing', emoji: '📦', label: 'Packing' },
        { key: 'shipped', emoji: '🚚', label: 'Shipped' },
        { key: 'outForDelivery', emoji: '🚛', label: 'Out for Delivery' },
        { key: 'delivered', emoji: '✅', label: 'Delivered' },
      ];

      stageInfo.forEach(stage => {
        const stageData = order.stages[stage.key];
        if (stageData) {
          const completed = stageData.completed ? '✅' : '⏳';
          const date = stageData.completedAt ? ` - ${new Date(stageData.completedAt).toLocaleDateString('en-IN')}` : '';
          response += `  ${completed} ${stage.emoji} ${stage.label}${date}\n`;
        }
      });
    }

    // Delivery address
    if (order.address) {
      response += `\n**Delivery Address:**\n`;
      response += `  ${order.address.fullAddress || order.address.street || 'N/A'}\n`;
      if (order.address.city) response += `  ${order.address.city}${order.address.zipCode ? ' - ' + order.address.zipCode : ''}\n`;
    }

    response += `\n---\n\n`;
  });

  response += `💬 **Questions?**\n`;
  response += `• For delays: Reply with order number\n`;
  response += `• For returns: Check our return policy\n`;
  response += `• For payments: We accept COD\n\n`;
  response += `📞 Contact: support@electromart.com | Call: 1-800-ELECTRO\n`;

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
