// server/rag/adaptiveRouter.js - Routes queries to appropriate retrieval system
const { semanticSearch } = require("./vectorStore");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

/**
 * Adaptive Router: Routes intent to appropriate retrieval system
 * Returns: { intent, route, data }
 */
async function adaptiveRoute(query, intentObj, { userId } = {}) {
  const intent = intentObj.intent || "general";
  let context = { intent, route: null, data: {} };

  try {
    switch (intent) {
      case "product_semantic":
        // Semantic similarity search in vector DB
        const embedding = await embedQuery(query);
        const semanticResults = await semanticSearch(embedding, 5);
        context.route = "product_vector_db";
        context.data.products = semanticResults;
        context.data.retrievalType = "semantic";
        break;

      case "product_exact":
        // Exact match in MongoDB
        const exactResults = await Product.find(
          { $text: { $search: query } },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(5);
        context.route = "mongodb_exact";
        context.data.products = exactResults;
        context.data.retrievalType = "exact";
        break;

      case "product_comparison":
        // Extract product names and compare
        let productNames = await extractProductNames(query);
        
        // If we still don't have 2+ products, try semantic search on the query
        if (productNames.length < 2) {
          try {
            const embedding = await embedQuery(query);
            const semanticResults = await semanticSearch(embedding, 6);
            productNames = semanticResults.map(p => p.title);
          } catch (e) {
            console.error("Semantic fallback failed:", e.message);
          }
        }

        // Now try to find products matching extracted names
        if (productNames.length >= 2) {
          const comparisonProducts = await Product.find({
            title: {
              $regex: productNames
                .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                .join("|"),
              $options: "i"
            }
          }).limit(5);

          if (comparisonProducts.length >= 2) {
            context.route = "mongodb_comparison";
            context.data.products = comparisonProducts;
            context.data.retrievalType = "comparison";
          } else {
            // Still not enough products found - use semantic search for best match
            const embedding = await embedQuery(query);
            const fallbackResults = await semanticSearch(embedding, 5);
            context.route = "product_vector_db";
            context.data.products = fallbackResults;
            context.data.retrievalType = "semantic";
            context.data.message = "Here are similar products you might want to compare:";
          }
        } else {
          // Ask user for clarification
          context.route = "llm_only";
          context.data.message = "I need product names to compare. Could you specify which products?";
        }
        break;

      case "product_recommendation":
        // Recommendation based on category popularity and ratings
        const recommendations = await Product.find()
          .sort({ rating: -1, salesCount: -1 })
          .limit(5);
        context.route = "recommendation_engine";
        context.data.products = recommendations;
        context.data.retrievalType = "recommendation";
        break;

      case "order_tracking":
        // Order tracking from MongoDB
        if (userId) {
          const userOrders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .limit(3);
          context.route = "order_db";
          context.data.orders = userOrders;
          context.data.retrievalType = "order_tracking";
          context.data.userId = userId;
        } else {
          context.route = "llm_only";
          context.data.message = "Please log in to track orders";
        }
        break;

      case "order_support":
        // Order support with context from recent orders
        if (userId) {
          const recentOrder = await Order.findOne({ userId })
            .sort({ createdAt: -1 });
          context.route = "order_support";
          context.data.orders = recentOrder ? [recentOrder] : [];
          context.data.retrievalType = "order_support";
          context.data.userId = userId;
        } else {
          context.route = "llm_only";
        }
        break;

      case "user_account":
        // User account context from MongoDB
        if (userId) {
          const user = await User.findById(userId).select("-password");
          context.route = "user_db";
          context.data.user = user;
          context.data.retrievalType = "user_account";
        } else {
          context.route = "llm_only";
        }
        break;

      default:
        // General queries - pure LLM
        context.route = "llm_only";
        context.data.retrievalType = "general";
    }
  } catch (error) {
    console.error("Adaptive routing error:", error.message);
    context.route = "llm_only";
    context.data.error = error.message;
  }

  return context;
}

/**
 * Embed query text to vector for semantic search
 */
async function embedQuery(text) {
  try {
    const { pipeline } = require("@xenova/transformers");
    const model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Embedding error:", error.message);
    return new Array(384).fill(0); // Fallback empty embedding
  }
}

/**
 * Extract product names from query using semantic search to find similar products
 * Much smarter than keyword matching - finds products by meaning
 */
async function extractProductNames(query) {
  try {
    // Normalize common typos and abbreviations
    let normalizedQuery = query
      .replace(/\bi phone\b/gi, "iPhone")
      .replace(/\bgalaxy\b/gi, "Galaxy")
      .replace(/\bmacbook\b/gi, "MacBook")
      .replace(/\bsamsung\b/gi, "Samsung")
      .replace(/\blaptop\b/gi, "Laptop")
      .replace(/\bphone\b/gi, "Phone")
      .replace(/\bvs |versus |vs\./gi, " compared to ")
      .replace(/\bcompare\b/gi, "");

    // Extract potential product references (capitalized words, brand names)
    const brandPatterns = [
      "Apple", "MacBook", "iPhone", "iPad", "AirPods",
      "Samsung", "Galaxy", "Realme", "OnePlus", "Xiaomi",
      "Dell", "HP", "Lenovo", "ASUS", "Sony",
      "Canon", "Nikon", "GoPro"
    ];

    const foundBrands = [];
    for (const brand of brandPatterns) {
      if (new RegExp(brand, "i").test(query)) {
        foundBrands.push(brand);
      }
    }

    // If we found brand names, search for products with those brands
    if (foundBrands.length > 0) {
      const products = await Product.find({
        $or: [
          { brand: { $in: foundBrands } },
          { title: { $regex: foundBrands.join("|"), $options: "i" } }
        ]
      })
        .select("title brand")
        .limit(10);

      if (products.length >= 2) {
        return products.map(p => p.title).slice(0, 5);
      }
    }

    // Fallback: Use semantic search to find products similar to the query context
    // Remove comparison words and search for what remains
    const searchQuery = normalizedQuery
      .replace(/compare|versus|vs|and|or/gi, "")
      .trim();

    if (searchQuery.length > 3) {
      const embedding = await embedQuery(searchQuery);
      const { semanticSearch } = require("./vectorStore");
      const similarProducts = await semanticSearch(embedding, 5);
      
      if (similarProducts.length >= 2) {
        return similarProducts.map(p => p.title);
      }
    }

    return [];
  } catch (error) {
    console.error("Product name extraction error:", error.message);
    return [];
  }
}

module.exports = { adaptiveRoute, embedQuery };
