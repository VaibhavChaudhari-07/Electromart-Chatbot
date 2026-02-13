/**
 * Quick test for specification-based semantic search
 */
const axios = require('axios');

async function quickTest() {
  try {
    const query = 'Gaming laptop with RTX GPU and 144Hz display';
    console.log('Testing query:', query);
    console.log('Sending request to http://localhost:5000/api/chatbot...\n');

    const response = await axios.post('http://localhost:5000/api/chatbot', {
      query: query
    });

    const data = response.data;
    console.log('✅ Response received!\n');
    console.log('Intent:', data.intent);
    console.log('Confidence:', (data.confidence * 100).toFixed(1) + '%');
    console.log('Retrieval Method:', data.retrievalMethod);
    console.log('Data Points:', data.datapoints);
    console.log('Cards Returned:', data.cards ? data.cards.length : 0);

    if (data.cards && data.cards.length > 0) {
      console.log('\n🎯 TOP PRODUCTS:');
      data.cards.slice(0, 3).forEach((card, i) => {
        console.log(`\n${i+1}. ${card.title}`);
        console.log(`   Category: ${card.category}`);
        console.log(`   Price: ₹${card.price}`);
        console.log(`   Rating: ⭐ ${card.rating}`);
        if (card.features && card.features.length > 0) {
          console.log(`   Features: ${card.features.slice(0, 2).join(', ')}`);
        }
      });
    }

    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response && error.response.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

quickTest();
