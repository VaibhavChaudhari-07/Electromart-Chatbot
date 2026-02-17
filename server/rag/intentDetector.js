// server/rag/intentDetector.js - Adaptive RAG Intent Detection
const Product = require("../models/Product");

const INTENT_RULES = [
  // Order-related intents (must be checked BEFORE product intents due to keyword overlap)
  {
    intent: "order_tracking",
    keywords: ["track", "order", "delivery", "shipped", "where is", "status", "my order"],
    confidence: 0.95,
  },
  {
    intent: "order_support",
    keywords: ["return order", "refund order", "cancel order", "replace order", "issue with order", "order issue"],
    confidence: 0.9,
  },

  // Product comparison intents
  {
    intent: "product_comparison",
    keywords: ["compare", "which is better", "difference", "vs", "versus"],
    confidence: 0.9,
  },

  // Product recommendation intents
  {
    intent: "product_recommendation",
    keywords: ["recommend", "suggest", "best", "top", "popular"],
    confidence: 0.85,
  },

  // Product exact match intents
  {
    intent: "product_exact",
    keywords: ["show me", "get", "buy", "purchase", "product name"],
    confidence: 0.85,
  },

  // Product semantic search (features, specs) - BROAD MATCHING
  {
    intent: "product_semantic",
    keywords: ["features", "specs", "specifications", "price range", "budget", "with", "and", "display", "battery", "processor", "ram", "storage", "gpu", "camera", "refresh", "charge", "weight", "latency"],
    confidence: 0.85,
  },

  // Account-related intents
  {
    intent: "user_account",
    keywords: ["account", "profile", "address", "update", "email", "phone"],
    confidence: 0.9,
  },
];

async function detectIntent(query) {
  const q = query.toLowerCase().trim();

  // **INTENT 0 (HIGHEST PRIORITY): Recommendation** - Check FIRST if "best", "top", "recommend" keywords present
  // These are strong signals for recommendation intent and should take precedence
  const strongRecKeywords = ['best', 'top', 'recommend', 'suggestion', 'suggest'];
  const hasStrongRecKeyword = strongRecKeywords.some(kw => q.includes(kw));
  
  if (hasStrongRecKeyword) {
    try {
      const rec = await detectRecommendationIntent(q);
      if (rec) {
        return rec;
      }
    } catch (e) {
      console.error('Recommendation extraction error:', e.message);
    }
  }

  // Check for comparison keywords - if present, prioritize comparison intent
  const strongComparisonKeywords = ['compare', 'comparison', 'vs', 'versus', 'vs '];
  const hasComparisonKeyword = strongComparisonKeywords.some(kw => q.includes(kw));

  // **INTENT 3: Product Comparison** - Check if query is asking to compare products
  // If query has comparison keywords, ALWAYS try comparison intent first (don't fall back to exact)
  if (hasComparisonKeyword) {
    try {
      const comparisonMatch = await detectComparisonIntent(q);
      if (comparisonMatch) {
        return comparisonMatch;
      }
    } catch (err) {
      console.error("Error detecting comparison intent:", err.message);
    }
    // If comparison intent is detected but can't find products, still return as comparison
    return {
      intent: 'product_comparison',
      confidence: 0.90,
      reason: 'Comparison keyword detected but unable to find matching products',
      productIds: [],
      matchedProducts: [],
      deviceCategory: null
    };
  }

  // **INTENT 2: Product Exact** - Only check exact if NO comparison keywords
  try {
    const exactMatch = await detectExactProductIntent(q);
    if (exactMatch) {
      return exactMatch;
    }
  } catch (err) {
    console.error("Error detecting exact product intent:", err.message);
  }

  // Product-related keywords - check first to avoid false matches on "order_support" etc
  const productKeywords = ["laptop", "phone", "smartphone", "tv", "television", "earbuds", "headphones", "watch", "smartwatch", "charger", "mouse", "keyboard", "speaker", "monitor", "accessory", "wearable", "device", "gadget"];
  const isProductQuery = productKeywords.some(kw => q.includes(kw));

  // Try rule-based matching, but prioritize product semantic if it looks like a product spec query
  if (isProductQuery && (q.includes("with ") || q.includes(" and ") || q.includes("dpi") || q.includes("hz") || q.includes("w+") || q.includes("%") || q.includes("day"))) {
    return { intent: "product_semantic", confidence: 0.9, reason: "Product specification query detected" };
  }

  for (const rule of INTENT_RULES) {
    for (const kw of rule.keywords) {
      if (q.includes(kw)) {
        // Skip order_support matches if this is a product query
        if (rule.intent === "order_support" && isProductQuery) {
          continue;
        }
        // Skip recommendation intent here since we already checked it above
        if (rule.intent === 'product_recommendation') {
          continue;
        }

        return { intent: rule.intent, confidence: rule.confidence, reason: `Matched keyword: ${kw}` };
      }
    }
  }

  // If query seems to ask about products (without specific intent)
  if (isProductQuery) {
    return { intent: "product_semantic", confidence: 0.7, reason: "Product-related query" };
  }

  return { intent: "general", confidence: 0.3, reason: "No specific intent matched" };
}

