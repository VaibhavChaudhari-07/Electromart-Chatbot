// Test API for order tracking queries
const http = require("http");

const tests = [
  {
    name: "Track my order",
    query: "Track my order",
  },
  {
    name: "Track my Dell Legion order",
    query: "Track my Dell Legion order",
  },
  {
    name: "Where is my HP Envy",
    query: "Where is my HP Envy",
  },
  {
    name: "Order status",
    query: "Order status",
  },
  {
    name: "Generic - Best laptops (should not trigger order tracking)",
    query: "Best laptops under 50000",
  },
];

async function makeRequest(query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      query: query,
      userId: "invalid_user_id", // Will be handled by the route
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
  console.log("🧪 Testing Order Tracking API...\n");

  for (const test of tests) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`   Query: "${test.query}"`);
    console.log("   ----");

    try {
      const response = await makeRequest(test.query);

      if (response.error) {
        console.log(`   ❌ Error: ${response.error}`);
      } else {
        const intent = response.intent || response.data?.intent;
        console.log(`   Intent: ${intent}`);

        if (response.data) {
          const cardCount = response.data.cards?.length || 0;
          console.log(`   Cards returned: ${cardCount}`);

          if (response.data.cards && response.data.cards.length > 0) {
            const firstCard = response.data.cards[0];
            console.log(`   First card title: ${firstCard.title?.substring(0, 50)}...`);
            if (firstCard.content) {
              const contentPreview = firstCard.content.substring(0, 80).replace(/\n/g, " ");
              console.log(`   Content preview: ${contentPreview}...`);
            }
          }
        }
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  console.log("\n✅ API Tests Complete!");
  process.exit(0);
}

// Give server time to fully initialize before testing
setTimeout(runTests, 2000);
