/**
 * Specification-Based Semantic Matcher
 * Matches user queries against product specifications in each category
 * Provides intelligent filtering based on extracted specifications from natural language
 */

const { ProductEmbeddingModel } = require('./vectorStore');

// Lazy load embedQuery to avoid circular dependencies
let embedQueryFn = null;
const getEmbedQuery = async () => {
  if (!embedQueryFn) {
    // Lazy load from adaptiveRouter to avoid circular dependency at module load time
    embedQueryFn = require('./adaptiveRouter').embedQuery;
  }
  return embedQueryFn;
};

// Specification keywords and matching patterns per category
const SPEC_PATTERNS = {
  Laptops: {
    processor: ['processor', 'cpu', 'intel', 'amd', 'ryzen', 'core i5', 'core i7', 'core i9', 'm1', 'm2', 'm3', 'apple'],
    ram: ['\\d+\\s*gb\\s*ram', 'memory', '\\d+gb'],
    storage: ['\\d+\\s*tb', '\\d+\\s*gb\\s*ssd', 'ssd', '\\dssd'],
    gpu: ['rtx', 'gtx', 'nvidia', 'radeon', 'intel iris', 'amd radeon', 'gpu', 'graphics'],
    display: ['oled', 'retina', 'ips', 'qhd', 'fhd', '1080p', '4k', 'display', 'screen'],
    refresh_rate: ['\\d+hz', '60hz', '120hz', '144hz', '165hz', '240hz'],
    battery_life: ['battery', '\\d+\\s*hrs?', 'long battery', 'endurance'],
    weight: ['light', 'portable', '\\d+\\.?\\d*\\s*kg', 'under\\s*\\d+', 'lightweight'],
    best_for: ['gaming', 'programming', 'video editing', 'office', 'business', 'creative', 'travel', 'student']
  },
  Smartphones: {
    processor: ['snapdragon', 'apple a\\d+', 'processor', 'chip', 'a\\d+', 'gen\\s*\\d+'],
    ram: ['\\d+\\s*gb\\s*ram', '\\d+gb', 'memory'],
    display: ['amoled', 'oled', 'retina', 'ips', '1080p', '4k', 'display'],
    refresh_rate: ['\\d+hz', '60hz', '90hz', '120hz', '144hz'],
    rear_camera: ['\\d+mp', 'camera', 'megapixel', '50mp', '108mp', '13mp'],
    battery_capacity: ['\\d+\\s*mah', 'battery', '\\d+mah'],
    charging: ['\\d+w', 'fast charge', 'charging', 'watts?'],
    network: ['5g', '4g', 'network', 'connectivity'],
    water_resistance: ['ip\\d+', 'waterproof', 'water resistant', 'ip67', 'ip68']
  },
  'Smart TVs': {
    display_size: ['\\d+\\s*inch', '43\\s*inch', '50\\s*inch', '55\\s*inch', '65\\s*inch', '75\\s*inch'],
    display_type: ['led', 'qled', 'oled', 'uled'],
    resolution: ['4k', '\\b8k\\b', 'uhd', 'full hd', 'fhd'],
    refresh_rate: ['\\d+hz', '60hz', '120hz'],
    gaming_mode: ['gaming', 'gamer'],
    voice_assistant: ['alexa', 'google assistant', 'voice', 'smart', 'ai'],
    sound_output: ['dolby', 'sound', 'speaker', '\\d+w']
  },
  Accessories: {
    accessory_type: ['earbuds', 'headphones', 'speaker', 'charger', 'power bank', 'mouse', 'keyboard', 'webcam'],
    connectivity: ['wireless', 'bluetooth', 'wired', 'latency'],
    battery_life: ['\\d+\\s*hrs?', 'battery', 'endurance', '\\d+\\s*mah'],
    noise_cancellation: ['anc', 'noise cancellation', 'earpads'],
    water_resistance: ['waterproof', 'ip\\d+', 'water resistant'],
    usage: ['gaming', 'office', 'calls', 'music', 'meetings']
  },
  Wearables: {
    wearable_type: ['smartwatch', 'watch', 'fitness band', 'band', 'tracker'],
    display_type: ['oled', 'amoled', 'lcd', 'retina'],
    battery_life: ['\\d+\\s*days?', 'battery', 'endurance', '\\d+\\s*hrs?'],
    sports_modes: ['sports', 'workouts', 'modes'],
    health_tracking: ['health', 'heart rate', 'spo2', 'blood oxygen', 'step tracker', 'sleep'],
    bluetooth_calling: ['calling', 'call', 'voice']
  }
};

