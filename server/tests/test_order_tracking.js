// Test order tracking intent detection
const { detectOrderTrackingIntent } = require("../rag/intentDetector");

const testQueries = [
  // Direct order ID queries
  { query: "Track my order ORD12345", shouldMatch: true, expectedId: "ORD12345" },
  { query: "track order #98765", shouldMatch: true, expectedId: "98765" },
  { query: "Check order 45678 status", shouldMatch: true, expectedId: "45678" },
  { query: "where is my order ORD11223", shouldMatch: true, expectedId: "ORD11223" },
  { query: "shipping status ORD77889", shouldMatch: true, expectedId: "ORD77889" },
  
  // Conversational queries
  { query: "Can you track my package ORD12345", shouldMatch: true, expectedId: "ORD12345" },
  { query: "I want to track order ORD98765", shouldMatch: true, expectedId: "ORD98765" },
  { query: "delivery update ORD45678", shouldMatch: true, expectedId: "ORD45678" },
  
  // Product + order ID
  { query: "Track my Dell Legion 5 order ORD12345", shouldMatch: true, expectedId: "ORD12345", expectedProduct: "dell" },
  { query: "HP Envy order status ORD98765", shouldMatch: true, expectedId: "ORD98765", expectedProduct: "hp" },
  
  // Short format
  { query: "ORD12345 tracking", shouldMatch: true, expectedId: "ORD12345" },
  { query: "status ORD98765", shouldMatch: true, expectedId: "ORD98765" },
  
  // No order ID
  { query: "Track my order", shouldMatch: true, expectedId: null },
  { query: "check delivery status", shouldMatch: true, expectedId: null },
  
  // Non-matching queries
  { query: "What are the best phones", shouldMatch: false },
  { query: "Compare HP Envy with Dell Legion", shouldMatch: false },
];

async function runTests() {
  console.log("🧪 Testing Order Tracking Intent Detection\n");
  console.log("=".repeat(70));

  let passed = 0;
  let failed = 0;

  for (const test of testQueries) {
    try {
      const result = detectOrderTrackingIntent(test.query);
      
      let testPassed = true;
      const issues = [];

      // Check if it should match
      if (test.shouldMatch && !result) {
        testPassed = false;
        issues.push(`Expected to match but got null`);
      }

      if (!test.shouldMatch && result && result.orderId === null) {
        // This is fine - intent detected but no ID
        testPassed = true;
      } else if (!test.shouldMatch && result && result.orderId) {
        testPassed = false;
        issues.push(`Should not match but matched with ID: ${result.orderId}`);
      }

      // Check order ID if expected
      if (test.expectedId && result && result.orderId !== test.expectedId) {
        testPassed = false;
        issues.push(`Order ID: got '${result.orderId}', expected '${test.expectedId}'`);
      }

      // Check product if expected
      if (test.expectedProduct && result && !result.mentionedProduct?.includes(test.expectedProduct)) {
        testPassed = false;
        issues.push(`Product: got '${result.mentionedProduct}', expected to include '${test.expectedProduct}'`);
      }

      // Print result
      const status = testPassed ? "✅ PASS" : "❌ FAIL";
      console.log(`\n${status} | "${test.query}"`);

      if (issues.length > 0) {
        issues.forEach(issue => console.log(`       └─ ${issue}`));
        failed++;
      } else {
        if (result) {
          console.log(`       Order ID: ${result.orderId || 'None'}`);
          if (result.mentionedProduct) console.log(`       Product: ${result.mentionedProduct}`);
          console.log(`       Confidence: ${result.confidence}`);
        }
        passed++;
      }

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

runTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
