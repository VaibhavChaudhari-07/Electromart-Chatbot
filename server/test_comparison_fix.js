// Test to verify that comparison intent returns exactly the number of products mentioned
const { detectIntent } = require('./rag/intentDetector');

async function testComparison() {
  const testQueries = [
    "HP Envy 13 10 vs HP Envy 13 28",
    "Compare iPhone 15 and Samsung S24",
    "Apple iPhone 15 Pro vs Samsung Galaxy S24 Ultra vs OnePlus 12",
    "Dell XPS 13 versus ThinkPad X1 Carbon",
  ];

  for (const query of testQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Query: "${query}"`);
    console.log('='.repeat(60));
    
    try {
      const intent = await detectIntent(query);
      
      if (intent.intent === 'product_comparison') {
        const matchedCount = intent.matchedProducts?.length || 0;
        // Count how many products are mentioned in the query
        const productMentionPattern = /\b(vs|versus|compared to|and|,)\b/gi;
        const parts = query.split(productMentionPattern).filter(p => p && !['vs', 'versus', 'compared to', 'and', ','].includes(p.toLowerCase().trim()));
        const expectedCount = parts.length;
        
        console.log(`Intent: ${intent.intent}`);
        console.log(`Expected products mentioned: ${expectedCount}`);
        console.log(`Matched products: ${matchedCount}`);
        console.log(`Product titles:`);
        intent.matchedProducts?.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.title}`);
        });
        
        if (matchedCount !== expectedCount && matchedCount >= 2) {
          console.log(`❌ MISMATCH: Expected ${expectedCount} products but got ${matchedCount}`);
        } else if (matchedCount >= 2) {
          console.log(`✅ CORRECT: Got ${matchedCount} products as expected`);
        }
      } else {
        console.log(`Intent: ${intent.intent}`);
        console.log(`Note: This is not a comparison intent`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
}

testComparison();
