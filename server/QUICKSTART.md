# 🎬 QuickStart Guide - Testing Adaptive RAG Chatbot

## 📍 Current Status
✅ Server running on http://localhost:5000  
✅ MongoDB connected and initialized  
✅ 1000 products embedded and ready for semantic search  
✅ All 7+ intent types implemented  
✅ Test cases prepared with expected outputs  

---

## 🚀 Ready to Test? Here's How:

### Option 1: Test via Browser (Easiest)

1. **Open Chatbot**
   ```
   Frontend: http://localhost:5173
   Click "AI Assistant" button (bottom right)
   ```

2. **Try These Sample Queries:**
   - `"laptop with good battery life"` → Should return semantic matches
   - `"MacBook Pro 14"` → Should return exact product
   - `"compare iPhone 15 and Samsung S24"` → Should show comparison
   - `"what is your return policy?"` → Should show policy (no DB retrieval)

3. **With Login (Order-Related Queries):**
   - Login with your test account
   - Try: `"track my order"` → Shows your orders
   - Try: `"I want to return my order"` → Shows return options

---

### Option 2: Test via cURL Commands

#### Test 1: Semantic Search (No Login Required)
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"query":"laptop with good battery life and fast processor"}'

EXPECTED RESPONSE:
{
  "response": "I found 5 products matching 'laptop with good battery'...",
  "intent": "product_semantic",
  "confidence": 0.92,
  "retrievalMethod": "semantic_similarity",
  "datapoints": 5
}
```

#### Test 2: Exact Product Match
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"query":"MacBook Pro 14 inch"}'

EXPECTED RESPONSE:
{
  "response": "Found: MacBook Pro 14\" with full specifications...",
  "intent": "product_exact",
  "confidence": 0.95,
  "retrievalMethod": "exact",
  "datapoints": 1
}
```

#### Test 3: Product Comparison
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"query":"compare iPhone 15 and Samsung S24"}'

EXPECTED RESPONSE:
{
  "response": "⚖️ COMPARISON TABLE...",
  "intent": "product_comparison",
  "confidence": 0.89,
  "retrievalMethod": "comparison",
  "datapoints": 2
}
```

#### Test 4: Product Recommendation
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"query":"recommend the best laptops"}'

EXPECTED RESPONSE:
{
  "response": "⭐ TOP 5 RECOMMENDED LAPTOPS...",
  "intent": "product_recommendation",
  "confidence": 0.88,
  "retrievalMethod": "recommendation",
  "datapoints": 5
}
```

#### Test 5: Order Tracking (WITH LOGIN)
```bash
# First, login to get JWT token
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Copy the JWT token from response
# Then use it to track orders:

curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"query":"track my order"}'

EXPECTED RESPONSE:
{
  "response": "📦 YOUR ORDERS (3 Recent Orders)...",
  "intent": "order_tracking",
  "confidence": 0.94,
  "retrievalMethod": "order_db",
  "datapoints": 3
}
```

#### Test 6: General Knowledge Query (No DB)
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"query":"what is your return policy?"}'

EXPECTED RESPONSE:
{
  "response": "📋 ABOUT OUR RETURN POLICY...",
  "intent": "general",
  "confidence": 0.87,
  "retrievalMethod": "none",
  "datapoints": 0
}
```

---

## 📊 What to Look For (Success Criteria)

### ✅ Semantic Search (Best Indicator)
```
Query: "laptop with good battery and processor"
Expected Behavior:
- Intent: product_semantic
- Confidence: >0.85
- Returns: 5 products (top matches by vector similarity)
- Response: Includes prices, ratings, features
- NO database errors in console
```

### ✅ Exact Match
```
Query: "MacBook Pro 14"
Expected Behavior:
- Intent: product_exact
- Returns: 1 exact product
- Response: Full specification details
- Confidence: >0.90
```

### ✅ Comparison
```
Query: "Compare iPhone and Samsung"
Expected Behavior:
- Intent: product_comparison
- Returns: 2 products in table format
- Response: Side-by-side comparison
- Includes winner recommendation
```

### ✅ Order Tracking (With Login)
```
Query: "track my order"
Expected Behavior:
- Requires valid JWT token
- Returns user's orders only
- Shows status, dates, delivery info
- No other users' orders visible
```

### ✅ Guest User Protection
```
Query (As Guest): "track my order"
Expected Behavior:
- Shows: "Please log in to track orders"
- Does NOT show any order data
```

---

## 🔍 Monitor Console Logs

### Good Logs (What You Should See)
```
✅ [Intent Detection] Query accepted
✅ [Adaptive Router] Route selected
✅ [Vector Search] Found 5 similar products
✅ [Database] Query executed successfully
✅ [Response Generated] Formatted response ready
```

### Bad Logs (Troubleshooting)
```
❌ [Embedding] Error embedding product
   → Embedding failed (non-blocking - product still created)
   → Check MongoDB connection
   
❌ Cannot read property 'embedQuery' of undefined
   → embeddingManager import failed
   → Check file path in controller
   
❌ ECONNREFUSED 127.0.0.1:27017
   → MongoDB not running
   → Start MongoDB service
