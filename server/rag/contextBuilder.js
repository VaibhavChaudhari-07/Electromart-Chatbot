// server/rag/contextBuilder.js - Context Fusion for Adaptive RAG
const { adaptiveRoute } = require("./adaptiveRouter");

/**
 * Main context builder: Routes query and fuses context
 */
module.exports.buildContext = async function (query, intentObj, { userId } = {}) {
  try {
    // Step 1: Adaptive Routing
    const routingContext = await adaptiveRoute(query, intentObj, { userId });

    // Step 2: Context Fusion - Enrich context with additional metadata
    const fusedContext = await fusionContext(routingContext, query, { userId });

    return fusedContext;
  } catch (error) {
    console.error("Context building error:", error.message);
    return {
      intent: intentObj.intent || "general",
      route: "llm_only",
      type: "general",
      items: [],
      error: error.message,
    };
  }
};

/**
 * Context Fusion: Combine data from multiple sources
 */
async function fusionContext(routingContext, query, { userId } = {}) {
  const { intent, route, data } = routingContext;
  let fusedData = { intent, route, items: [] };

  try {
    if (route === "product_vector_db") {
      // Semantic product search results
      fusedData.type = "product_semantic";
      fusedData.items = data.products || [];
      fusedData.retrievalType = data.retrievalType;
      fusedData.metadata = {
        count: fusedData.items.length,
        searchType: "semantic_similarity",
      };
    } else if (route === "mongodb_exact") {
      // Exact product match
      fusedData.type = "product_exact";
      fusedData.items = data.products || [];
      fusedData.retrievalType = data.retrievalType;
      fusedData.metadata = {
        count: fusedData.items.length,
        searchType: "text_index",
      };
    } else if (route === "mongodb_comparison") {
      // Product comparison
      fusedData.type = "product_comparison";
      fusedData.items = data.products || [];
      fusedData.retrievalType = data.retrievalType;
      fusedData.metadata = {
        count: fusedData.items.length,
        comparisonFields: ["price", "rating", "features"],
      };
    } else if (route === "recommendation_engine") {
      // AI-powered recommendations
      fusedData.type = "product_recommendation";
      fusedData.items = data.products || [];
      fusedData.retrievalType = data.retrievalType;
      fusedData.metadata = {
        count: fusedData.items.length,
        sortBy: ["rating", "popularity"],
        appliedFilters: data.appliedFilters || null,
      };
    } else if (route === "order_db") {
      // Order tracking
      fusedData.type = "order_tracking";
      fusedData.items = data.orders || [];
      fusedData.orderId = data.orderId || null;
      fusedData.mentionedProduct = data.mentionedProduct || null;
      fusedData.retrievalType = data.retrievalType;
      fusedData.userId = userId;
      fusedData.metadata = {
        count: fusedData.items.length,
        source: "order_database",
      };
    } else if (route === "order_support") {
      // Order support context
      fusedData.type = "order_support";
      fusedData.items = data.orders || [];
      fusedData.retrievalType = data.retrievalType;
      fusedData.userId = userId;
      fusedData.metadata = {
        count: fusedData.items.length,
        context: "support_related",
      };
    } else if (route === "user_db") {
      // User account context
      fusedData.type = "user_account";
      fusedData.items = data.user ? [data.user] : [];
      fusedData.retrievalType = data.retrievalType;
      fusedData.userId = userId;
      fusedData.metadata = {
        hasUserData: !!data.user,
      };
    } else {
      // Pure LLM (no retrieval)
      fusedData.type = "general";
      fusedData.items = [];
      fusedData.retrievalType = "none";
      fusedData.metadata = {
        source: "llm_only",
      };
    }
  } catch (error) {
    console.error("Context fusion error:", error.message);
    fusedData.type = "general";
    fusedData.items = [];
    fusedData.error = error.message;
  }

  return fusedData;
}

