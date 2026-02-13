// Comprehensive Test Suite for Adaptive RAG Chatbot
// Run these queries to test each intent and retrieval method

const testCases = [
  // ============================================================================
  // 1. PRODUCT SEMANTIC SEARCH - Vector DB retrieval based on features/specs
  // ============================================================================
  {
    group: "1. Product Semantic Search (Vector DB)",
    intent: "product_semantic",
    route: "product_vector_db",
    retrievalType: "semantic_similarity",
    cases: [
      {
        query: "laptop with good battery life and fast processor",
        expectedIntent: "product_semantic",
        expectedDatapoints: "5 (top similar products)",
        responseFormat:
          "List of laptops sorted by relevance to 'battery life' and 'processor'",
        includes: [
          "Product titles",
          "Prices",
          "Ratings",
          "Features matching query",
        ],
      },
      {
        query: "budget gaming laptop under 50000",
        expectedIntent: "product_semantic",
        expectedDatapoints: "5 products",
        responseFormat:
          "Gaming laptops with good value for money, sorted by similarity",
        includes: ["Price range", "Gaming specs", "Performance features"],
      },
      {
        query: "camera with great low light performance",
        expectedIntent: "product_semantic",
        expectedDatapoints: "5 cameras",
        responseFormat: "Cameras optimized for low-light photography",
        includes: ["ISO range", "Aperture specs", "Sensor quality"],
      },
      {
        query: "smartphone with excellent display quality",
        expectedIntent: "product_semantic",
        expectedDatapoints: "5 phones",
        responseFormat:
          "Phones with premium displays (OLED, 120Hz, color accuracy)",
        includes: ["Screen type", "Refresh rate", "Resolution"],
      },
    ],
  },

  // ============================================================================
  // 2. PRODUCT EXACT MATCH - MongoDB text index search
  // ============================================================================
  {
    group: "2. Product Exact Match (MongoDB Text Index)",
    intent: "product_exact",
    route: "mongodb_exact",
    retrievalType: "exact",
    cases: [
      {
        query: "MacBook Pro 14 inch",
        expectedIntent: "product_exact",
        expectedDatapoints: "1-3 exact matches",
        responseFormat: "Exact product with detailed specifications",
        includes: [
          "Exact title match",
          "Price",
          "All features listed",
          "Stock status",
        ],
      },
      {
        query: "iPhone 15 Pro Max",
        expectedIntent: "product_exact",
        expectedDatapoints: "1-2 matches",
        responseFormat: "Exact phone model with full specs",
        includes: [
          "Model name",
          "Colors available",
          "Storage options",
          "Price",
        ],
      },
      {
        query: "Sony WH-1000XM5 headphones",
        expectedIntent: "product_exact",
        expectedDatapoints: "1 exact match",
        responseFormat: "Specific product with complete details",
        includes: [
          "Brand + model",
          "Color variants",
          "Warranty info",
          "Features",
        ],
      },
      {
        query: "Samsung 65 inch QLED TV",
        expectedIntent: "product_exact",
        expectedDatapoints: "1-2 TVs",
        responseFormat: "Exact TV model with technical specs",
        includes: ["Size", "Display tech", "Resolution", "Refresh rate"],
      },
    ],
  },

  // ============================================================================
  // 3. PRODUCT COMPARISON - Multiple products from MongoDB
  // ============================================================================
  {
    group: "3. Product Comparison (Multiple Products)",
    intent: "product_comparison",
    route: "mongodb_comparison",
    retrievalType: "comparison",
    cases: [
      {
        query: "compare iPhone 15 and Samsung S24",
        expectedIntent: "product_comparison",
        expectedDatapoints: "2 products",
        responseFormat: "Side-by-side comparison table",
        includes: [
          "Price comparison",
          "Camera specs",
          "Battery life",
          "Display",
          "Processor",
          "Recommended choice",
        ],
      },
      {
        query: "which is better MacBook or Dell XPS?",
        expectedIntent: "product_comparison",
        expectedDatapoints: "2 laptops",
        responseFormat: "Comparison with pros/cons",
        includes: ["Performance", "Price", "Build quality", "Battery life"],
      },
      {
        query: "compare Sony and Canon cameras",
        expectedIntent: "product_comparison",
        expectedDatapoints: "2 cameras",
        responseFormat: "Feature-by-feature comparison",
        includes: ["Sensor size", "Autofocus", "Video capabilities"],
      },
      {
        query: "iPad vs Samsung tablet comparison",
        expectedIntent: "product_comparison",
        expectedDatapoints: "2 tablets",
        responseFormat: "Detailed vs table with recommendation",
        includes: [
          "Screen specs",
          "Operating system",
          "Price",
          "Performance",
        ],
      },
    ],
  },

  // ============================================================================
  // 4. PRODUCT RECOMMENDATION - Top-rated popular products
  // ============================================================================
  {
    group: "4. Product Recommendation (Top Rated)",
    intent: "product_recommendation",
    route: "recommendation_engine",
    retrievalType: "recommendation",
    cases: [
      {
        query: "recommend the best laptops",
        expectedIntent: "product_recommendation",
        expectedDatapoints: "5 top-rated products",
        responseFormat: "🌟 Top Recommendations sorted by rating and popularity",
        includes: [
          "Highest rated laptops",
          "Ratings shown",
          "Prices",
          "Why they're popular",
        ],
      },
      {
        query: "what are popular smartphones?",
        expectedIntent: "product_recommendation",
        expectedDatapoints: "5 popular phones",
        responseFormat: "Popular phones based on ratings and sales",
        includes: [
          "Top-rated models",
          "Customer favorites",
          "Sales numbers",
        ],
      },
      {
        query: "suggest best budget laptops",
        expectedIntent: "product_recommendation",
        expectedDatapoints: "5 recommendations",
        responseFormat: "Best value laptops sorted by rating",
        includes: [
          "Recommended models",
          "Price points",
          "Value for money",
        ],
      },
      {
        query: "top cameras for photography",
        expectedIntent: "product_recommendation",
        expectedDatapoints: "5 cameras",
        responseFormat: "Most popular professional cameras",
        includes: [
          "Top-rated cameras",
          "Professional features",
          "Ratings",
        ],
      },
    ],
  },

  // ============================================================================
  // 5. ORDER TRACKING - User's orders from MongoDB (requires login)
  // ============================================================================
  {
    group: "5. Order Tracking (Logged In User)",
    intent: "order_tracking",
    route: "order_db",
    retrievalType: "order_tracking",
    requiresUserId: true,
    cases: [
      {
        query: "track my order",
        expectedIntent: "order_tracking",
        expectedDatapoints: "3 recent orders",
        responseFormat: "📦 Your Orders with status and timeline",
        includes: [
          "Order IDs",
          "Current status",
          "Order amount",
          "Expected delivery date",
          "Status emoji",
        ],
      },
      {
        query: "where is my delivery?",
        expectedIntent: "order_tracking",
        expectedDatapoints: "Most recent order",
        responseFormat: "Current shipment status with location",
        includes: [
          "Shipping status",
          "Expected arrival",
          "Tracking details",
        ],
      },
      {
        query: "show my order status",
        expectedIntent: "order_tracking",
        expectedDatapoints: "3-5 orders",
        responseFormat: "List of all user's orders with statuses",
        includes: ["Order dates", "Amounts", "Delivery status"],
      },
      {
        query: "what are my recent orders?",
        expectedIntent: "order_tracking",
        expectedDatapoints: "3 recent orders",
        responseFormat: "Recent purchase history with details",
        includes: [
          "Order IDs",
          "Purchase date",
          "Total paid",
          "Current stage",
        ],
      },
    ],
  },

  // ============================================================================
  // 6. ORDER SUPPORT - Returns, refunds, cancellations (requires login)
  // ============================================================================
  {
    group: "6. Order Support (Logistics & Returns)",
    intent: "order_support",
    route: "order_support",
    retrievalType: "order_support",
    requiresUserId: true,
    cases: [
      {
        query: "I want to return my order",
        expectedIntent: "order_support",
        expectedDatapoints: "Recent order context",
        responseFormat: "🔄 Return & Refund Support Options",
        includes: [
          "Return policy info",
          "Recent order details",
          "Contact support team",
        ],
      },
      {
        query: "how to cancel my order?",
        expectedIntent: "order_support",
        expectedDatapoints: "Order context",
        responseFormat: "Cancellation options based on order status",
        includes: ["Cancellation eligibility", "Refund timeline"],
      },
      {
        query: "I have an issue with my delivery",
        expectedIntent: "order_support",
        expectedDatapoints: "Recent order",
        responseFormat: "Support options for delivery issues",
        includes: [
          "Order details",
          "Issue resolution options",
          "Support contact",
        ],
      },
      {
        query: "refund details for my order",
        expectedIntent: "order_support",
        expectedDatapoints: "Order context",
        responseFormat: "Refund information and support options",
        includes: ["Refund policy", "Timeline", "Contact info"],
      },
    ],
  },

  // ============================================================================
  // 7. USER ACCOUNT - User profile and personal information
  // ============================================================================
  {
    group: "7. User Account Information (Logged In)",
    intent: "user_account",
    route: "user_db",
    retrievalType: "user_account",
    requiresUserId: true,
    cases: [
      {
        query: "show my account details",
        expectedIntent: "user_account",
        expectedDatapoints: "1 user profile",
        responseFormat: "👤 Your Account Information",
        includes: ["Name", "Email", "Phone", "Address", "Member since date"],
      },
      {
        query: "what's my profile information?",
        expectedIntent: "user_account",
        expectedDatapoints: "User data",
        responseFormat: "Complete profile summary",
        includes: ["All account details", "Account status"],
      },
      {
        query: "update my address in account",
        expectedIntent: "user_account",
        expectedDatapoints: "Current user address",
        responseFormat: "Current address shown, update instructions given",
        includes: ["Current address", "Update link"],
      },
    ],
  },

  // ============================================================================
  // 8. GENERAL QUERIES - Pure LLM response (no database retrieval)
  // ============================================================================
  {
    group: "8. General Knowledge (LLM Only)",
    intent: "general",
    route: "llm_only",
    retrievalType: "none",
    cases: [
      {
        query: "how does online shopping work?",
        expectedIntent: "general",
        expectedDatapoints: "0 (no DB retrieval)",
        responseFormat: "Informational answer from knowledge",
        includes: ["Shopping process explanation"],
      },
      {
        query: "what payment methods do you accept?",
        expectedIntent: "general",
        expectedDatapoints: "Knowledge base",
        responseFormat: "Payment options listed",
        includes: [
          "Credit/debit cards",
          "UPI",
          "Digital wallets",
          "Payment security",
        ],
      },
      {
        query: "what is your return policy?",
        expectedIntent: "general",
        expectedDatapoints: "0",
        responseFormat: "Policy information",
        includes: ["30-day return details", "Conditions"],
      },
      {
        query: "do you offer free shipping?",
        expectedIntent: "general",
        expectedDatapoints: "0",
        responseFormat: "Shipping policy answer",
        includes: ["Free shipping conditions", "Delivery timeframe"],
      },
      {
        query: "how do I contact customer support?",
        expectedIntent: "general",
        expectedDatapoints: "0",
        responseFormat: "Contact information",
        includes: [
          "Email",
          "Phone",
          "Hours",
          "Chat support availability",
        ],
      },
    ],
  },

  // ============================================================================
  // 9. EDGE CASES - Guest user, invalid queries, mixed intents
  // ============================================================================
  {
    group: "9. Edge Cases & Special Scenarios",
    cases: [
      {
        scenario: "ORDER_TRACKING_WITHOUT_LOGIN",
        query: "track my order",
        expectedBehavior:
          "Should return 'Please log in to track orders' message",
        expectedRoute: "llm_only",
      },
      {
        scenario: "GUEST_USER_QUERY",
        query: "show me best laptops",
        userId: null,
        expectedBehavior: "Should give recommendations without user context",
        expectedRoute: "recommendation_engine",
      },
      {
        scenario: "EMPTY_QUERY",
        query: "",
        expectedResponse:
          "Query cannot be empty (400 error)",
      },
      {
        scenario: "PARTIAL_MATCH",
        query: "compare",
        expectedBehavior:
          "Without product names, should ask for more details",
        expectedRoute: "llm_only",
      },
      {
        scenario: "TYPO_IN_PRODUCT",
        query: "show me MacBok Pro",
        expectedBehavior: "Semantic search should still find similar products",
        expectedRoute: "product_vector_db",
      },
    ],
  },
];

