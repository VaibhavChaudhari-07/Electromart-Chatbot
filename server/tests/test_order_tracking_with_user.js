// Test order tracking with actual user ID
const http = require("http");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const User = require("../models/User");

async function getTestUserId() {
  try {
    await connectDB();
    const testUser = await User.findOne({ email: "test@example.com" });
    if (testUser) {
      return testUser._id.toString();
    }
    throw new Error("Test user not found");
  } catch (err) {
    console.error("Error getting test user:", err.message);
    process.exit(1);
  }
}

async function makeRequest(query, userId) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      query: query,
      userId: userId,
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
          resolve({ error: "JSON parse error", raw: data });
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  // Get test user ID
  const userId = await getTestUserId();
  console.log(`✅ Using test user ID: ${userId}\n`);

  console.log("🧪 Order Tracking with Real User ID\n");

  const tests = [
    { name: "Track my order", query: "Track my order" },
    { name: "Order status", query: "Order status" },
    { name: "Where is my Dell Legion", query: "Where is my Dell Legion" },
    { name: "Delivery update", query: "Delivery update" },
  ];

  let passed = 0;

  for (const test of tests) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log(`   Query: "${test.query}"`);

    try {
      const response = await makeRequest(test.query, userId);

      if (response.error) {
        console.log(`   ❌ Error: ${response.error}`);
        continue;
      }

      const intent = response.intent || response.data?.intent;
      const cardCount = response.data?.cards?.length || 0;

      console.log(`   ✅ Intent: ${intent}`);
      console.log(`   📦 Orders returned: ${cardCount}`);

      if (cardCount > 0) {
        const firstCard = response.data.cards[0];
        console.log(`   Title: ${firstCard.title}`);
        passed++;
        console.log(`   ✅ PASSED: Successfully retrieved order cards`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${passed}/${tests.length} tests passed`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(0);
}

setTimeout(runTests, 2000);
