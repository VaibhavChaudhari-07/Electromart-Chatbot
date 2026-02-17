// Simple unit test for recommendation intent extraction (no DB needed)
const { extractDeviceCategory } = require("../rag/intentDetector");

// Helper to test just the extraction functions
function testCategoryExtraction() {
  const tests = [
    { query: "best phones under 30000", expectedCategory: "Smartphones" },
    { query: "best gaming laptops", expectedCategory: "Laptops" },
    { query: "smartwatches under 15000", expectedCategory: "Wearables" },
    { query: "best 4k tvs", expectedCategory: "Smart TVs" },
    { query: "best earbuds", expectedCategory: "Wearables" },
  ];

  console.log("🧪 Testing Category Extraction\n");
  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const category = extractDeviceCategory(test.query);
    const isPassed = category === test.expectedCategory;

    if (isPassed) {
      console.log(`✅ "${test.query}" → ${category}`);
      passed++;
    } else {
      console.log(`❌ "${test.query}" → got '${category}', expected '${test.expectedCategory}'`);
      failed++;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`);
  return failed === 0;
}

// Test price extraction regex
function testPriceExtraction() {
  const priceTests = [
    { query: "under 30000", expected: 30000 },
    { query: "under 50k", expected: 50000 },
    { query: "under 1 lakh", expected: 100000 },
    { query: "under 5 lakh", expected: 500000 },
    { query: "below 25000", expected: 25000 },
  ];

  console.log("🧪 Testing Price Extraction\n");
  let passed = 0;
  let failed = 0;

  priceTests.forEach(test => {
    // Test "under X lakh" format
    const lakhMatch = test.query.match(/(?:under|below|less than|cheaper than|up to)\s+([0-9]+)\s*lakh/i);
    let price = null;
    if (lakhMatch) {
      price = parseInt(lakhMatch[1], 10) * 100000;
    } else {
      // Test "under Xk" format
      const kMatch = test.query.match(/(?:under|below|less than|cheaper than|up to)\s+([0-9]+)\s*k(?!b)/i);
      if (kMatch) {
        price = parseInt(kMatch[1], 10) * 1000;
      } else {
        // Test "under XXXXX" format
        const directMatch = test.query.match(/(?:under|below|less than|cheaper than|up to)\s+\₹?\\s*([0-9,]+)\b/i);
        if (directMatch) {
          price = parseInt(directMatch[1].replace(/,/g, ''), 10);
        }
      }
    }

    const isPassed = price === test.expected;
    if (isPassed) {
      console.log(`✅ "${test.query}" → ₹${price?.toLocaleString()}`);
      passed++;
    } else {
      console.log(`❌ "${test.query}" → got ₹${price}, expected ₹${test.expected}`);
      failed++;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${priceTests.length} tests\n`);
  return failed === 0;
}

// Run tests
console.log("=" .repeat(60));
console.log("RECOMMENDATION EXTRACTION UNIT TESTS (No DB Required)");
console.log("=".repeat(60) + "\n");

const categoryPass = testCategoryExtraction();
const pricePass = testPriceExtraction();

console.log("=" .repeat(60));
if (categoryPass && pricePass) {
  console.log("\n✅ All unit tests passed!\n");
  process.exit(0);
} else {
  console.log("\n❌ Some tests failed\n");
  process.exit(1);
}