// ============================================================================
// EXPECTED RESPONSE STRUCTURE FOR EACH QUERY
// ============================================================================

const expectedResponseStructure = {
  response: "String (formatted answer with emojis and markdown)",
  intent: "String (detected intent)",
  confidence: "Number (0-1, confidence score)",
  retrievalMethod: "String (semantic_similarity, text_index, none, etc.)",
  datapoints: "Number (how many items were retrieved)",
};

// ============================================================================
// TESTING INSTRUCTIONS
// ============================================================================

const testingGuide = `
HOW TO TEST EACH QUERY:

1. SEMANTIC SEARCH TESTING:
   - Send: "laptop with good battery life"
   - Expected: productVector DB retrieval + top 5 similar products
   - Check: Response includes price, rating, features

2. EXACT MATCH TESTING:
   - Send: "MacBook Pro 14"
   - Expected: Single product with full details
   - Check: Exact product name, complete specs

3. COMPARISON TESTING:
   - Send: "compare iPhone and Samsung"
   - Expected: Side-by-side table comparison
   - Check: Product names extracted, comparison fields shown

4. RECOMMENDATION TESTING:
   - Send: "recommend best laptops"
   - Expected: Top 5 rated products
   - Check: Sorted by rating (highest first)

5. ORDER TRACKING (Logged-In Users):
   - Send: "track my order"
   - Expected: 3 recent orders with status
   - Check: Requires valid userId, shows delivery info

6. ORDER SUPPORT (Logged-In Users):
   - Send: "return my order"
   - Expected: Support options + order context
   - Check: Recent order shown, help options provided

7. USER ACCOUNT (Logged-In Users):
   - Send: "show my profile"
   - Expected: User details (name, email, address)
   - Check: Only if logged in, no password shown

8. GENERAL QUERIES:
   - Send: "what is your return policy?"
   - Expected: LLM answer, no DB retrieval
   - Check: DataPoints = 0, retrievalMethod = "none"

9. EDGE CASES:
   - Test without login (order tracking should fail)
   - Test with empty query (should return 400 error)
   - Test with typos (semantic search should still work)
   - Test product names not in DB (semantic search fallback)

TESTING WITH CURL:

POST /api/chatbot
Content-Type: application/json

{
  "query": "laptop with good battery life"
}

RESPONSE:
{
  "response": "I found 5 products based on your search for: **laptop with good battery life**\n\n1. MacBook Pro 14\"...",
  "intent": "product_semantic",
  "confidence": 0.85,
  "retrievalMethod": "semantic_similarity",
  "datapoints": 5
}

TESTING WITH AUTHENTICATION:

Add header:
Authorization: Bearer <your_jwt_token>

Then test order-related queries.
`;

module.exports = { testCases, expectedResponseStructure, testingGuide };
