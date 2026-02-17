// server/rag/adaptiveRouter.js - Routes queries to appropriate retrieval system
const { semanticSearch } = require("./vectorStore");
const { analyzeQueryForCategories } = require("./specificationMatcher");
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

      case "product_semantic": {
        // Specification-based semantic search with strict category filtering
        const allProducts = await Product.find().lean();
        const queryLower = query.toLowerCase();
        let bestCategory = null;
        // Force category to 'Smartphones' if query contains 'phone' or 'smartphone'
        if (queryLower.includes('phone') || queryLower.includes('smartphone')) {
          bestCategory = 'Smartphones';
        } else {
          const categoryScores = analyzeQueryForCategories(query);
          if (categoryScores && Object.keys(categoryScores).length > 0) {
            bestCategory = Object.entries(categoryScores)
              .sort((a, b) => b[1].confidence - a[1].confidence)[0][0];
          }
        }
        let filteredProducts = allProducts;
        if (bestCategory) {
          filteredProducts = allProducts.filter(p => p.category === bestCategory);
        }
        // Score products based on relevance to query
        const scoredProducts = scoreProductsByQuery(filteredProducts, query);
        const topProducts = scoredProducts.slice(0, 10);

        context.route = "product_vector_db";
        context.data.products = topProducts;
        context.data.retrievalType = "semantic_with_specs";
        break;
      }

      case "product_exact":
        // Exact match - try product ID from intent first, then fuzzy search
        let exactProduct = null;
        
        // If intent provided product ID, fetch directly
        if (intentObj.productId) {
          exactProduct = await Product.findById(intentObj.productId);
        }
        
        // If not found by ID, do flexible regex search on title/name
        if (!exactProduct) {
          const searchTerms = query
            .split(/\s+/)
            .filter(t => t.length > 2)
            .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
          
          exactProduct = await Product.findOne({
            $or: [
              { title: { $regex: searchTerms.join("|"), $options: "i" } },
              { name: { $regex: searchTerms.join("|"), $options: "i" } },
            ]
          });
        }
        
        context.route = "mongodb_exact";
        context.data.products = exactProduct ? [exactProduct] : [];
        context.data.retrievalType = "exact";
        break;

      case "product_comparison":
        // If intent detection already matched products, use them strictly.
        // We will NOT perform broad regex or semantic fallbacks for explicit SKU/name comparisons.
        let comparisonProducts = [];
        let expectedProductCount = 2;

        // 1) If intent provided exact productIds, fetch them and preserve order
        if (intentObj.productIds && Array.isArray(intentObj.productIds) && intentObj.productIds.length >= 2) {
          expectedProductCount = intentObj.productIds.length;
          // fetch products in the order of provided IDs
          const productsMap = {};
          const rows = await Product.find({ _id: { $in: intentObj.productIds } }).lean();
          rows.forEach(r => { productsMap[r._id.toString()] = r; });
          comparisonProducts = intentObj.productIds
            .map(id => productsMap[id.toString()])
            .filter(Boolean);

          // Only accept if we found all requested products
          if (comparisonProducts.length === expectedProductCount) {
            context.route = "mongodb_comparison";
            context.data.products = comparisonProducts;
            context.data.retrievalType = "comparison";
            break;
          }
          // If some ids missing, ask user to confirm exact SKUs
          context.route = "llm_only";
          context.data.products = [];
          context.data.retrievalType = "none";
          context.data.message = `I couldn't find all specified products by the provided IDs/SKUs. Please confirm exact product names or SKUs.`;
          break;
        }

        // 2) If intent provided productNames, perform strict per-name matching and require matches for every name
        if (intentObj.productNames && Array.isArray(intentObj.productNames) && intentObj.productNames.length >= 2) {
          const productNames = intentObj.productNames;
          expectedProductCount = productNames.length;
          const found = [];
          for (const name of productNames) {
            const esc = name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
            // Try exact title match first, then contains
            let p = await Product.findOne({ title: { $regex: `^${esc}$`, $options: 'i' } }).lean();
            if (!p) p = await Product.findOne({ title: { $regex: esc, $options: 'i' } }).lean();
            if (p) found.push(p);
          }
          if (found.length === expectedProductCount) {
            context.route = "mongodb_comparison";
            context.data.products = found;
            context.data.retrievalType = "comparison";
            break;
          }
          context.route = "llm_only";
          context.data.products = [];
          context.data.retrievalType = "none";
          context.data.message = `I could only match ${found.length} of ${expectedProductCount} requested products. Please provide exact product names or SKUs.`;
          break;
        }

        // 3) Allow broad/fallback searches only for explicit bulk/broad queries (e.g. "top 5", "best", "all Envy")
        const lower = query.toLowerCase();
        const bulkKeywords = ['top', 'best', 'all', 'latest', 'top 5', 'top 10', 'compare top', 'compare all', 'compare best', 'cheapest', 'budget'];
        const isBulkQuery = bulkKeywords.some(k => lower.includes(k));
        if (!isBulkQuery) {
          // Not a bulk query and no explicit names/ids — ask user to specify
          context.route = "llm_only";
          context.data.products = [];
          context.data.retrievalType = "none";
          context.data.message = 'Please specify the exact product names or SKUs you want to compare (e.g., "HP Envy 13 10 vs HP Envy 13 28").';
          break;
        }

        // 4) Bulk query path: perform semantic/regex search as a fallback
        let productNamesFallback = await extractProductNames(query);
        if (productNamesFallback.length < 2) {
          try {
            const embedding = await embedQuery(query);
            const semanticResults = await semanticSearch(embedding, 6);
            productNamesFallback = semanticResults.map(p => p.title);
          } catch (e) {
            console.error('Semantic fallback failed:', e.message);
          }
        }
        if (productNamesFallback.length >= 2) {
          comparisonProducts = await Product.find({
            title: {
              $regex: productNamesFallback
                .map(name => name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"))
                .join("|"),
              $options: "i"
            }
          }).limit(10).lean();
        }

        if (comparisonProducts && comparisonProducts.length >= 2) {
          context.route = "mongodb_comparison";
          context.data.products = comparisonProducts.slice(0, 10);
          context.data.retrievalType = "comparison";
        } else {
          // Not enough DB matches — try semantic fallback; otherwise ask for clarification
          try {
            const embedding = await embedQuery(query);
            const fallbackResults = await semanticSearch(embedding, 5);
            if (fallbackResults && fallbackResults.length >= 2) {
              context.route = "product_vector_db";
              context.data.products = fallbackResults;
              context.data.retrievalType = "semantic";
              context.data.message = "Here are similar products you might want to compare:";
            } else {
              context.route = "llm_only";
              context.data.products = [];
              context.data.retrievalType = "none";
              context.data.message = "I need product names to compare. Could you specify which products?";
            }
          } catch (e) {
            context.route = "llm_only";
            context.data.products = [];
            context.data.retrievalType = "none";
            context.data.message = "I need product names to compare. Could you specify which products?";
          }
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
    // Try to load transformer library if available
    let transformersAvailable = false;
    try {
      require.resolve("@xenova/transformers");
      transformersAvailable = true;
    } catch (e) {
      // Library not installed - continue with fallback
    }
    
    if (transformersAvailable) {
      const { pipeline } = require("@xenova/transformers");
      const model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      const output = await model(text, { pooling: "mean", normalize: true });
      return Array.from(output.data);
    } else {
      // Return fallback empty embedding - specification matching will handle scoring
      return new Array(384).fill(0);
    }
  } catch (error) {
    console.error("Embedding error:", error.message);
    return new Array(384).fill(0); // Fallback empty embedding
  }
}

