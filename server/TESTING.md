# 🧪 Adaptive RAG Chatbot - Complete Testing Guide

## Overview
This document provides comprehensive testing procedures for the ElectroMart Adaptive RAG Chatbot system with 9 intent types, 8 retrieval methods, and edge case handling.

---

## 📊 Test Categories

### 1️⃣ **PRODUCT SEMANTIC SEARCH** - Vector Database Matching
**Intent:** `product_semantic`  
**Route:** `product_vector_db`  
**When Triggered:** Questions about product features/specs without exact product names

| Query | Expected Behavior | Response Example |
|-------|------------------|-----------------|
| "laptop with good battery life and fast processor" | Semantic search in vector DB, return top 5 similar products | "I found 5 laptops matching your criteria: battery life & processor speed..." |
| "budget gaming laptop under 50000" | Vector search for gaming laptops, filter by sentiment | "Gaming laptops with best value for money..." |
| "camera with great low light performance" | Find cameras with low-light specs | "Professional cameras optimized for low-light photography..." |
| "smartphone with excellent display quality" | Match phones with premium displays | "Premium smartphones with OLED/120Hz displays..." |

**Expected Response Format:**
```
🔍 Based on your search for: "laptop with good battery life"

I found 5 similar products:

1. **MacBook Pro 14" (M3 Max)**
   💰 Price: ₹139,990
   ⭐ Rating: 4.8/5
   ⚡ Features: 18-hour battery, Apple M3 Max processor, 10GB memory

2. **Dell XPS 13 Plus**
   💰 Price: ₹89,999
   ⭐ Rating: 4.6/5
   ⚡ Features: 12-hour battery, Intel Core i7, Lightweight design
   
[... 3 more products ...]
```

---

### 2️⃣ **PRODUCT EXACT MATCH** - MongoDB Text Index Search
**Intent:** `product_exact`  
**Route:** `mongodb_exact`  
**When Triggered:** Exact product name mentioned

| Query | Expected Data | Response Example |
|-------|---------------|-----------------|
| "MacBook Pro 14 inch" | Exact T Product match | Detailed spec sheet for this model |
| "iPhone 15 Pro Max" | 1-2 matching products | All colors, storage options, price |
| "Sony WH-1000XM5 headphones" | Single exact match | Complete audio specs, warranty |
| "Samsung 65 inch QLED TV" | 1-2 models | Resolution, refresh rate, features |

**Expected Response Format:**
```
📱 **iPhone 15 Pro Max** - EXACT MATCH

💰 Price: ₹139,999
⭐ Rating: 4.9/5
📦 In Stock: YES

**Specifications:**
- Screen: 6.7" Super Retina XDR display
- Processor: Apple A17 Pro chip
- Camera: 48MP main + 12MP ultra-wide + 12MP telephoto
- Battery: Up to 29 hours video playback
- Storage: 256GB, 512GB, 1TB options

**Warranty:** 1 Year Apple Care+

🛒 **Add to Cart** | 📌 **Save**
```

---

### 3️⃣ **PRODUCT COMPARISON** - Multiple Products from MongoDB
**Intent:** `product_comparison`  
**Route:** `mongodb_comparison`  
**When Triggered:** Comparing 2+ products ("vs", "compare", "better")

| Query | Matrix | Expected Table |
|-------|--------|----------------|
| "compare iPhone 15 and Samsung S24" | 7+ features | Side-by-side comparison table |
| "which is better MacBook or Dell XPS?" | Performance, price, build quality | Detailed pros/cons |
| "compare Sony and Canon cameras" | Sensor, autofocus, video | Feature-by-feature breakdown |
| "iPad vs Samsung tablet comparison" | OS, screen, performance, price | Recommendation included |

