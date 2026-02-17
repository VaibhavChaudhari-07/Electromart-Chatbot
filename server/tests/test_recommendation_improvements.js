// Test script for recommendation intent detection improvements
const { detectIntent } = require("../rag/intentDetector");
const { connectDB } = require("../config/db");

const testQueries = [
  // Phones queries
  {
    query: "Best phones under 30000",
    expectedIntent: "product_recommendation",
    expectedCategory: "Smartphones",
    expectedPrice: 30000,
  },
  {
    query: "best phones for photography",
    expectedIntent: "product_recommendation",
    expectedCategory: "Smartphones",
    expectedUseCases: ["photography"],
  },
  {
    query: "top smartphones under 25000",
    expectedIntent: "product_recommendation",
    expectedCategory: "Smartphones",
    expectedPrice: 25000,
  },
  
  // Laptop queries
  {
    query: "Best laptops under 80000",
    expectedIntent: "product_recommendation",
    expectedCategory: "Laptops",
    expectedPrice: 80000,
  },
  {
    query: "best gaming laptops under 1 lakh",
    expectedIntent: "product_recommendation",
    expectedCategory: "Laptops",
    expectedPrice: 100000,
    expectedUseCases: ["gaming"],
  },
  {
    query: "Top laptops for programming",
    expectedIntent: "product_recommendation",
    expectedCategory: "Laptops",
    expectedUseCases: ["programming"],
  },
  
  // Smartwatch queries
  {
    query: "Best smartwatches",
    expectedIntent: "product_recommendation",
    expectedCategory: "Wearables",
  },
  {
    query: "best smartwatches for fitness",
    expectedIntent: "product_recommendation",
    expectedCategory: "Wearables",
    expectedUseCases: ["fitness"],
  },
  {
    query: "Top smartwatches under 15000",
    expectedIntent: "product_recommendation",
    expectedCategory: "Wearables",
    expectedPrice: 15000,
  },
  
  // TV queries
  {
    query: "best 4k tvs under 50000",
    expectedIntent: "product_recommendation",
    expectedCategory: "Smart TVs",
    expectedPrice: 50000,
  },
  
  // Brand-specific
  {
    query: "Best apple phones under 40000",
    expectedIntent: "product_recommendation",
    expectedCategory: "Smartphones",
    expectedPrice: 40000,
    expectedBrands: ["apple"],
  },
];

async function runTests() {
  console.log("🧪 Testing Recommendation Intent Detection Improvements\n");
  console.log("=" .repeat(70));

  let passed = 0;
  let failed = 0;

  for (const test of testQueries) {
    try {
      const result = await detectIntent(test.query);
      
      // Validate
      let testPassed = true;
      const issues = [];

      if (result.intent !== test.expectedIntent) {
        testPassed = false;
        issues.push(`Intent: got '${result.intent}', expected '${test.expectedIntent}'`);
      }

      if (test.expectedCategory && result.category !== test.expectedCategory) {
        testPassed = false;
        issues.push(`Category: got '${result.category}', expected '${test.expectedCategory}'`);
      }

      if (test.expectedPrice && result.priceLimit !== test.expectedPrice) {
        testPassed = false;
        issues.push(`Price: got ${result.priceLimit}, expected ${test.expectedPrice}`);
      }

      if (test.expectedBrands && result.brands) {
        const brandsMatched = test.expectedBrands.every(b => result.brands.includes(b));
        if (!brandsMatched) {
          testPassed = false;
          issues.push(`Brands: got ${JSON.stringify(result.brands)}, expected ${JSON.stringify(test.expectedBrands)}`);
        }
      }

      if (test.expectedUseCases && result.useCases) {
        const useCasesMatched = test.expectedUseCases.every(u => result.useCases.includes(u));
        if (!useCasesMatched) {
          testPassed = false;
          issues.push(`UseCases: got ${JSON.stringify(result.useCases)}, expected ${JSON.stringify(test.expectedUseCases)}`);
        }
      }

      // Print result
      const status = testPassed ? "✅ PASS" : "❌ FAIL";
      console.log(`\n${status} | "${test.query}"`);
      
      if (issues.length > 0) {
        issues.forEach(issue => console.log(`       └─ ${issue}`));
        failed++;
      } else {
        passed++;
      }

      console.log(`       Result: intent=${result.intent}, category=${result.category}, confidence=${result.confidence}`);
      if (result.priceLimit) console.log(`       Price limit: ₹${result.priceLimit.toLocaleString()}`);
      if (result.brands && result.brands.length) console.log(`       Brands: ${result.brands.join(', ')}`);
      if (result.useCases && result.useCases.length) console.log(`       Use-cases: ${result.useCases.join(', ')}`);

    } catch (err) {
      console.log(`\n❌ ERROR | "${test.query}": ${err.message}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testQueries.length} tests`);
  console.log(`Success rate: ${((passed / testQueries.length) * 100).toFixed(1)}%\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Connect to DB and run tests
connectDB().then(() => {
  runTests();
}).catch(err => {
  console.error("❌ Database connection failed:", err.message);
  process.exit(1);
});
