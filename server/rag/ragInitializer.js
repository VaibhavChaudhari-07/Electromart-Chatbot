// server/rag/ragInitializer.js - Initialize RAG system with product embeddings
const { upsertEmbedding } = require("./vectorStore");
const { embedQuery } = require("./adaptiveRouter");
const Product = require("../models/Product");

/**
 * Initialize RAG: Embed all products on server startup
 */
async function initializeRAG() {
  try {
    console.log("[RAG] Initializing Adaptive RAG system...");

    // Get all products
    const products = await Product.find({}).limit(1000);

    if (products.length === 0) {
      console.warn("[RAG] No products found to embed");
      return;
    }

    console.log(`[RAG] Found ${products.length} products to embed...`);

    // Embed each product
    let embeddedCount = 0;
    for (const product of products) {
      try {
        if (!product._id) {
          console.warn(`[RAG] Skipping product with missing _id:`, product);
          continue;
        }
        const text = `${product.title || product.name} ${product.description || ''} ${(
          product.features || []
        ).join(" ")} ${product.category || ''}`;

        const embedding = await embedQuery(text);

        await upsertEmbedding(product._id, embedding, {
          title: product.title || product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          rating: product.rating,
          features: product.features,
          stock: product.stock,
        });

        embeddedCount++;

        // Log progress every 10 products
        if (embeddedCount % 10 === 0) {
          console.log(`[RAG] Embedded ${embeddedCount}/${products.length} products`);
        }
      } catch (err) {
        console.error(`[RAG] Error embedding product ${product._id}:`, err.message);
      }
    }

    console.log(`[RAG] ✅ RAG initialization complete! Embedded ${embeddedCount} products`);
  } catch (error) {
    console.error("[RAG] Initialization error:", error.message);
  }
}

/**
 * Refresh embeddings for a single product
 */
async function refreshProductEmbedding(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.warn(`[RAG] Product ${productId} not found`);
      return false;
    }

    const text = `${product.title} ${product.description} ${(
      product.features || []
    ).join(" ")}`;

    const embedding = await embedQuery(text);

    await upsertEmbedding(productId, embedding, {
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      rating: product.rating,
      features: product.features,
      stock: product.stock,
    });

    console.log(`[RAG] Refreshed embedding for product ${productId}`);
    return true;
  } catch (error) {
    console.error(`[RAG] Error refreshing embedding:`, error.message);
    return false;
  }
}

module.exports = {
  initializeRAG,
  refreshProductEmbedding,
};
