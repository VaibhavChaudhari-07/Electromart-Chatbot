// server/rag/vectorStore.js - Vector Database for semantic search
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Simple cosine similarity implementation
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

// Product Embeddings Collection
const EmbeddingSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, unique: true },
    embedding: [Number],
    title: String,
    description: String,
    category: String,
    price: Number,
    rating: Number,
    images: [String],
    features: [String],
    stock: Number,
  },
  { collection: "product_embeddings" }
);

// Order Embeddings Collection (for order-related queries)
const OrderEmbeddingSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, required: true, unique: true },
    embedding: [Number],
    userId: { type: Schema.Types.ObjectId, required: true },
    status: String,
    totalAmount: Number,
    createdAt: Date,
  },
  { collection: "order_embeddings" }
);

const ProductEmbeddingModel = mongoose.model("ProductEmbedding", EmbeddingSchema);
const OrderEmbeddingModel = mongoose.model("OrderEmbedding", OrderEmbeddingSchema);

/**
 * Insert or update product embedding
 */
async function upsertEmbedding(productId, embedding, meta = {}) {
  try {
    return await ProductEmbeddingModel.findOneAndUpdate(
      { productId },
      {
        productId,
        embedding,
        ...meta,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error upserting embedding:", error.message);
    return null;
  }
}

/**
 * Semantic search in product vector database
 * Returns top k most similar products
 */
async function semanticSearch(queryEmbedding, k = 5) {
  try {
    // Ensure embedding is valid
    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn("Invalid query embedding");
      return [];
    }

    const all = await ProductEmbeddingModel.find({}).lean();

    if (all.length === 0) {
      console.warn("No products in vector database");
      return [];
    }

    // Calculate similarity scores
    const scored = all
      .map((doc) => {
        try {
          const score = doc.embedding
            ? cosineSimilarity(queryEmbedding, doc.embedding)
            : 0;
          return { ...doc, score };
        } catch (err) {
          console.error("Similarity calculation error:", err.message);
          return { ...doc, score: 0 };
        }
      })
      .filter((doc) => !isNaN(doc.score));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Return top k with score > threshold (to filter noise)
    return scored.filter((item) => item.score > 0.3).slice(0, k);
  } catch (error) {
    console.error("Semantic search error:", error.message);
    return [];
  }
}

/**
 * Order-based semantic search
 */
async function semanticOrderSearch(queryEmbedding, userId, k = 3) {
  try {
    if (!queryEmbedding || queryEmbedding.length === 0) {
      return [];
    }

    const userOrders = await OrderEmbeddingModel.find({ userId }).lean();
    
    const scored = userOrders
      .map((doc) => ({
        ...doc,
        score: doc.embedding ? cosineSimilarity(queryEmbedding, doc.embedding) : 0,
      }))
      .filter((doc) => !isNaN(doc.score));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  } catch (error) {
    console.error("Order semantic search error:", error.message);
    return [];
  }
}

/**
 * Bulk insert embeddings for all products
 */
async function bulkInsertProductEmbeddings(products, embeddings) {
  try {
    const operations = products.map((product, index) => ({
      updateOne: {
        filter: { productId: product._id },
        update: {
          $set: {
            productId: product._id,
            embedding: embeddings[index],
            title: product.title,
            description: product.description,
            category: product.category,
            price: product.price,
            rating: product.rating,
            features: product.features || [],
            stock: product.stock,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await ProductEmbeddingModel.bulkWrite(operations);
      console.log(`Inserted/updated ${operations.length} product embeddings`);
    }
  } catch (error) {
    console.error("Bulk insert error:", error.message);
  }
}

/**
 * Get embedding statistics
 */
async function getEmbeddingStats() {
  try {
    const productCount = await ProductEmbeddingModel.countDocuments();
    const orderCount = await OrderEmbeddingModel.countDocuments();

    return {
      productEmbeddings: productCount,
      orderEmbeddings: orderCount,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error fetching stats:", error.message);
    return null;
  }
}

module.exports = {
  // Models (exported for other modules that need direct model access)
  ProductEmbeddingModel,
  OrderEmbeddingModel,

  // Functions
  upsertEmbedding,
  semanticSearch,
  semanticOrderSearch,
  bulkInsertProductEmbeddings,
  getEmbeddingStats,
};