**Expected Response Format:**
```
⚖️ **COMPARISON: iPhone 15 Pro Max vs Samsung S24 Ultra**

| Feature | iPhone 15 | Samsung S24 | Winner |
|---------|-----------|-------------|--------|
| **Price** | ₹139,999 | ₹149,999 | iPhone 15 |
| **Processor** | Apple A17 Pro | Snapdragon 8 Gen 3 | Tie |
| **RAM** | 8GB | 12GB | Samsung |
| **Camera** | 48MP + triple lens | 200MP + quad lens | Samsung |
| **Battery** | 3,582 mAh | 4,900 mAh | Samsung |
| **Display** | 6.1" OLED 10-120Hz | 6.8" AMOLED 120Hz | Tie |
| **Price/Performance** | Better | Good | iPhone 15 |

**Recommendation:** 
- Choose **iPhone 15** if: You prefer iOS ecosystem, build quality, and value
- Choose **Samsung** if: You want more features, larger screen, and power
```

---

### 4️⃣ **PRODUCT RECOMMENDATION** - Top-Rated Products
**Intent:** `product_recommendation`  
**Route:** `recommendation_engine`  
**When Triggered:** "best", "recommend", "top", "popular" keywords

| Query | Expected Output | Sorting |
|-------|-----------------|---------|
| "recommend the best laptops" | Top 5 rated laptops | By rating ⭐ |
| "what are popular smartphones?" | 5 bestselling phones | By sales + rating |
| "suggest best budget laptops" | Value laptops sorted | By rating (budget range) |
| "top cameras for photography" | Professional cameras | By rating + features |

**Expected Response Format:**
```
⭐ **TOP 5 RECOMMENDED LAPTOPS**

1. 🥇 **MacBook Pro 14" M3 Max**
   Rating: ⭐⭐⭐⭐⭐ 4.8/5 (2,847 reviews)
   Price: ₹139,990
   Why Popular: Best performance, battery life, build quality

2. 🥈 **Dell XPS 15**
   Rating: ⭐⭐⭐⭐⭐ 4.7/5 (1,923 reviews)
   Price: ₹129,999
   Why Popular: Beautiful display, powerful GPU, great value

3. 🥉 **Lenovo ThinkPad X1 Carbon**
   Rating: ⭐⭐⭐⭐ 4.6/5 (1,654 reviews)
   Price: ₹99,999
   Why Popular: Business features, durability, keyboard

4. **HP Pavilion 15**
   Rating: ⭐⭐⭐⭐ 4.5/5 (948 reviews)
   Price: ₹79,999
   Why Popular: Budget-friendly, decent performance

5. **Asus VivoBook 15**
   Rating: ⭐⭐⭐⭐ 4.4/5 (715 reviews)
   Price: ₹59,999
   Why Popular: Student choice, lightweight, affordable

✨ Based on 7,187 customer reviews | Updated today
```

---

### 5️⃣ **ORDER TRACKING** - User Orders from MongoDB
**Intent:** `order_tracking`  
**Route:** `order_db`  
**When Triggered:** "track", "order status", "where is my delivery", "my order"  
**Requirement:** User must be logged in

| Query | Retrieved Data | Expected Display |
|-------|---|---|
| "track my order" | 3 recent orders | Order IDs, status, dates |
| "where is my delivery?" | Current active order | Shipping location, ETA |
| "show my order status" | All user orders | Timeline with stages |
| "what are my recent orders?" | Last 3-5 orders | Purchase history |

**Expected Response Format:**
```
📦 **YOUR ORDERS** (3 Recent Orders)

**Order #EM-2024-0847** - Status: 🚚 IN TRANSIT
├─ ✅ Order Placed: Jan 25, 2024
├─ ✅ Confirmed: Jan 25, 2024
├─ ✅ Shipped: Jan 26, 2024 (Flipkart Logistics)
├─ 🚚 In Transit: Expected Jan 29, 2024
└─ ⏳ Delivery: Jan 29-31, 2024

**Items:** MacBook Pro 14", iPhone 15, AirPods Pro
**Total:** ₹229,997
**Shipping To:** 123 Main St, Mumbai, 400001

---

**Order #EM-2024-0801** - Status: ✅ DELIVERED
├─ Order Date: Jan 18, 2024
├─ Delivered: Jan 21, 2024
└─ Delivered to: Your address

**Items:** Sony WH-1000XM5
**Total:** ₹24,999

---

**Order #EM-2024-0758** - Status: ⏳ PENDING
├─ Order Date: Jan 10, 2024
└─ Awaiting Confirmation

**Items:** Samsung 65" QLED TV
**Total:** ₹89,999
```

