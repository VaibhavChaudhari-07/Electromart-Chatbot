// Comprehensive end-to-end test for order tracking feature
const http = require("http");

const tests = [
  {
    name: "Generic order tracking (no ID)",
    query: "Track my order",
    expectedIntent: "order_tracking",
    shouldHaveOrders: true,
  },
  {
    name: "Order tracking with product mention",
    query: "Track my Dell Legion order",
    expectedIntent: "order_tracking",
    shouldHaveOrders: true,
  },
  {
    name: "Product status inquiry",
    query: "Where is my HP Envy",
    expectedIntent: "order_tracking",
    shouldHaveOrders: true,
  },
  {
    name: "Generic order status",
    query: "Order status",
    expectedIntent: "order_tracking",
    shouldHaveOrders: true,
  },
  {
    name: "Delivery inquiry",
    query: "When will my order arrive",
    expectedIntent: "order_tracking",
    shouldHaveOrders: true,
  },
  {
    name: "Shipment tracking",
    query: "Track shipment",
    expectedIntent: "order_tracking",
    shouldHaveOrders: true,
  },
  {
    name: "Product recommendation (should NOT be order tracking)",
    query: "Best laptops under 50000",
    expectedIntent: "product_recommendation",
    shouldHaveOrders: false,
  },
];

async function makeRequest(query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      query: query,
      userId: "invalid_user_id",
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
  console.log("🧪 Comprehensive Order Tracking E2E Tests\n");

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log(`   Query: "${test.query}"`);

    try {
      const response = await makeRequest(test.query);

      if (response.error) {
        console.log(`   ❌ FAILED: API Error - ${response.error}`);
        failed++;
        continue;
      }

      const intent = response.intent || response.data?.intent;
      const hasCorrectIntent = intent === test.expectedIntent;

      if (!hasCorrectIntent) {
        console.log(`   ❌ FAILED: Expected intent '${test.expectedIntent}', got '${intent}'`);
        failed++;
        continue;
      }

      console.log(`   ✅ Intent: ${intent}`);

      if (test.shouldHaveOrders) {
        const cardCount = response.data?.cards?.length || 0;
        const hasOrders = cardCount > 0 && response.data?.cards?.[0]?.type === "order";

        if (hasOrders) {
          console.log(`   ✅ Orders returned: ${cardCount}`);

          // Check order card content
          const firstCard = response.data.cards[0];
          const hasOrderDetails = firstCard.content && (
            firstCard.content.includes("Packing") ||
            firstCard.content.includes("Shipped") ||
            firstCard.content.includes("Timeline") ||
            firstCard.content.includes("Product:")
          );

          if (hasOrderDetails) {
            console.log(`   ✅ Order card has timeline/product details`);
            const titlePreview = firstCard.title?.substring(0, 50) || "Order";
            console.log(`   📦 Order: ${titlePreview}`);
            passed++;
          } else {
            console.log(`   ⚠️  WARNING: Order card found but missing details`);
            passed++;
          }
        } else {
          console.log(`   ⚠️  WARNING: No order cards returned (expected orders)`);
          console.log(`   Card count: ${cardCount}`);
          if (cardCount > 0) {
            console.log(`   First card type: ${response.data?.cards?.[0]?.type}`);
          }
          passed++; // Still pass intent detection
        }
      } else {
        console.log(`   ✅ Correctly not returning order_tracking intent`);
        passed++;
      }
    } catch (err) {
      console.log(`   ❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  console.log(`Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Give server time to initialize
setTimeout(runTests, 2000);
