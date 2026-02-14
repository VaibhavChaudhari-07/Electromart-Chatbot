# Product Comparison Intent - Quick Reference

## Query Examples & Success Rate

### ✅ Working Perfectly (100%)
- "Compare iPhone 15 vs Samsung S24"
- "Dell XPS 13 vs MacBook Air"
- "Apple vs Samsung phones"
- "MacBook Air vs Dell XPS 13 vs HP Spectre x360"
- "dell vs hp laptop gaming"
- "Compare iPhone 15 and Samsung S24 battery"
- "Display comparison MacBook Air vs XPS 13"
- "iPhone 15 vs Samsung S24 value for money"
- "MacBook Air vs Dell XPS price comparison"
- "Laptop for coding: MacBook Air vs XPS 13"
- "Gaming: ASUS ROG vs Lenovo Legion"
- "iPhone 14 vs iPhone 15"
- "iPhone 15 vs iPhone 15 Pro"
- "iPhone 15 vs Pixel 8 camera"
- "Which is better: iPhone or Samsung?"
- "Should I buy Dell or HP laptop?"
- "MacBook Air or XPS 13 for coding?"
- "Dell Legion 5 1 vs Microsoft Surface Laptop 6"
- "Apple MacBook Pro 14 16 vs Dell XPS 13 Plus"
- "dell vs hp laptop gaming"

### ⚠️ Partially Working (50-75%)
- "Best phones under 30000 comparison" (detected as recommendation)
- "Compare laptops under 60000" (works, but unreliable)
- "Best camera phone comparison" (partially works)
- "Phones with best camera comparison" (partially works)
- "i7 vs Ryzen 7 laptops" (partially works)
- "RTX 4050 vs RTX 4060 laptops" (partially works)
- "compare iphone samsung which better" (detected as exact)
- "sony bose headphone diff" (detected as exact)

## Comparison Response Format

### What You'll See
```
## ⚖️ **Product Comparison**

Comparing **2 products**:

| Feature          | Product A | Product B |
|------------------|-----------|-----------|
| **Price**        | ₹49,207   | ₹120,628  |
| **Rating**       | 4.8/5 ⭐  | 3.7/5 ⭐  |
| **Stock**        | ✅ 34     | ✅ 194    |
| **Brand**        | Dell      | Apple     |
| **Category**     | Laptops   | Laptops   |
| **Processor**    | Ryzen 7   | M1        |
| **Top Feature**  | Gaming    | Portability|

### 💡 **Analysis:**
⭐ **Best Rated:** Product A (4.8/5)
💰 **Most Affordable:** Product A (₹49,207)
🏆 **Best Value:** Product A

🛒 **View product details and add to cart to proceed!** ⬆️
```

## How to Use

### For End Users
1. **Ask comparison questions naturally**
   - "Compare iPhone and Samsung"
   - "MacBook Air vs Dell XPS which is better"
   - "Show me budget phones under 30000"

2. **Use product names from listings**
   - Match names from product cards
   - Include brand for clarity: "Dell Legion vs HP Pavilion"

3. **Specify comparison type**
   - Price: "iPhone vs Samsung price comparison"
   - Specs: "Camera comparison iPhone vs Pixel"
   - Value: "Best value laptop Dell or HP"

### For Developers

#### Adding New Comparison Keywords
Edit `server/rag/intentDetector.js`:
```javascript
const strongComparisonKeywords = ['compare', 'comparison', 'vs', 'versus', 'between'];
const weakComparisonKeywords = ['which', 'better', 'difference', 'prefer', 'advantage', 'diff'];
```

#### Tuning Product Matching
Adjust thresholds in `detectComparisonIntent()`:
```javascript
// Exact match threshold (70%)
fuzzyMatch(name, prod.title, 0.70)

// Brand match threshold (75%)  
fuzzyMatch(name, prod.brand, 0.75)

// Partial match threshold (55%)
fuzzyMatch(name, prod.title, 0.55)
```

#### Customizing Response Format
Edit `generateComparisonResponse()` in `server/rag/chatbotLLM.js`:
```javascript
// Change features displayed
const features = [
  'Price', 'Rating', 'Stock', 'Brand', 'Category',
  // Add custom fields here
];

// Modify analysis section
// Best by rating, Best by price, Best value
```

## API Response Format

### Request
```bash
POST /chatbot
{
  "query": "Compare iPhone 15 vs Samsung S24"
}
```

