// server/rag/embedProducts.js
// Works 100% — No require() of Xenova anywhere.

const mongoose = require("mongoose");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// where to store output
const VECTOR_PATH = path.join(__dirname, "productVectors.json");

// dynamic import loader
async function loadModel() {
  const xf = await import("@xenova/transformers");
  return await xf.pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
}

async function embedText(model, text) {
  const out = await model(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect("mongodb://127.0.0.1:27017/ElectroMartChatbot");

    console.log("MongoDB connected");

    const products = await Product.find().lean();

    console.log("Found", products.length, "products");

    console.log("⏳ Loading embedding model...");
    const model = await loadModel();
    console.log("Model loaded!");

    const vectors = [];

    for (const p of products) {
      const text = `${p.title}. ${p.description}. ${p.category}`;
      const embedding = await embedText(model, text);

      vectors.push({
        productId: p._id,
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        embedding
      });

      console.log("Embedded:", p.title);
    }

    fs.writeFileSync(VECTOR_PATH, JSON.stringify(vectors, null, 2));
    console.log("\n✨ Embeddings saved to productVectors.json");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
