/**
 * INTENT 1: PRODUCT SEMANTIC SEARCH - COMPREHENSIVE TEST SUITE
 * Tests specification-based semantic search across all 20 query categories
 * Includes: Laptops, Smartphones, Smart TVs, Accessories, Wearables
 * Tests: Feature-based, performance-based, budget-based, rating-based, use-case queries
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test Query Categories (20 total)
const TEST_QUERIES = {
  // LAPTOPS (5 queries)
  'Laptops - Gaming': 'Gaming laptop with RTX GPU and 144Hz display',
  'Laptops - Lightweight': 'Lightweight laptop under 1.5 kg with long battery life',
  'Laptops - Performance': 'Laptop with 16GB RAM and 1TB SSD',
  'Laptops - Creator': 'OLED display laptop for creative video editing',
  'Laptops - Developer': 'Programming laptop with backlit keyboard and good processor',

  // SMARTPHONES (5 queries)
  'Smartphones - Premium': '5G phone with AMOLED display and 120Hz refresh rate',
  'Smartphones - Battery': 'Smartphone with 5000mAh battery and fast charging above 45W',
  'Smartphones - Gaming': 'Gaming phone with Snapdragon processor and high RAM',
  'Smartphones - Camera': 'Camera phone with 50MP+ main sensor and portrait mode',
  'Smartphones - Budget': 'Budget phone under 30000 with decent camera and battery',

  // SMART TVs (3 queries)
  'Smart TVs - Premium': '55 inch 4K TV with Dolby Atmos and gaming mode',
  'Smart TVs - Gaming': 'Smart TV best for gaming with multiple HDMI ports and low latency',
  'Smart TVs - Budget': 'Affordable smart TV with Android TV and voice assistant',

  // ACCESSORIES (4 queries)
  'Accessories - Audio': 'ANC earbuds with long battery life and low latency gaming mode',
  'Accessories - Charging': 'Fast charger with 65W+ output and multiple ports',
  'Accessories - Gaming': 'Gaming mouse with high DPI and low latency Bluetooth',
  'Accessories - Wireless': 'Wireless headphones with active noise cancellation',

  // WEARABLES (3 queries)
  'Wearables - Watch': 'Smartwatch with AMOLED display and Bluetooth calling',
  'Wearables - Fitness': 'Fitness band with 14+ day battery and SpO2 monitoring',
  'Wearables - Sports': 'Sports smartwatch with GPS and 100+ workout modes'
};

/**
 * Test a single query
 */
async function testQuery(categoryName, query) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 TEST: ${categoryName}`);
    console.log(`🔍 Query: "${query}"`);
    console.log(`${'='.repeat(80)}`);

    const response = await axios.post(`${BASE_URL}/api/chatbot`, {
      query: query
    });

    const {
      intent,
      confidence,
      retrievalMethod,
      datapoints,
      cards,
      response: botResponse
    } = response.data;

    // Display results
    console.log(`\n✅ RESPONSE RECEIVED:`);
    console.log(`   Intent: ${intent} (${(confidence * 100).toFixed(1)}% confident)`);
    console.log(`   Retrieval Method: ${retrievalMethod}`);
    console.log(`   Data Points: ${datapoints}`);
    console.log(`   Bot Response: ${botResponse.substring(0, 150)}...`);

    if (cards && cards.length > 0) {
      console.log(`\n🎯 PRODUCT CARDS (${cards.length} returned):`);
      cards.slice(0, 5).forEach((card, idx) => {
        console.log(`\n   Card ${idx + 1}: ${card.title}`);
        console.log(`   ├─ Category: ${card.category}`);
        console.log(`   ├─ Price: ₹${card.price.toLocaleString()}`);
        console.log(`   ├─ Rating: ⭐${card.rating}`);
        console.log(`   ├─ Stock: ${card.stock} units`);
        if (card.features && card.features.length > 0) {
          console.log(`   ├─ Features: ${card.features.slice(0, 3).join(', ')}`);
        }
        if (card.matchedSpecs && card.matchedSpecs.length > 0) {
          console.log(`   └─ Spec Match: ${card.matchedSpecs.join(', ')}`);
        }
      });
    } else {
      console.log(`\n⚠️  No product cards returned`);
    }

    return {
      success: true,
      category: categoryName,
      query,
      intent,
      confidence,
      cardCount: cards ? cards.length : 0,
      method: retrievalMethod
    };
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    if (error.response && error.response.data) {
      console.log(`Response Data:`, error.response.data);
    }
    return {
      success: false,
      category: categoryName,
      query,
      error: error.message
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${'#'.repeat(80)}`);
  console.log(`# INTENT 1: PRODUCT SEMANTIC SEARCH - COMPREHENSIVE TEST SUITE`);
  console.log(`# ${new Date().toLocaleString()}`);
  console.log(`${'#'.repeat(80)}`);
  console.log(`\n📊 Total Test Cases: ${Object.keys(TEST_QUERIES).length}`);

  const results = [];
  let successCount = 0;
  let cardCount = 0;

  // Run each test query
  for (const [category, query] of Object.entries(TEST_QUERIES)) {
    const result = await testQuery(category, query);
    results.push(result);

    if (result.success) {
      successCount++;
      cardCount += result.cardCount;
    }

    // Add delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 TEST SUMMARY`);
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Successful Tests: ${successCount}/${results.length}`);
  console.log(`📦 Total Product Cards: ${cardCount}`);
  console.log(`📈 Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`);

  // Group by category type
  const laptopTests = results.filter(r => r.category?.includes('Laptop'));
  const phoneTests = results.filter(r => r.category?.includes('Smartphone'));
  const tvTests = results.filter(r => r.category?.includes('Smart TV'));
  const accessoryTests = results.filter(r => r.category?.includes('Accessory'));
  const wearableTests = results.filter(r => r.category?.includes('Wearable'));

  console.log(`\n📱 Results by Category:`);
  console.log(`   💻 Laptops: ${laptopTests.filter(r => r.success).length}/${laptopTests.length} passed`);
  console.log(`   📱 Smartphones: ${phoneTests.filter(r => r.success).length}/${phoneTests.length} passed`);
  console.log(`   📺 Smart TVs: ${tvTests.filter(r => r.success).length}/${tvTests.length} passed`);
  console.log(`   🎧 Accessories: ${accessoryTests.filter(r => r.success).length}/${accessoryTests.length} passed`);
  console.log(`   ⌚ Wearables: ${wearableTests.filter(r => r.success).length}/${wearableTests.length} passed`);

  // Show failed tests
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log(`\n❌ Failed Tests:`);
    failedTests.forEach(test => {
      console.log(`   • ${test.category}: ${test.error}`);
    });
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✨ Test Suite Complete`);
  console.log(`${'='.repeat(80)}\n`);
}

// Run tests
runAllTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