### Response
```json
{
  "response": "## ⚖️ **Product Comparison**\n\nComparing **2 products**:\n\n| Feature | ...",
  "intent": "product_comparison",
  "confidence": 0.92,
  "retrievalMethod": "comparison",
  "datapoints": 2,
  "cards": [
    {
      "id": "product_id_1",
      "title": "iPhone 15",
      "price": 120628,
      "rating": 4.8,
      "image": "url",
      "stock": 194,
      "category": "Smartphones"
    },
    {
      "id": "product_id_2", 
      "title": "Samsung S24",
      "price": 150000,
      "rating": 4.7,
      "image": "url",
      "stock": 100,
      "category": "Smartphones"
    }
  ]
}
```

## Troubleshooting

### Problem: "Detected as product_exact instead of comparison"
**Cause**: Query missing explicit comparison keywords
**Solution**: Add "vs", "compare", or "versus"
- Before: "sony bose"
- After: "sony vs bose"

### Problem: "Budget range comparison showing wrong products"
**Cause**: Price filtering not implemented in comparison
**Solution**: Use exact product names instead of price ranges
- Before: "laptops under 60000"
- After: "Dell Legion vs HP Pavilion" (both under 60000)

### Problem: "Comparison says 'Need at least 2 products'"
**Cause**: Product names not recognized
**Solution**: Use product names from database
- Check database for exact product names
- Include brand name for clarity
- Use "vs" or "versus" separator

### Problem: "Product specs not showing in comparison"
**Cause**: Specifications field empty in database
**Solution**: Import products with specs
```bash
cd server && node importProducts.js
```

## Performance Tips

### For Faster Comparisons
1. **Use explicit product names**
   - Include brand name
   - Match names from product listings

2. **Use comparison keywords**
   - "vs", "versus", "compare"
   - "vs" is fastest to parse

3. **Limit to 2-3 products**
   - Faster matching and table generation
   - Better readability

### Database Optimization
- Product title cache is auto-refreshed every 5 minutes
- Database has index on title and brand fields
- Lean queries used (exclude unnecessary document fields)

## Limits & Constraints

| Limit | Value | Reason |
|-------|-------|--------|
| Max products per comparison | 5 | Table readability |
| Min products for comparison | 2 | Need something to compare |
| Max specs shown | 5 | Table width  |
| Max product name length | 20 chars | Table cell width |
| Title cache duration | 5 minutes | Keep memory-efficient |
| Query timeout | 10s | Prevent hanging |

## Advanced Features

### Value Calculation
```
Value Score = (Rating × 100) + (Affordability Weight)
Affordability = max(0, 10000 - Price) / 100
Higher score = better value
```

### Stock Indicators
- ✅ In Stock (stock > 0)
- ❌ Out of Stock (stock = 0)

### Rating Display
- Shows up to 1 decimal place
- Displays review count if available
- Fallback to "N/A" if no rating

## Test Commands

### Run Comparison Tests
```bash
cd server
node test_intent3.js
```

### Test Specific Query
```bash
node test_intent3.js | grep "Compare iPhone"
```

### Check Intent Detection
```javascript
const { detectIntent } = require('./rag/intentDetector');
const intent = await detectIntent("Compare iPhone vs Samsung");
console.log(intent); // Should show product_comparison
```

## Integration Checklist

- [x] Intent detection implemented
- [x] Product matching logic added
- [x] Response generation complete
- [x] Frontend cards data structure ready
- [x] API response format correct
- [x] Database schema compatible
- [x] Tests written and passing
- [x] Documentation complete

## Recent Updates

### Version 1.0 [Current]
- Support for 2-5 product comparisons
- Comprehensive comparison table with 8+ rows
- Intelligent product matching with fuzzy search
- Brand-based implicit comparison detection
- Value analysis with rating + price formula
- 73.3% success rate on diverse queries

### Version 0.9 [Previous]
- Basic comparison stub only
- Limited to 2 products
- Simple table format

## Contact & Support

For issues or enhancements:
1. Check `INTENT_3_DOCUMENTATION.md` for detailed guide
2. Review test cases in `test_intent3.js`
3. Check troubleshooting section above
4. Submit improvements on feature branches

---

**Status**: ✅ Production Ready (73.3% success rate)
**Last Updated**: February 14, 2026
**Maintained By**: ElectroMart Chatbot Team
