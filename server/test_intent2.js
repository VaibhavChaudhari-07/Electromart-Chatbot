// server/test_intent2.js - Test Intent 2 (Product Exact) detection

const mongoose = require('mongoose');
require('dotenv').config();

const { detectExactProductIntent } = require('./rag/intentDetector');
const { adaptiveRoute } = require('./rag/adaptiveRouter');
const { generateFinalAnswer } = require('./rag/chatbotLLM');

const testQueries = [
  "Dell Legion 5 1",
  "Show Apple Yoga Slim 7 2",
  "Price of Lenovo Yoga Slim 7 3",
  "Tell me about Apple Yoga Slim 7 2",
  "Can you find Samsung Galaxy S24 Ultra",
  "What's the Dell Legion 5 like",
  "Is the Apple Yoga Slim 7 2 available",
  "Lenovo Yoga Slim 7",  // Partial match test
  "Dell Legion 5",        // Partial match test
  "Apple and Samsung comparison"  // Shouldn't trigger product_exact
];

async function testIntent2() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ElectroMartChatbot'
    );
    console.log('✅ Connected to MongoDB\n');

    console.log('🧪 TESTING INTENT 2 (Product Exact)\n');
    console.log('=' .repeat(80));

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      console.log('-'.repeat(80));

      try {
        // Detect intent
        const intent = await detectExactProductIntent(query);
        
        if (intent && intent.intent === 'product_exact') {
          console.log(`✅ Intent Detected: product_exact`);
          console.log(`   Confidence: ${intent.confidence || 'N/A'}`);
          if (intent.productId) console.log(`   Product ID: ${intent.productId}`);
          if (intent.confidence && intent.confidence > 0.8) {
            console.log(`   Match Type: High Confidence`);
          }

          // Route the intent
          const routeContext = await adaptiveRoute(query, intent, {});

          if (routeContext.data.products && routeContext.data.products.length > 0) {
            const product = routeContext.data.products[0];
            console.log(`\n   🎯 Product Found:`);
            console.log(`      Title: ${product.title}`);
            console.log(`      Price: ₹${product.price}`);
            console.log(`      Brand: ${product.brand}`);
            console.log(`      Stock: ${product.stock}`);
            console.log(`      Rating: ${product.rating}/5`);
            if (product.specifications) {
              console.log(`      Specs Format: ${typeof product.specifications}`);
              if (typeof product.specifications === 'object') {
                console.log(`      Specs Keys: ${Object.keys(product.specifications).join(', ')}`);
              }
            }

            // Generate LLM response
            const response = await generateFinalAnswer({
              query: query,
              intent: 'product_exact',
              context: {
                type: 'product_exact',
                items: [product]
              }
            });

            console.log(`\n   📱 Chatbot Response (preview):`);
            const preview = response.split('\n').slice(0, 3).join('\n');
            console.log(`      ${preview}...`);
          } else {
            console.log(`\n   ❌ No product found after routing`);
          }
        } else {
          console.log(`❌ Intent Not Detected as product_exact`);
          if (intent) {
            console.log(`   Detected as: ${intent.intent || 'unknown'}`);
          } else {
            console.log(`   No intent detected`);
          }
        }
      } catch (err) {
        console.error(`   ⚠️ Error testing query: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Intent 2 Testing Complete\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

testIntent2();