/**
 * Score products based on query relevance
 * Combines keyword matching, category detection, and specification matching
 */
function scoreProductsByQuery(products, query) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  return products.map(product => {
    let score = (product.rating || 0) * 2; // Base score on rating
    let matchedFields = [];

    // Check for exact keyword matches in product title
    if (product.title && product.title.toLowerCase().includes(queryWords[0])) {
      score += 10;
      matchedFields.push('title');
    }

    // Check for category-relevant queries
    const categoryKeywords = {
      'Laptops': ['laptop', 'computer', 'notebook', 'macbook', 'gaming', 'processor', 'ram', 'battery', 'display', 'gpu', 'refresh'],
      'Smartphones': ['phone', 'smartphone', 'mobile', 'camera', 'battery', '5g', 'display', 'amoled', 'oled'],
      'Smart TVs': ['tv', 'television', 'screen', 'gaming', 'display', '4k', 'hdmi', 'qled', 'oled'],
      'Accessories': ['charger', 'earbuds', 'headphones', 'speaker', 'cable', 'mouse', 'keyboard', 'webcam', 'power', 'wireless'],
      'Wearables': ['watch', 'smartwatch', 'fitness', 'band', 'tracker', 'wearable', 'health', 'gps']
    };

    const categoryMatches = categoryKeywords[product.category] || [];
    let categoryScore = 0;
    for (const word of queryWords) {
      if (categoryMatches.includes(word)) {
        categoryScore += 1;
        if (!matchedFields.includes('category')) {
          matchedFields.push('category');
        }
      }
    }
    score += categoryScore * 3;

    // Check for specification matches
    if (product.specifications) {
      const specs = product.specifications;
      const specString = JSON.stringify(specs).toLowerCase();

      // Count keyword matches in specs
      let specMatches = 0;
      for (const word of queryWords) {
        if (word.length > 2 && specString.includes(word)) {
          specMatches++;
        }
      }
      score += specMatches * 4;

      // Bonus for specific feature matches
      if((query.includes('gaming') || query.includes('game')) && specs.best_for === 'Gaming') {
        score += 8;
      }
      if ((query.includes('battery') || query.includes('hrs')) && specs.battery_life) {
        score += 6;
      }
      if (query.includes('display') && specs.display) {
        score += 5;
      }
      if ((query.includes('processor') || query.includes('cpu')) && specs.processor) {
        score += 5;
      }
      if ((query.includes('camera') || query.includes('mp')) && (specs.rear_camera || specs.front_camera)) {
        score += 5;
      }
      if (query.includes('lightweight') && specs.weight && parseFloat(specs.weight) < 1.5) {
        score += 6;
      }
      if (query.includes('long battery') && specs.battery_life && (specs.battery_life.includes('18') || specs.battery_life.includes('20'))) {
        score += 7;
      }

      if (specMatches > 0 && !matchedFields.includes('specs')) {
        matchedFields.push('specs');
      }
    }

    return { ...product, finalScore: score, matchedFields };
  }).sort((a, b) => b.finalScore - a.finalScore);
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
