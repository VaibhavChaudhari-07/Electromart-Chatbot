// server/importProducts.js - Import products from products.json to MongoDB

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product');

/**
 * Import products from products.json to MongoDB
 */
async function importProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/electromart');
    console.log('✅ Connected to MongoDB');

    // Read products.json
    const productsPath = path.join(__dirname, 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    console.log(`📦 Loaded ${productsData.length} products from products.json`);

    // Process and insert/update products
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const productData of productsData) {
      try {
        // Use title as unique identifier (or name if title doesn't exist)
        const productIdentifier = productData.title || productData.name;

        // Standardize field names (API expects 'title', JSON has 'name' and 'title')
        const product = {
          title: productData.title || productData.name,
          name: productData.name || productData.title,
          description: productData.description || '',
          category: productData.category || 'Uncategorized',
          brand: productData.brand || '',
          price: productData.price || productData.mrp || 0,
          mrp: productData.mrp || productData.price || 0,
          discountPercentage: productData.discountPercentage || 0,
          rating: productData.rating || 0,
          ratingCount: productData.ratingCount || productData.reviews || 0,
          stock: productData.stock || 0,
          imageUrl: productData.imageUrl || productData.images?.[0] || '',
          images: productData.images || [productData.imageUrl] || [],
          isActive: productData.isActive !== false,
          specifications: productData.specifications || {},
          warranty: productData.warranty || '',
          features: productData.features || [],
        };

        // Update or insert
        const result = await Product.findOneAndUpdate(
          { title: productIdentifier },
          product,
          { upsert: true, new: true }
        );

        if (result.isNew || !result._id.equals(result._id)) {
          insertedCount++;
        } else {
          updatedCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`❌ Error importing "${productData.title || productData.name}":`, err.message);
      }
    }

    console.log(`\n✅ Import Complete:`);
    console.log(`   • New products inserted: ${insertedCount}`);
    console.log(`   • Products updated: ${updatedCount}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log(`   • Total processed: ${productsData.length}`);

    // Verify by checking total count
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}`);

    // Show sample specifications
    const sampleProduct = await Product.findOne({ specifications: { $exists: true, $ne: {} } });
    if (sampleProduct) {
      console.log(`\n📋 Sample Product with Specs:`);
      console.log(`   Title: ${sampleProduct.title}`);
      console.log(`   Specifications:`, sampleProduct.specifications);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

// Run the import
importProducts();
