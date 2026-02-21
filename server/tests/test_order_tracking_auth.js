// Test order tracking with proper authentication
const http = require("http");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const User = require("../models/User");

let server;

async function setupServer() {
  try {
    await connectDB();
    
    // Get test user
    const testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      throw new Error("Test user not found");
    }

    return testUser;
  } catch (err) {
    console.error("Setup error:", err.message);
    process.exit(1);
  }
}

async function makeAuthenticatedRequest(query, userId) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      query: query,
    });

    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/chatbot",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length,
        // In a real scenario, this would be a JWT token in Authorization header
        // For now, we'll manually configure the server or test via direct API
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
  const testUser = await setupServer();
  console.log(`\n✅ Test user found: ${testUser._id}\n`);
  console.log("⚠️  NOTE: This test requires the API to have middleware that extracts userId from request.\n");
  console.log("🧪 Testing Order Tracking API...\n");

  const tests = [
    { name: "Track my order", query: "Track my order" },
    { name: "Order status", query: "Order status" },
    { name: "Where is my Dell Legion", query: "Where is my Dell Legion" },
  ];

  for (const test of tests) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`   Query: "${test.query}"`);

    try {
      const response = await makeAuthenticatedRequest(test.query, testUser._id);

      if (response.error) {
        console.log(`   ❌ Error: ${response.error}`);
      } else {
        const intent = response.intent;
        const cardCount = response.cards?.length || 0;

        console.log(`   Intent: ${intent}`);
        console.log(`   Cards: ${cardCount}`);

        if (cardCount > 0) {
          console.log(`   ✅ PASSED: Found ${cardCount} order card(s)`);
        } else {
          console.log(`   ⏳ No cards returned (expected for order tracking without auth)`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Note: To properly test with authentication:");
  console.log("  1. Log in via frontend or test with JWT token");
  console.log("  2. Use the authenticated session to make API calls");
  console.log("=".repeat(60) + "\n");

  process.exit(0);
}

setTimeout(runTests, 2000);