// Cache for product titles to avoid repeated DB queries
let productTitleCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Fuzzy string matching - checks if query contains product name with tolerance
 */
function fuzzyMatch(query, productTitle, threshold = 0.7) {
  const q = query.toLowerCase();
  const p = productTitle.toLowerCase();
  
  if (q.includes(p) || p.includes(q)) return true; // Exact substring match
  
  // Check if all/most words in product title appear in query (order-independent)
  const titleWords = p.split(/\s+/).filter(w => w.length > 2);
  if (titleWords.length === 0) return false;
  
  const queryWords = q.split(/\s+/);
  const matchedWords = titleWords.filter(word => 
    queryWords.some(qw => qw.includes(word) || word.includes(qw))
  );
  
  return matchedWords.length / titleWords.length >= threshold;
}

/**
 * Check if query contains product SKU/number pattern at end
 */
function extractSkuNumber(text) {
  const match = text.match(/(\d+)\s*$/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Load cached product titles from DB
 */
async function getProductTitles() {
  const now = Date.now();
  
  // Return cache if fresh
  if (productTitleCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productTitleCache;
  }
  
  try {
    const products = await Product.find().select("_id title name brand category").lean();
    productTitleCache = products.map(p => ({
      id: p._id,
      title: p.title || p.name,
      name: p.name,
      brand: p.brand,
      category: p.category,
      fullText: `${p.brand || ''} ${p.title || p.name || ''}`.toLowerCase(),
    }));
    cacheTimestamp = now;
    return productTitleCache;
  } catch (err) {
    console.error("Error loading product titles:", err.message);
    return [];
  }
}

/**
 * Detect if query is asking for an exact product
 */
async function detectExactProductIntent(query) {
  const productTitles = await getProductTitles();
  
  // 1. Direct exact title match
  for (const prod of productTitles) {
    if (fuzzyMatch(query, prod.title, 0.85)) {
      return {
        intent: "product_exact",
        confidence: 0.95,
        reason: "Exact product title match: " + prod.title,
        productId: prod.id,
        productTitle: prod.title,
      };
    }
  }
  
  // 2. Brand + model match (e.g., "Dell Legion 5 1")
  const brandModelMatch = productTitles.find(prod => 
    fuzzyMatch(query, `${prod.brand} ${prod.title}`, 0.80)
  );
  if (brandModelMatch) {
    return {
      intent: "product_exact",
      confidence: 0.92,
      reason: "Brand + model match: " + brandModelMatch.title,
      productId: brandModelMatch.id,
      productTitle: brandModelMatch.title,
    };
  }
  
  // 3. Partial match without SKU (e.g., "Yoga Slim 7" matching "Apple Yoga Slim 7 2")
  const skuNum = extractSkuNumber(query);
  const withoutSku = skuNum ? query.replace(/\s+\d+\s*$/, '') : query;
  
  const partialMatches = productTitles.filter(prod => 
    fuzzyMatch(withoutSku, prod.title, 0.75)
  ).slice(0, 5);
  
  if (partialMatches.length === 1) {
    return {
      intent: "product_exact",
      confidence: 0.88,
      reason: "Partial product match: " + partialMatches[0].title,
      productId: partialMatches[0].id,
      productTitle: partialMatches[0].title,
    };
  } else if (partialMatches.length > 1 && skuNum) {
    // Multiple matches + SKU narrows it down (use SKU as index)
    const idx = Math.min(skuNum - 1, partialMatches.length - 1);
    const selected = partialMatches[idx];
    if (selected) {
      return {
        intent: "product_exact",
        confidence: 0.85,
        reason: "SKU-based match: " + selected.title,
        productId: selected.id,
        productTitle: selected.title,
      };
    }
  }
  
  // 4. Commerce query for exact product (buy, price, stock, warranty, details, specs, info)
  const commerceKeywords = ["buy", "price", "cost", "offer", "emi", "stock", "warranty", "details", "specs", "info", "show", "get", "display", "provide"];
  const isCommerce = commerceKeywords.some(kw => query.includes(kw));
  
  if (isCommerce) {
    for (const prod of productTitles) {
      if (fuzzyMatch(query, prod.title, 0.75)) {
        return {
          intent: "product_exact",
          confidence: 0.87,
          reason: "Commerce query for product: " + prod.title,
          productId: prod.id,
          productTitle: prod.title,
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract product names from comparison queries
 * Handles: "Product A vs Product B", "Compare Product A and Product B", etc.
 */
function extractProductNames(query) {
  const q = query.toLowerCase();
  
  // Remove comparison keywords (including 'vs' variants) but preserve the separators
  const cleanQuery = q
    .replace(/\b(compare|comparison|versus|between|against|vs|v)\b/g, '|')
    .replace(/\b(and|or|,)\b/g, '|')
    .replace(/vs\.?/g, '|');
  
  // Split by delimiters and filter empty strings
  const parts = cleanQuery
    .split(/\|/)
    .map(s => s.trim())
    .filter(s => s.length > 2 && s.length < 100);
  
  // Remove common non-product words
  const nonProductWords = ['phones', 'laptops', 'tvs', 'watches', 'earbuds', 'headphones', 'speakers', 'tablets', 'cameras', 'which', 'better', 'best', 'good', 'bad', 'for', 'with', 'comparison', 'compare', 'phone', 'laptop', 'tv', 'watch'];
  
  const productNames = parts.filter(part => {
    const word = part.split(/\s+/)[0];
    return !nonProductWords.includes(word);
  });

  // Return with explicit count of products mentioned
  return {
    names: productNames,
    count: productNames.length
  };
}

/**
 * Extract device category from query (phone, laptop, tv, etc.)
 * Prioritizes exact matches and handles brand-to-category mappings
 */
function extractDeviceCategory(query) {
  const q = query.toLowerCase();
  
  // Enhanced category keywords with more aliases
  const categoryMap = {
    'Smartphones': [
      'phone', 'smartphone', 'mobile', 'cellphone', 'android phone', 'ios',
      'iphone', 'galaxy', 'pixel', 'oneplus', 'realme', 'xiaomi', 'poco', 'redmi', 'vivo', 'oppo',
      'nokia', 'motorola', 's24', 's23', 's22', 'a14', 'a15', 'a16', 'note', 'iphone 15', 'iphone 14'
    ],
    'Laptops': [
      'laptop', 'notebook', 'book', 'computer',
      'macbook', 'xps', 'legion', 'envy', 'thinkpad', 'omen', 'rog', 'razer',
      'gaming laptop', 'ultrabook', 'chromebook', 'dell', 'hp', 'asus', 'lenovo', 'acer',
      'surface', 'inspiron', 'pavilion'
    ],
    'Smart TVs': [
      'tv', 'smart tv', 'television', 'led tv', 'qled', 'oled', '4k tv',
      'display', '4k', '8k', 'oled', 'qled', 'mini led', 'lg tv', 'samsung tv', 'sony tv'
    ],
    'Wearables': [
      'watch', 'smartwatch', 'smartband', 'fitness band', 'band', 'tracker', 'fitness tracker',
      'airpods', 'earbuds', 'earphones', 'wireless earbuds', 'true wireless',
      'headphones', 'headset', 'neckband'
    ],
    'Accessories': [
      'charger', 'cable', 'adapter', 'case', 'screen protector', 'tempered glass',
      'power bank', 'charging', 'accessory', 'cover', 'stand', 'mount', 'holder'
    ]
  };
  
  // Multi-word phrase priorities
  const phraseMap = {
    'Smartphones': ['best phone', 'best smartphone', 'top phone', 'phone under', 'smartphone under'],
    'Laptops': ['best laptop', 'top laptop', 'laptop under', 'gaming laptop'],
    'Smart TVs': ['best tv', 'top tv', 'tv under', '4k tv'],
    'Wearables': ['best watch', 'smartwatch', 'best earbuds', 'wireless earbuds']
  };
  
  // Check for exact multi-word phrases first
  for (const [category, phrases] of Object.entries(phraseMap)) {
    if (phrases.some(phrase => q.includes(phrase))) {
      return category;
    }
  }
  
  // Check for single keyword matches
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => q.includes(kw))) {
      return category;
    }
  }
  
  return null;
}

/**
 * Detect if query is asking for comparison of products
 */
async function detectComparisonIntent(query) {
  const q = query.toLowerCase();
  
  // Check for strong comparison keywords
  const strongComparisonKeywords = ['compare', 'comparison', 'vs', 'versus', 'between'];
  const hasStrongComparison = strongComparisonKeywords.some(kw => q.includes(kw));
  
  // Check for weak comparison keywords
  const weakComparisonKeywords = ['which', 'better', 'difference', 'should i buy', 'vs ', 'diff', 'prefer', 'advantage'];
  const hasWeakComparison = weakComparisonKeywords.some(kw => q.includes(kw));
  
  // Need at least one comparison keyword to consider this a comparison
  if (!hasStrongComparison && !hasWeakComparison) {
    return null;
  }
  
  // Extract potential product names
  const productNamesData = extractProductNames(query);
  const productNames = productNamesData.names;
  const expectedProductCount = productNamesData.count;
  
  // For weak comparison keywords, we need at least 2 product names
  if (!hasStrongComparison && productNames.length < 2) {
    return null;
  }
  
  // For strong comparison keywords, try harder to find products
  if (hasStrongComparison && productNames.length === 0) {
    return null;
  }
  
  // Detect device category from query (e.g., "phone", "laptop", "tv")
  const deviceCategory = extractDeviceCategory(query);
  
  // Get cached product titles
  const productTitles = await getProductTitles();
  
  // If no product names extracted, try brand-based extraction for implicit comparisons
  let candidateProducts = [];
  
  if (productNames.length === 0 && (hasWeakComparison || hasStrongComparison)) {
    // Try to find brand names in query for implicit comparisons
    const brands = ['apple', 'samsung', 'dell', 'hp', 'lenovo', 'asus', 'sony', 'bose', 'oneplus', 'xiaomi', 'realme', 'iphone', 'ipad', 'macbook', 'galaxy', 'pixel'];
    const foundBrands = brands.filter(b => q.includes(b));
    
    if (foundBrands.length >= 2) {
      // Find products with these brands, filtered by category if detected
      for (const brand of foundBrands) {
        let brandProducts = productTitles.filter(p => 
          (p.brand && p.brand.toLowerCase().includes(brand)) ||
          (p.title && p.title.toLowerCase().includes(brand))
        );
        
        // Filter by category if detected
        if (deviceCategory) {
          brandProducts = brandProducts.filter(p => p.category === deviceCategory);
        }
        
        if (brandProducts.length > 0) {
          candidateProducts.push(brandProducts[0]);
        }
      }
    }
  } else {
    // Match extracted product names - STRICT ONE-TO-ONE MATCHING
    // Only return exactly as many products as explicitly mentioned in the query
    const matchedProducts = [];
    const usedProductIds = new Set();
    
    for (const name of productNames) {
      // Build filtered product list based on category
      let productsToSearch = productTitles;
      if (deviceCategory) {
        productsToSearch = productTitles.filter(p => p.category === deviceCategory);
      }
      
      // Exclude already matched products to avoid duplicates
      productsToSearch = productsToSearch.filter(p => !usedProductIds.has(p.id.toString()));
      
      // Remove SKU numbers from name for better matching
      const nameWithoutSku = name.replace(/\s+\d{1,3}\s*$/, '').trim();
      
      let matchedProduct = null;
      
      // 1. EXACT match with SKU number (e.g., "HP Envy 13 10" matches exactly)
      matchedProduct = productsToSearch.find(prod => 
        fuzzyMatch(name, prod.title, 0.88)
      );
      
      if (matchedProduct) {
        matchedProducts.push(matchedProduct);
        usedProductIds.add(matchedProduct.id.toString());
        continue;
      }
      
      // 2. Exact/fuzzy match on product title (with SKU removed)
      matchedProduct = productsToSearch.find(prod => {
        const prodWithoutSku = prod.title.replace(/\s+\d{1,3}\s*$/, '').trim();
        return fuzzyMatch(nameWithoutSku, prodWithoutSku, 0.70);
      });
      
      if (matchedProduct) {
        matchedProducts.push(matchedProduct);
        usedProductIds.add(matchedProduct.id.toString());
        continue;
      }
      
      // 3. Try full name match including SKU
      matchedProduct = productsToSearch.find(prod => 
        fuzzyMatch(name, prod.title, 0.68)
      );
      
      if (matchedProduct) {
        matchedProducts.push(matchedProduct);
        usedProductIds.add(matchedProduct.id.toString());
        continue;
      }
      
      // 4. Try partial match on brand
      const brandMatches = productsToSearch.filter(prod => 
        prod.brand && fuzzyMatch(nameWithoutSku, prod.brand, 0.75)
      );
      
      if (brandMatches.length > 0) {
        matchedProduct = brandMatches[0];
        matchedProducts.push(matchedProduct);
        usedProductIds.add(matchedProduct.id.toString());
        continue;
      }
      
      // 5. Fuzzy match with lower threshold
      const fuzzyMatches = productsToSearch.filter(prod => {
        const prodWithoutSku = prod.title.replace(/\s+\d{1,3}\s*$/, '').trim();
        return fuzzyMatch(nameWithoutSku, prodWithoutSku, 0.52);
      });
      
      if (fuzzyMatches.length > 0) {
        matchedProduct = fuzzyMatches[0];
        matchedProducts.push(matchedProduct);
        usedProductIds.add(matchedProduct.id.toString());
      }
    }
    
    candidateProducts = matchedProducts;
  }
  
  // Return intent only if we found exactly the requested number of products (min 2)
  // STRICT: No more, no less than what was mentioned in the query
  const limitedProducts = candidateProducts.slice(0, expectedProductCount || 2);
  
  if (limitedProducts.length >= 2) {
    return {
      intent: 'product_comparison',
      confidence: 0.92,
      reason: `Comparison of ${limitedProducts.length} products detected`,
      productIds: limitedProducts.map(p => p.id),
      productTitles: limitedProducts.map(p => p.title),
      matchedProducts: limitedProducts,
      deviceCategory: deviceCategory,
    };
  }
  
  // If we have comparison intent but couldn't find enough products
  if (hasStrongComparison) {
    return {
      intent: 'product_comparison',
      confidence: 0.75,
      reason: 'Comparison intent detected but unable to find multiple products',
      productNames: productNames,
      deviceCategory: deviceCategory,
    };
  }
  
  return null;
}

/**
 * Detect recommendation intent and extract constraints
 * Enhanced to handle: category, price (k/lakh/₹/number), brands, use-cases, ratings
 */
async function detectRecommendationIntent(query) {
  const q = query.toLowerCase();

  // Enhanced recommendation keywords including implicit ones
  const recKeywords = [
    'recommend', 'recommendation', 'best', 'top', 'top rated', 'suggest', 'suggestion',
    'recommend me', 'recommendations', 'top 5', 'top 10', 'best for', 'good', 'should buy',
    'perfect', 'excellent', 'great', 'must have', 'popular'
  ];
  const hasRec = recKeywords.some(kw => q.includes(kw));
  if (!hasRec) return null;

  // Extract category if any (high priority)
  const category = extractDeviceCategory(query);

  // Enhanced budget extraction supporting: "under 50000", "under 50k", "under 5 lakh", "₹50000", etc.
  let priceLimit = null;
  
  // Try "under/below X lakh" format
  const lakhMatch = query.match(/(?:under|below|less than|cheaper than|up to)\s+([0-9]+)\s*lakh/i);
  if (lakhMatch) {
    priceLimit = parseInt(lakhMatch[1], 10) * 100000;
  } else {
    // Try "under X k" format
    const kMatch = query.match(/(?:under|below|less than|cheaper than|up to)\s+([0-9]+)\s*k(?!b)/i);
    if (kMatch) {
      priceLimit = parseInt(kMatch[1], 10) * 1000;
    } else {
      // Try "under ₹X" or "under XXXXX" format
      const rupeesMatch = query.match(/(?:under|below|less than|cheaper than|up to)\s+₹?\s*([0-9,]+)\b/i);
      if (rupeesMatch) {
        priceLimit = parseInt(rupeesMatch[1].replace(/,/g, ''), 10);
      } else {
        // Try "between X and Y" format
        const betweenMatch = query.match(/between\s+₹?\s*([0-9,]+)\s+(?:and|to)\s+₹?\s*([0-9,]+)/i);
        if (betweenMatch) {
          // Use upper limit as priceLimit
          priceLimit = parseInt(betweenMatch[2].replace(/,/g, ''), 10);
        }
      }
    }
  }

  // Enhanced brand extraction - more brands and fuzzy matching
  const allBrands = [
    'apple', 'samsung', 'dell', 'hp', 'lenovo', 'asus', 'oneplus', 'xiaomi', 'realme',
    'sony', 'bose', 'acer', 'msi', 'razer', 'lg', 'panasonic', 'motorola', 'nokia',
    'poco', 'redmi', 'realme', 'vivo', 'oppo', 'iphone', 'macbook', 'ipad'
  ];
  const foundBrands = allBrands.filter(b => q.includes(b));

  // Enhanced use-case extraction
  const allUseCases = [
    'gaming', 'programming', 'students', 'office', 'video editing', 'content creation',
    'travel', 'battery', 'camera', 'photography', 'fitness', 'sports', 'music',
    'professional', 'work', 'study', 'heavy use', 'light use', 'streaming', 'editing'
  ];
  const foundUseCases = allUseCases.filter(u => q.includes(u));

  // Extract rating-focused constraints
  const ratingMatch = q.match(
    /(above|over|greater than|atleast|minimum)\s*([0-9]\.?[0-9]?)\s*(?:star|rating|\*)?|([0-9]\.?[0-9]?)\s*(?:\+|plus|and above)\s*(?:star|rating|\*)?/i
  );
  let minRating = null;
  if (ratingMatch) {
    const ratingVal = parseFloat(ratingMatch[2] || ratingMatch[3]);
    if (ratingVal >= 1 && ratingVal <= 5) {
      minRating = ratingVal;
    }
  }

  // Boost confidence if category is found
  let confidence = 0.88;
  if (category) confidence = 0.92;
  if (category && priceLimit) confidence = 0.95;

  return {
    intent: 'product_recommendation',
    confidence,
    reason: 'Recommendation intent detected',
    category,
    priceLimit,
    brands: foundBrands,
    useCases: foundUseCases,
    minRating,
  };
}

module.exports = { detectIntent, detectExactProductIntent, detectComparisonIntent, detectRecommendationIntent };
