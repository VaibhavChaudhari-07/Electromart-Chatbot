// server/test_intent3.js - Test Intent 3 (Product Comparison) detection

const mongoose = require('mongoose');
require('dotenv').config();

const { detectIntent } = require('./rag/intentDetector');
const { adaptiveRoute } = require('./rag/adaptiveRouter');
const { generateFinalAnswer } = require('./rag/chatbotLLM');

// Comprehensive test queries covering all 20 categories
const testQueries = [
  // 1️⃣ Basic 2-Product Comparisons
  "Compare iPhone 15 vs Samsung S24",
  "Dell XPS 13 vs MacBook Air",
  "OnePlus 12 vs iQOO 12",
  
  // 2️⃣ Brand vs Brand
  "Apple vs Samsung phones",
  "Dell vs HP laptops",
  
  // 3️⃣ Multi-Product (3+)
  "Compare iPhone 15, Samsung S24, and Pixel 8",
  "MacBook Air vs Dell XPS 13 vs HP Spectre x360",
  
  // 4️⃣ Budget Range
  "Best phones under 30000 comparison",
  "Compare laptops under 60000",
  
  // 5️⃣ Feature-Focused
  "Phones with best camera comparison",
  "Laptops for gaming comparison",
  
  // 6️⃣ Processor/Hardware
  "i7 vs Ryzen 7 laptops",
  "Intel vs AMD gaming laptops",
  
  // 7️⃣ Specification-Level
  "Compare iPhone 15 and Samsung S24 battery",
  "Display comparison MacBook Air vs XPS 13",
  
  // 8️⃣ Price vs Value
  "iPhone 15 vs Samsung S24 value for money",
  "MacBook Air vs Dell XPS price comparison",
  
  // 9️⃣ Use-Case
  "Laptop for coding: MacBook Air vs XPS 13",
  "Gaming: ASUS ROG vs Lenovo Legion",
  
  // 🔟 Generation/Year
  "iPhone 14 vs iPhone 15",
  
  // 1️⃣1️⃣ Variant
  "iPhone 15 vs iPhone 15 Pro",
  
  // 1️⃣2️⃣ Camera-Only
  "iPhone 15 vs Pixel 8 camera",
  
  // 1️⃣6️⃣ Conversational
  "Which is better: iPhone or Samsung?",
  "Should I buy Dell or HP laptop?",
  "MacBook Air or XPS 13 for coding?",
  
  // DB-Driven Exact Products
  "Dell Legion 5 1 vs Microsoft Surface Laptop 6",
  "Apple MacBook Pro 14 16 vs Dell XPS 13 Plus",
  
  // Messy/Real User Queries
  "compare iphone samsung which better",
  "dell vs hp laptop gaming",
  "sony bose headphone diff",
];

async function testIntent3() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ElectroMartChatbot'
    );
    console.log('✅ Connected to MongoDB\n');

    console.log('🧪 TESTING INTENT 3 (Product Comparison)\n');
    console.log('='.repeat(100));

    let detectedCount = 0;
    let successCount = 0;
    let failureCount = 0;

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      console.log('-'.repeat(100));

      try {
        // Detect intent
        const intent = await detectIntent(query);
        
        if (intent && intent.intent === 'product_comparison') {
          detectedCount++;
          console.log(`✅ Intent Detected: product_comparison`);
          console.log(`   Confidence: ${(intent.confidence * 100).toFixed(1)}%`);
          
          if (intent.productIds && intent.productIds.length > 0) {
            console.log(`   Matched ${intent.productIds.length} products`);
          } else if (intent.productTitles && intent.productTitles.length > 0) {
            console.log(`   Found: ${intent.productTitles.join(', ')}`);
          }

          // Route the intent
          const routeContext = await adaptiveRoute(query, intent, {});

          if (routeContext.data.products && routeContext.data.products.length >= 2) {
            successCount++;
            const products = routeContext.data.products;
            
            console.log(`\n   🎯 Comparison Products (${products.length}):`);
            products.forEach((p, i) => {
              console.log(`      ${i + 1}. ${p.title || p.name}`);
              console.log(`         Price: ₹${p.price}, Rating: ${p.rating || 'N/A'}/5, Stock: ${p.stock || 0}`);
            });

            // Generate LLM response
            const response = await generateFinalAnswer({
              query: query,
              intent: 'product_comparison',
              context: {
                type: 'product_comparison',
                items: products
              }
            });

            console.log(`\n   📱 Chatbot Response (preview):`);
            const lines = response.split('\n');
            lines.slice(0, 5).forEach(line => {
              if (line.trim()) console.log(`      ${line}`);
            });
            console.log(`      ...`);
          } else {
            failureCount++;
            console.log(`\n   ⚠️ Comparison detected but not enough products found (${routeContext.data.products?.length || 0} products)`);
          }
        } else {
          console.log(`❌ Intent Not Detected as product_comparison`);
          if (intent) {
            console.log(`   Detected as: ${intent.intent}`);
            console.log(`   Confidence: ${(intent.confidence * 100).toFixed(1)}%`);
          }
          failureCount++;
        }
      } catch (err) {
        console.error(`   ⚠️ Error testing query: ${err.message}`);
        failureCount++;
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('\n📊 INTENT 3 TEST SUMMARY:\n');
    console.log(`Total Queries: ${testQueries.length}`);
    console.log(`Intent Detected: ${detectedCount}/${testQueries.length} (${(detectedCount/testQueries.length*100).toFixed(1)}%)`);
    console.log(`Successful Comparisons: ${successCount}/${testQueries.length} (${(successCount/testQueries.length*100).toFixed(1)}%)`);
    console.log(`Failed: ${failureCount}/${testQueries.length}`);
    
    if (successCount >= testQueries.length * 0.8) {
      console.log(`\n✅ Intent 3 implementation SUCCESSFUL (>80% success rate)`);
    } else {
      console.log(`\n⚠️ Intent 3 needs improvement (<80% success rate)`);
    }

    console.log('\n✅ Intent 3 Testing Complete\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

testIntent3();
