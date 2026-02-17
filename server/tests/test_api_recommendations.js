// Test recommendation queries via API
const http = require("http");

const testQueries = [
  "Best phones under 30000",
  "best gaming laptops under 1 lakh",
  "Top laptops for programming",
  "best 4k tvs under 50000",
  "Best smartwatches for fitness",
];

function makeRequest(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query });

    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/chatbot",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function testAll() {
  console.log("🧪 Testing Recommendation Queries via API\n");
  console.log("=" .repeat(70));

  for (const query of testQueries) {
    try {
      const result = await makeRequest(query);
      console.log(`\n📝 Query: "${query}"`);
      console.log(`Intent: ${result.intent} (confidence: ${result.confidence})`);
      console.log(`Datapoints: ${result.datapoints} cards`);
      if (result.cards && result.cards.length > 0) {
        console.log(`Products:`);
        result.cards.forEach((card, i) => {
          console.log(
            `  ${i + 1}. ${card.title || card.productName} - ₹${card.price?.toLocaleString() || "N/A"}`
          );
        });
      }
      console.log("-".repeat(70));
    } catch (err) {
      console.log(`\n❌ Error for "${query}": ${err.message}`);
      console.log("-".repeat(70));
    }
  }

  console.log("\n✅ Test completed. Check the output above for issues.\n");
  process.exit(0);
}

testAll().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
