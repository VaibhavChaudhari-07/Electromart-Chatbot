// Comprehensive test suite for all intents
const http = require("http");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const User = require("../models/User");

let testUserId = null;

async function setup() {
  try {
    await connectDB();
    const testUser = await User.findOne({ email: "test@example.com" });
    if (testUser) {
      testUserId = testUser._id.toString();
    }
  } catch (err) {
    console.error("Setup error:", err.message);
  }
}

async function makeRequest(query, userId = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      query: query,
      ...(userId && { userId }),
    });

    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/chatbot",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: "JSON parse error" });
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  await setup();

  console.log("\n🧪 COMPREHENSIVE INTENT TESTING\n");
  console.log("=" .repeat(70));

  const testSuites = [
    {
      name: "COMPARISON INTENT",
      emoji: "🔄",
      tests: [
        { query: "Compare Dell Legion 5 1 and HP Envy 13 10", expectedIntent: "product_comparison" },
        { query: "HP Envy 13 32 vs Dell XPS 13 14", expectedIntent: "product_comparison" },
        { query: "Samsung Galaxy S6 versus iPhone 15", expectedIntent: "product_comparison" },
      ],
    },
    {
      name: "RECOMMENDATION INTENT",
      emoji: "⭐",
      tests: [
        { query: "Best phones under 30000", expectedIntent: "product_recommendation" },
        { query: "best gaming laptops under 1 lakh", expectedIntent: "product_recommendation" },
        { query: "Top smartwatches for fitness", expectedIntent: "product_recommendation" },
        { query: "Best 4K TVs under 50000", expectedIntent: "product_recommendation" },
      ],
    },
    {
      name: "ORDER TRACKING INTENT",
      emoji: "📦",
      tests: [
        { query: "Track my order", expectedIntent: "order_tracking", needsAuth: true },
        { query: "Where is my Dell Legion order", expectedIntent: "order_tracking", needsAuth: true },
        { query: "Order status", expectedIntent: "order_tracking", needsAuth: true },
        { query: "Delivery update", expectedIntent: "order_tracking", needsAuth: true },
      ],
    },
  ];

  let totalPassed = 0;
  let totalTests = 0;

  for (const suite of testSuites) {
    console.log(`\n${suite.emoji} ${suite.name}`);
    console.log("-".repeat(70));

    let suitePassed = 0;

    for (const test of suite.tests) {
      totalTests++;
      try {
        const userId = test.needsAuth ? testUserId : null;
        const response = await makeRequest(test.query, userId);

        if (response.error) {
          console.log(`  ❌ "${test.query}"`);
          console.log(`     Error: ${response.error}`);
          continue;
        }

        const intent = response.intent;
        const isCorrect = intent === test.expectedIntent;

        if (isCorrect) {
          suitePassed++;
          totalPassed++;
          const cardCount = response.cards?.length || 0;
          console.log(
            `  ✅ "${test.query.substring(0, 50)}${test.query.length > 50 ? "..." : ""}"`
          );
          console.log(`     Intent: ${intent} | Cards: ${cardCount}`);
        } else {
          console.log(
            `  ❌ "${test.query.substring(0, 50)}${test.query.length > 50 ? "..." : ""}"`
          );
          console.log(`     Expected: ${test.expectedIntent}, Got: ${intent}`);
        }
      } catch (err) {
        console.log(`  ❌ "${test.query.substring(0, 50)}..."`);
        console.log(`     Exception: ${err.message}`);
      }
    }

    console.log(
      `\n  Suite Result: ${suitePassed}/${suite.tests.length} passed (${((suitePassed / suite.tests.length) * 100).toFixed(0)}%)`
    );
  }

  console.log("\n" + "=".repeat(70));
  console.log(`\n📊 OVERALL RESULTS: ${totalPassed}/${totalTests} tests passed (${((totalPassed / totalTests) * 100).toFixed(1)}%)\n`);

  if (totalPassed === totalTests) {
    console.log("🎉 ALL TESTS PASSED! Order tracking intent is fully functional.\n");
  }

  process.exit(totalPassed === totalTests ? 0 : 1);
}

setTimeout(runTests, 2000);