---

### 6️⃣ **ORDER SUPPORT** - Returns, Refunds, Cancellations
**Intent:** `order_support`  
**Route:** `order_support`  
**When Triggered:** "return", "refund", "cancel", "issue", "problem", "support"  
**Requirement:** User must be logged in

| Query | Support Type | Response |
|-------|---|---|
| "I want to return my order" | Return policy | 30-day return window, process, refund timeline |
| "how to cancel my order?" | Cancellation | Status check, eligibility, process |
| "I have an issue with my delivery" | Delivery support | Troubleshoot, filing complaint, escalation |
| "refund details for my order" | Refund info | Timeline, bank details, tracking |

**Expected Response Format:**
```
🔄 **RETURN & REFUND SUPPORT**

I found your recent order:
**Order #EM-2024-0847** - MacBook Pro 14" | ₹139,990

**Status:** ✅ ELIGIBLE FOR RETURN
✓ Within 30-day return window (Ordered: Jan 25)
✓ Product condition: New/unopened
✓ Accessories included

**How to Return:**
1. Login to your account → My Orders
2. Click "Return" on Order #EM-2024-0847
3. Choose reason: Defective/Not as expected/etc
4. Print return label
5. Ship back using provided label

**Refund Timeline:**
├─ 📦 Return approved: 1-2 days
├─ 🚚 In return transit: 3-5 days
├─ ✓ Inspection complete: 1-2 days
└─ 💰 Refund processed: 3-5 business days (Total: 8-14 days)

**Need Help?**
📞 Call: 1800-ELECTRO-1
💬 Chat: support.electromart.in
📧 Email: support@electromart.in
⏰ Hours: 9 AM - 9 PM (Mon-Sun)
```

---

### 7️⃣ **USER ACCOUNT** - Profile Information
**Intent:** `user_account`  
**Route:** `user_db`  
**When Triggered:** "my account", "my profile", "my details", "personal info"  
**Requirement:** User must be logged in

| Query | Data Shown | Privacy |
|-------|---|---|
| "show my account details" | Full profile | Name, email, phone, address |
| "what's my profile information?" | Account summary | All fields except password |
| "update my address in account" | Current address + edit link | Secure update form |

**Expected Response Format:**
```
👤 **YOUR ACCOUNT INFORMATION**

**Name:** Rajesh Kumar
**Email:** rajesh.kumar@email.com
**Phone:** +91 98765-43210
**Date of Birth:** June 15, 1990

**Default Address:**
📍 123 Main Street, Apt 4B
   Bandra, Mumbai, Maharashtra 400050
   India

**Account Status:** ✅ ACTIVE (Member since Jan 2020)

**Recent Activity:**
├─ Last Login: Today at 2:45 PM
├─ Last Purchase: Jan 25, 2024
└─ Last Updated: Jan 20, 2024

**Quick Actions:**
- 🔧 Edit Profile
- 📍 Manage Addresses
- 🔒 Change Password
- 📧 Email Preferences
- 📱 Phone Verification

**Need to Update?**
Click "Edit Profile" or go to Settings → Account
```

---

### 8️⃣ **GENERAL QUERIES** - LLM-Only Responses
**Intent:** `general`  
**Route:** `llm_only`  
**When Triggered:** Questions not matching other intents  
**Database Retrieval:** None (pure knowledge)

| Query | Response Type | Example Answer |
|-------|---|---|
| "how does online shopping work?" | Informational | 5-step explanation |
| "what payment methods do you accept?" | Service info | List: Cards, UPI, Wallets, etc |
| "what is your return policy?" | Policy | 30-day return window details |
| "do you offer free shipping?" | Service info | Conditions for free shipping |
| "how do I contact customer support?" | Contact info | Email, phone, hours, chat |

