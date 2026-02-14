const mongoose = require('mongoose');
const { generateFinalAnswer } = require('./rag/chatbotLLM');
const Product = require('./models/Product');

async function testTableFormat() {
  try {
    console.log('🧪 TESTING COMPARISON TABLE FORMAT\n');
    console.log('================================================================================\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/electromart');
    console.log('✅ Connected to MongoDB\n');

    // Get some sample products for testing
    const smartphones = await Product.find({ category: 'Smartphones' }).limit(3).select('title price rating stock specifications category');
    const laptops = await Product.find({ category: 'Laptops' }).limit(3).select('title price rating stock specifications category');

    // Test smartphone comparison
    console.log('📱 SMARTPHONE COMPARISON TABLE:\n');
    console.log('Query: Compare iPhone 15 vs Samsung S24\n');
    
    const smartphoneContext = {
      type: 'product_comparison',
      items: smartphones,
      query: 'Compare iPhone 15 vs Samsung S24'
    };
    
    const smartphoneResponse = await generateFinalAnswer({ query: 'Compare iPhone 15 vs Samsung S24', context: smartphoneContext });
    
    // Extract and display table
    const smartphoneLines = smartphoneResponse.split('\n');
    let inTable = false;
    let passedBestFor = false;
    
    for (const line of smartphoneLines) {
      if (line.includes('| Feature |') || inTable) {
        console.log(line);
        inTable = true;
        if (line.includes('| **Best For** |')) {
          passedBestFor = true;
          break;
        }
      }
    }

    // Verify required fields
    console.log('\n✅ FIELD VALIDATION:');
    const requiredFields = ['Price', 'Rating', 'Processor', 'RAM', 'Storage', 'Display', 'Battery', 'GPU', 'Best For'];
    requiredFields.forEach(field => {
      const present = smartphoneResponse.includes(`**${field}**`);
      console.log(`  ${present ? '✅' : '❌'} ${field}`);
    });

    // Display analysis section
    console.log('\n💡 ANALYSIS SECTION:');
    const analysisIdx = smartphoneResponse.indexOf('### 💡');
    if (analysisIdx > -1) {
      const analysisText = smartphoneResponse.substring(analysisIdx, analysisIdx + 400);
      console.log(analysisText.split('\n').slice(0, 6).join('\n'));
    }

    console.log('\n================================================================================\n');

    // Test laptop comparison
    console.log('💻 LAPTOP COMPARISON TABLE:\n');
    console.log('Query: Dell vs HP laptops\n');
    
    const laptopContext = {
      type: 'product_comparison',
      items: laptops,
      query: 'Dell vs HP laptops'
    };
    
    const laptopResponse = await generateFinalAnswer({ query: 'Dell vs HP laptops', context: laptopContext });
    
    // Extract and display table
    const laptopLines = laptopResponse.split('\n');
    inTable = false;
    passedBestFor = false;
    
    for (const line of laptopLines) {
      if (line.includes('| Feature |') || inTable) {
        console.log(line);
        inTable = true;
        if (line.includes('| **Best For** |')) {
          passedBestFor = true;
          break;
        }
      }
    }

    // Display analysis section
    console.log('\n💡 ANALYSIS SECTION:');
    const laptopAnalysisIdx = laptopResponse.indexOf('### 💡');
    if (laptopAnalysisIdx > -1) {
      const laptopAnalysisText = laptopResponse.substring(laptopAnalysisIdx, laptopAnalysisIdx + 400);
      console.log(laptopAnalysisText.split('\n').slice(0, 6).join('\n'));
    }

    console.log('\n================================================================================');
    console.log('\n✅ TABLE FORMAT TEST COMPLETE');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTableFormat();
