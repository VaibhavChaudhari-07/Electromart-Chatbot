const { detectComparisonIntent, getProductTitles } = require('./rag/intentDetector');
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testCategoryFilter() {
  try {
    await mongoose.connect('mongodb://localhost:27017/electromart');
    
    console.log('🧪 CRITICAL BUG FIX VERIFICATION\n');
    console.log('================================================================================\n');
    
    console.log('Test Query: "Compare iPhone 15 vs Samsung S24"\n');
    console.log('Expected: 2 Smartphone products (NOT TVs)\n');
    
    // Simulate the intent detection
    const intent = await detectComparisonIntent('Compare iPhone 15 vs Samsung S24');
    
    if (intent && intent.type === 'product_comparison' && intent.products) {
      console.log('✅ Intent Detected: product_comparison\n');
      console.log(`📊 Matched Products (${intent.products.length}):\n`);
      
      intent.products.forEach((product, idx) => {
        console.log(`   ${idx + 1}. ${product.title}`);
        console.log(`      Brand: ${product.brand}, Category: ${product.category}\n`);
      });
      
      // Verify category filtering
      const allSameCategory = intent.products.every(p => p.category === intent.deviceCategory);
      
      if (allSameCategory) {
        console.log(`✅ PASS: All products are in category "${intent.deviceCategory}"`);
      } else {
        console.log(`❌ FAIL: Products are from different categories!`);
        intent.products.forEach(p => console.log(`   - ${p.category}`));
      }
      
      // Verify no TVs in results
      const hasTV = intent.products.some(p => p.category === 'Smart TVs');
      if (!hasTV) {
        console.log('✅ PASS: No Smart TVs returned (bug is fixed!)');
      } else {
        console.log('❌ FAIL: Smart TVs found in comparison results');
      }
      
      // Verify no wrong categories
      if (intent.deviceCategory === 'Smartphones') {
        const allPhones = intent.products.every(p => p.category === 'Smartphones');
        if (allPhones) {
          console.log('✅ PASS: All results are Smartphones');
        } else {
          console.log('❌ FAIL: Not all results are Smartphones');
        }
      }
      
    } else {
      console.log('❌ Intent not detected properly');
      console.log('Intent result:', intent);
    }
    
    console.log('\n================================================================================\n');
    
    // Test with laptop query
    console.log('Test Query: "Dell vs HP laptops"\n');
    console.log('Expected: 2 Laptop products (NOT phones or TVs)\n');
    
    const laptopIntent = await detectComparisonIntent('Dell vs HP laptops');
    
    if (laptopIntent && laptopIntent.type === 'product_comparison' && laptopIntent.products) {
      console.log('✅ Intent Detected: product_comparison\n');
      console.log(`📊 Matched Products (${laptopIntent.products.length}):\n`);
      
      laptopIntent.products.forEach((product, idx) => {
        console.log(`   ${idx + 1}. ${product.title}`);
        console.log(`      Brand: ${product.brand}, Category: ${product.category}\n`);
      });
      
      // Verify category filtering
      const allLaptops = laptopIntent.products.every(p => p.category === 'Laptops');
      
      if (allLaptops) {
        console.log(`✅ PASS: All products are in category "Laptops"`);
      } else {
        console.log(`❌ FAIL: Products are from different categories!`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ BUG FIX VERIFICATION COMPLETE');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testCategoryFilter();