**Expected Response Format:**
```
📋 **ABOUT OUR RETURN POLICY**

We want you to shop with confidence! Here's our return policy:

**30-Day Return Guarantee**
You can return any product within 30 days of purchase for any reason.

**What's Returnable:**
✓ Unopened products with original packaging
✓ Products with all accessories and manuals
✓ Items purchased within last 30 days
✓ Products in original condition

**What's NOT Returnable:**
✗ Opened electronics (unless defective)
✗ Custom-built items
✗ Clearance/Sale items (30% discount or more)
✗ Items purchased >30 days ago

**Return Process:**
1. Login to your account
2. Go to Orders → Select order
3. Click "Initiate Return"
4. Choose reason and get return label
5. Ship back within 7 days of approval

**Refund Timeline:**
- Return accepted: 1-2 days
- In transit back: 3-5 days
- Inspection: 1-2 days
- Cash back: 3-5 business days
**Total: 8-14 working days**

Questions? Contact us 24/7!
```

---

### 9️⃣ **EDGE CASES** - Special Scenarios

#### Case A: Requesting order tracking WITHOUT login
```
Query: "track my order"
Expected: 
"🔐 To track your orders, please log in first.
[Login button] or [Signup]"
```

#### Case B: Comparison without product details
```
Query: "compare these"
Expected:
"I'd like to help you compare products! 
Could you specify which products you'd like to compare?"
```

#### Case C: Typos in product names
```
Query: "show me MacBok Pro" (typo: MacBok instead of MacBook)
Expected:
Semantic search still finds "MacBook Pro" via vector similarity
"Did you mean **MacBook Pro**? Here are similar products..."
```

#### Case D: Empty or single-word queries
```
Query: "" or "laptop"
Expected:
For "laptop": Returns 5 recommendations
For "": Error message "Please provide a query"
```

#### Case E: Mixed intent queries
```
Query: "I ordered a laptop but have an issue"
Expected:
Primary intent: order_support
Returns recent orders with support options
```

---

## 🎯 Testing Checklist

### Before Testing:
- [ ] Server running on http://localhost:5000
- [ ] MongoDB connected to ElectroMartChatbot
- [ ] All RAG modules initialized (intentDetector, adaptiveRouter, etc.)
- [ ] Test products embedded in vectorStore
- [ ] Test user account created with userId

### Test Execution:
- [ ] Semantic search returns relevant products
- [ ] Exact match returns precise product details
- [ ] Comparisons show all relevant features
- [ ] Recommendations sorted by rating
- [ ] Order tracking shows user's orders only
- [ ] Order support shows recent order context
- [ ] User account shows correct profile data
- [ ] General queries don't retrieve from DB
- [ ] Guest users can't access order tracking
- [ ] Typos resolved via semantic search

### Quality Checks:
- [ ] Responses include appropriate emojis
- [ ] Data formatted in tables/lists
- [ ] Prices in correct currency (₹)
- [ ] All links working (Edit, Add to Cart, etc.)
- [ ] Response time < 2 seconds
- [ ] No database errors in console
- [ ] No embedding errors logged

---

## 🔧 Testing via cURL

```bash
# Test semantic search
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"query":"laptop with good battery"}'

# Test with authentication (order tracking)
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"track my order"}'

# Test general query
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"query":"what is your return policy?"}'
```

---

## 📈 Expected Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Intent Detection Accuracy | >90% | High confidence scores |
| Response Time | <2 seconds | Including DB queries |
| Vector Search Relevance | >85% | Top 5 match user intent |
| False Positives | <5% | Wrong intent detection |
| Guest User Handling | 100% | No order data shown |
| Error Handling | <1% | Graceful fallback to LLM |

---

## 🚀 Next Steps After Testing

1. **Fine-tune Intent Detection** - Add more keywords based on test results
2. **Optimize Vector Search** - Adjust K (number of results) based on relevance
3. **Performance Testing** - Load test with 100+ concurrent queries
4. **User Feedback Loop** - Collect inaccurate intent predictions
5. **Caching Implementation** - Cache frequent queries and recommendations

---

**Created:** January 2024  
**Version:** 1.0  
**Status:** Ready for Testing ✅
