# Adaptive RAG System Implementation Guide

## Overview

The ElectroMart AI chatbot now implements a sophisticated **Adaptive Retrieval-Augmented Generation (RAG)** system that intelligently routes user queries to the most appropriate data sources and retrieval methods.

## System Architecture

```
User Query
   ↓
Intent Detection (intentDetector.js)
   ↓
Adaptive Routing (adaptiveRouter.js)
   ├─ Product Semantic → Vector DB (semanticSearch)
   ├─ Product Exact → MongoDB (text index)
   ├─ Comparison → MongoDB (multiple products)
   ├─ Recommendation → MongoDB (sorted by rating)
   ├─ Order Tracking → MongoDB (order DB)
   ├─ Order Support → MongoDB (recent orders)
   ├─ User Account → MongoDB (user DB)
   └─ General → LLM (no retrieval)
        ↓
Context Fusion (contextBuilder.js)
        ↓
LLM Response Generation (chatbotLLM.js)
        ↓
Formatted Response → Chat UI
```

## Key Components

### 1. **Intent Detector** (`intentDetector.js`)
Identifies query intent with keyword matching and confidence scores.

**Intents:**
- `product_semantic` - Features, specs, price range searches
- `product_exact` - Specific product lookups
- `product_comparison` - Comparing multiple products
- `product_recommendation` - "Show me best" / "recommend" queries
- `order_tracking` - "Track my order" / "Where is my delivery"
- `order_support` - Returns, refunds, cancellations
- `user_account` - Profile, address, account details
- `general` - General conversation (no special retrieval)

### 2. **Adaptive Router** (`adaptiveRouter.js`)
Routes the query to the most appropriate data source based on intent.

**Routing Logic:**
```javascript
// Product Semantic queries → Vector DB semantic search
case "product_semantic":
  → Custom embeddings + cosine similarity matching

// Product Exact → MongoDB text index
case "product_exact":
  → MongoDB $text search operator

// Comparisons → Multiple product retrieval
case "product_comparison":
  → Extract product names from query
  → Fetch all matching products
  → Return for side-by-side comparison

// Recommendations → MongoDB sorting
case "product_recommendation":
  → Find {}.sort({ rating: -1, salesCount: -1 })

// Order Tracking → Order DB filtered by userId
case "order_tracking":
  → Order.find({ userId: currentUser._id }).sort({ createdAt: -1 })

// General → LLM only (no DB lookup)
case "general":
  → Skip retrieval, straight to LLM
```

### 3. **Context Fusion** (`contextBuilder.js`)
Combines retrieved data with metadata for enhanced LLM context.

**Enrichment:**
- Adds retrieval type information
- Counts retrieved items
- Includes source information
- Attaches user context

### 4. **LLM Response Generator** (`chatbotLLM.js`)
Generates contextual responses based on retrieval results.

**Response Templates:**
- **Product Semantic**: Lists products with features, ratings, price
- **Product Exact**: Detailed single product with specifications
- **Comparison**: Table format comparison of multiple products
- **Recommendation**: Top N products with ratings
- **Order Tracking**: Status updates with delivery timelines
- **Order Support**: Support options and order details
- **User Account**: Profile information summary
- **General**: Knowledge-base answers

### 5. **Vector Store** (`vectorStore.js`)
Offline embeddings using Xenova/transformers for semantic search.

**Collections:**
- `product_embeddings` - Product vectors + metadata
- `order_embeddings` - Order vectors for order-related queries

**Methods:**
```javascript
semanticSearch(embedding, k=5)     // Find top K similar products
semanticOrderSearch(embedding, k)  // Find similar orders
upsertEmbedding(productId, emb)   // Save product vector
```

### 6. **RAG Initializer** (`ragInitializer.js`)
Runs on server startup to embed all products for semantic search.

**Process:**
1. Fetch all products from database
2. Combine title + description + features into text
3. Embed using Xenova/all-MiniLM-L6-v2
4. Store in product_embeddings collection

---

## Data Flow Example

### Scenario 1: User asks "laptop with good battery life"

1. **Intent Detection** → `product_semantic` (confidence: 0.85)
2. **Adaptive Router**
   - Route: `product_vector_db`
   - Embed query → [0.123, 0.456, ...]
   - Search similar products in vector DB
   - Return: [Laptop A, Laptop B, Laptop C] with similarity scores
3. **Context Fusion**
   - Type: `product_semantic`
   - Items: 3 laptops
   - Metadata: `{retrievalType: "semantic_similarity"}`
4. **LLM Response**
   ```
   I found 3 products based on your search for: **laptop with good battery life**
   
   1. MacBook Pro 14"
      ₹1,99,999 ⭐ 4.8/5
      Lightning-fast processor and all-day battery life...
   ```

### Scenario 2: User asks "compare iPhone 15 and Samsung S24"

1. **Intent Detection** → `product_comparison` (confidence: 0.90)
2. **Adaptive Router**
   - Extract names: ["iPhone", "Samsung"]
   - Query: `{title: {$in: ["iPhone 15", "Samsung S24"]}}`
   - Return: [iPhone 15, Samsung S24]