/**
 * Extract specifications from user query
 * @param {String} query - User's natural language query
 * @param {String} category - Product category
 * @returns {Object} - Extracted specifications with confidence scores
 */
function extractSpecifications(query, category) {
  const queryLower = query.toLowerCase();
  const specs = {};
  const patterns = SPEC_PATTERNS[category] || {};

  for (const [spec, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      if (regex.test(queryLower)) {
        specs[spec] = true;
        break;
      }
    }
  }

  return specs;
}

/**
 * Score products based on specification matches
 * @param {Array} products - List of products to score
 * @param {Object} extractedSpecs - Extracted specifications
 * @param {String} category - Product category
 * @returns {Array} - Products sorted by specification match score
 */
function scoreBySpecifications(products, extractedSpecs, category) {
  return products.map(product => {
    let score = 0;
    let matchedSpecs = [];

    for (const [spec, required] of Object.entries(extractedSpecs)) {
      if (required && product.specifications && product.specifications[spec]) {
        score += 1;
        matchedSpecs.push(spec);
      }
    }

    return {
      ...product,
      specScore: score,
      matchedSpecs: matchedSpecs,
      // Combine with existing rating for final score
      finalScore: (score * 0.6) + (product.rating * 0.4)
    };
  }).sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Match query against product specifications
 * @param {Array} products - Products to match against
 * @param {String} query - User query
 * @param {String} category - Product category
 * @returns {Array} - Top 10 matching products
 */
async function specificationSemanticMatch(products, query, category) {
  try {
    // Extract specifications from the query
    const extractedSpecs = extractSpecifications(query, category);

    // If specifications found, use specification-based scoring
    if (Object.keys(extractedSpecs).length > 0) {
      const filteredBySpecs = scoreBySpecifications(products, extractedSpecs, category);
      return filteredBySpecs.slice(0, 10);
    }

    // Fallback to simple keyword matching if no specs found
    const productsWithScores = products.map(product => {
      // Simple keyword-based matching
      const productText = `${product.name} ${product.category} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
      let similarityScore = 0;

      // Check for keyword matches
      const queryWords = query.toLowerCase().split(/\s+/);
      const productWords = productText.split(/\s+/);
      
      for (const word of queryWords) {
        if (productWords.some(w => w.includes(word) || word.includes(w))) {
          similarityScore += 0.1;
        }
      }

      return {
        ...product,
        similarity: Math.min(similarityScore, 1),
        finalScore: similarityScore
      };
    });

    return productsWithScores.sort((a, b) => b.finalScore - a.finalScore).slice(0, 10);
  } catch (error) {
    console.error('[SpecMatcher] Error matching specifications:', error);
    // Return top-rated products as fallback
    return products.sort((a, b) => b.rating - a.rating).slice(0, 10);
  }
}

/**
 * Extract critical specifications from a query for relevant categories
 * This helps identify which category the user is likely interested in
 * @param {String} query - User query
 * @returns {Object} - Object mapping categories to their specification matches
 */
function analyzeQueryForCategories(query) {
  const queryLower = query.toLowerCase();
  const categorySpecs = {};

  for (const [category, patterns] of Object.entries(SPEC_PATTERNS)) {
    const specs = {};
    let matchCount = 0;

    for (const [spec, keywords] of Object.entries(patterns)) {
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'gi');
        if (regex.test(queryLower)) {
          specs[spec] = true;
          matchCount++;
          break;
        }
      }
    }

    if (matchCount > 0) {
      categorySpecs[category] = {
        matchedSpecs: specs,
        confidence: Math.min(matchCount / Object.keys(patterns).length, 1)
      };
    }
  }

  return categorySpecs;
}

module.exports = {
  extractSpecifications,
  scoreBySpecifications,
  specificationSemanticMatch,
  analyzeQueryForCategories
};
