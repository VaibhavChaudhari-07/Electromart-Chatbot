// server/rag/vectorStore.js (Offline embeddings)
const mongoose = require("mongoose");
const similarity = require("cosine-similarity");

const Schema = mongoose.Schema;

const EmbeddingSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, unique: true },
    embedding: [Number],
    title: String,
    description: String,
    category: String,
    price: Number,
    images: [String],
    features: [String],
  },
  { collection: "product_embeddings" }
);

const EmbeddingModel = mongoose.model("ProductEmbedding", EmbeddingSchema);

async function upsertEmbedding(productId, embedding, meta = {}) {
  return EmbeddingModel.findOneAndUpdate(
    { productId },
    {
      productId,
      embedding,
      ...meta,
    },
    { upsert: true, new: true }
  );
}

async function semanticSearch(queryEmbedding, k = 5) {
  const all = await EmbeddingModel.find().lean();

  const scored = all.map((doc) => ({
    ...doc,
    score: similarity(queryEmbedding, doc.embedding || []),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, k);
}

module.exports = { upsertEmbedding, semanticSearch };