3. **Context Fusion**
   - Type: `product_comparison`
   - Items: 2 products
4. **LLM Response**
   ```
   | Feature | iPhone 15 | Samsung S24 |
   |---------|----------|------------|
   | Price   | ₹79,999  | ₹84,999    |
   | Rating  | 4.7/5    | 4.6/5      |
   ```

### Scenario 3: User asks "Where is my order"

1. **Intent Detection** → `order_tracking` (confidence: 0.95)
2. **Adaptive Router**
   - Query: `Order.find({userId: currentUser._id})`
   - Return: [Order1, Order2, Order3]
3. **LLM Response**
   ```
   📦 Your Orders
   
   Order #A1B2C3
   ➳ Status: Shipped
   💰 Amount: ₹4,999
   📅 Date: Feb 10, 2026
   📍 Expected: Feb 15, 2026
   ```

---

## Configuration & Setup

### Server Startup
```javascript
// server.js automatically initializes RAG:
const { initializeRAG } = require("./rag/ragInitializer");

connectDB();
setTimeout(() => {
  initializeRAG().catch(console.error);
}, 2000);
```

### Dependencies Required
```json
{
  "@xenova/transformers": "^2.x.x",  // For embeddings
  "cosine-similarity": "^1.1.x",     // For vector similarity
  "mongoose": "^7.x.x"               // For MongoDB
}
```

### Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/electromart
JWT_SECRET=your_secret_key
PORT=5000
```

---

## API Endpoints

### Chat Endpoints

1. **Send Query & Get Response**
   ```
   POST /api/chatbot
   Body: { query: "show me gaming laptops" }
   Response: {
     response: "Formatted answer...",
     intent: "product_semantic",
     confidence: 0.85,
     retrievalMethod: "semantic_similarity",
     datapoints: 5
   }
   ```

2. **Get User's Chats**
   ```
   GET /api/chatbot/chats/all
   Headers: Authorization: Bearer <token>
   Response: [{ _id, title, messages, createdAt, updatedAt }, ...]
   ```

3. **Create New Chat**
   ```
   POST /api/chatbot/chats/create
   Body: { title: "My Chat" }
   Response: { _id, title, messages: [], createdAt }
   ```

4. **Update Chat with Messages**
   ```
   PUT /api/chatbot/chats/update/:id
   Body: { messages: [...] }
   Response: Updated chat object
   ```

5. **Delete Chat**
   ```
   DELETE /api/chatbot/chats/delete/:id
   Response: { message: "Chat deleted successfully" }
   ```

---

## Performance Optimizations

### 1. Vector Caching
- Product embeddings cached in MongoDB
- Reused for every semantic search query
- Reduces embedding computation overhead

### 2. Text Indexing
- MongoDB text indexes on `title` and `description`
- Instant exact match retrieval
- Index created automatically on Product model

### 3. Lazy Loading
- RAG initialized 2 seconds after DB connection
- Non-blocking, doesn't delay server startup
- Can be triggered manually via API

### 4. Embedding Reuse
- One embedding per product
- Queries embedded on-the-fly
- Cosine similarity computed in-memory

---

## Monitoring & Logging

All operations log to console:

```
[Intent] product_semantic (confidence: 0.85)
[Route] product_vector_db [Type] product_semantic
[Response] Generated 245 characters
```

Check server logs for:
- Intent detection confidence
- Routing decisions
- Retrieved data count
- Response generation

---

## Future Enhancements

1. **Fine-tuned Embeddings** - Train model on e-commerce queries
2. **User Preferences** - Personalize recommendations based on history
3. **Feedback Loop** - Improve intent detection from user feedback
4. **Context Window** - Remember conversation history for multi-turn
5. **Caching** - Redis for frequent queries
6. **Analytics** - Track query patterns and popular intents

---

## Troubleshooting

### No products returned in semantic search
- Check if products are embedded: `db.product_embeddings.count()`
- Run `initializeRAG()` to re-embed all products
- Verify Xenova/transformers is installed

### Slow semantic search
- Reduce number of products or batch embed
- Use MongoDB text index for exact match instead
- Consider Redis caching for popular queries

### Intent not detected correctly
- Add keywords to INTENT_RULES in intentDetector.js
- Increase confidence threshold if needed
- Check query logs for pattern analysis

---

## Code Examples

### Using the RAG System
```javascript
const { detectIntent } = require("./rag/intentDetector");
const { buildContext } = require("./rag/contextBuilder");
const { generateFinalAnswer } = require("./rag/chatbotLLM");

async function askChatbot(query, userId) {
  const intent = await detectIntent(query);
  const context = await buildContext(query, intent, { userId });
  const answer = await generateFinalAnswer({ query, intent, context });
  return answer;
}
```

### Manually Embedding a Product
```javascript
const { refreshProductEmbedding } = require("./rag/ragInitializer");

// After product is created/updated:
await refreshProductEmbedding(productId);
```

---

**Implementation Date:** February 12, 2026  
**Status:** ✅ Complete and Production Ready