```

---

## 📋 Test Plan (Copy to Your Testing Document)

### Run These in Order:

#### Batch 1: General Queries (No Auth Required)
- [ ] Semantic search: `"laptop with good battery"`
- [ ] Semantic search: `"camera with low light"`
- [ ] Exact match: `"MacBook Pro 14"`
- [ ] Exact match: `"iPhone 15 Pro Max"`
- [ ] Comparison: `"compare iPhone and Samsung"`
- [ ] Recommendation: `"recommend best laptops"`
- [ ] General: `"what is your return policy?"`
- [ ] General: `"do you offer free shipping?"`

#### Batch 2: Authenticated Queries (With JWT Token)
- [ ] Order tracking: `"track my order"`
- [ ] Order support: `"I want to return"`
- [ ] Order support: `"delivery issue"`
- [ ] User account: `"show my profile"`

#### Batch 3: Edge Cases
- [ ] Guest user order tracking (should fail gracefully)
- [ ] Empty query (should return error)
- [ ] Typo query: `"MCBook Pro"` (semantic search should still work)
- [ ] Mixed intent: `"I ordered a laptop but have an issue"`

#### Batch 4: Verify Embedding in New Products
- [ ] Create new product via admin panel
- [ ] Check console for: `[Embedding] Created embedding for product`
- [ ] Query with product features: `"your new product features"`
- [ ] Verify it appears in results (proves embedding works)

---

## 🎯 Embedding System Verification

### Check 1: Product Auto-Embedding on Create
```
1. Go to Admin Dashboard
2. Add New Product
3. Check server console for:
   [Embedding] Created embedding for product: {product_title}
4. Now query with product features
5. New product should appear in results
```

### Check 2: Order Auto-Embedding on Create
```
1. Place an order (as logged-in user)
2. Check server console for:
   [Embedding] Created embedding for order: {orderId}
3. Query "track my order"
4. New order should appear in results
```

### Check 3: Verify in MongoDB
```bash
# Connect to MongoDB
mongo

# Switch to ElectroMartChatbot database
use ElectroMartChatbot

# Count product embeddings
db.product_embeddings.count()
# Should show ≥ 1000 (products at startup + new ones)

# Count order embeddings
db.order_embeddings.count()
# Should show all orders created

# View a sample embedding
db.product_embeddings.findOne()
# Should show: { productId, embedding: [...], metadata: {...} }
```

---

## 📈 Expected Results Summary

| Test Type | Intent | Response Time | Success Indicator |
|-----------|--------|----------------|-------------------|
| Semantic | product_semantic | <2s | 5 matching products |
| Exact | product_exact | <1s | Exact product found |
| Comparison | product_comparison | <1.5s | Table with comparison |
| Recommendation | product_recommendation | <1s | Top 5 by rating |
| Order Track | order_tracking | <1.5s | User's orders shown |
| Order Support | order_support | <1.5s | Support options shown |
| Account | user_account | <1s | Profile displayed |
| General | general | <0.5s | LLM answer given |

---

## 🚨 Troubleshooting Quick Guide

### Issue: Server crashes on startup
**Solution:**
1. Check MongoDB is running: `mongod`
2. Check port 5000 is free: `netstat -ano | findstr :5000`
3. Kill existing process: `taskkill /PID [PID] /F`
4. Restart server: `npm start`

### Issue: Queries return errors
**Solution:**
1. Check console logs for specific error
2. Verify JWT token if testing authenticated queries
3. Check MongoDB connection: `db.adminCommand("ping")`

### Issue: Semantic search not returning new products
**Solution:**
1. Check product exists in DB: `db.products.findOne({ title: "..." })`
2. Check embedding exists: `db.product_embeddings.findOne({ productId: ObjectId("...") })`
3. Check console for embedding errors: look for `[Embedding]` logs
4. Wait 1-2 seconds after creating product (embeddings async)

### Issue: "Please log in" for order queries
**Solution:**
1. Get JWT token: Login via /api/users/login
2. Copy token from response
3. Add header: `Authorization: Bearer {token}`
4. Retry query

---

## 🎓 Learning Resources

See these documentation files for detailed information:

1. **[TESTING.md](TESTING.md)** - Complete testing guide with examples
2. **[RAG_TEST_CASES.js](RAG_TEST_CASES.js)** - 35+ test scenarios with expected outputs
3. **[EMBEDDING_INTEGRATION.md](EMBEDDING_INTEGRATION.md)** - How embedding system works
4. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Full project overview

---

## ✅ Test Completion Checklist

- [ ] All semantic searches return relevant products
- [ ] Exact product names work
- [ ] Comparisons show side-by-side tables
- [ ] Recommendations sorted by rating
- [ ] Order tracking shows user's orders only
- [ ] Guest users can't see orders
- [ ] General queries don't hit database
- [ ] New products auto-embedded after creation
- [ ] New orders auto-embedded after creation
- [ ] Response times under 2 seconds
- [ ] No console errors or crashes

---

**🎉 Ready to test! Start with Batch 1 above.**

Questions? Check the troubleshooting section or review the documentation files.
