// server/rag/embeddingManager.js - Automated embedding creation for products and orders
const { upsertEmbedding } = require("./vectorStore");
const { embedQuery } = require("./adaptiveRouter");
const Product = require("../models/Product");
const Order = require("../models/Order");

/**
 * Create embedding for a new product immediately after it's created
 */
async function embedProductOnCreation(product) {
  try {
    if (!product || !product._id) {
      console.warn("[Embedding] Invalid product data");
      return false;
    }

    const text = `${product.title} ${product.description} ${(
      product.features || []
    ).join(" ")} ${product.category || ""}`;

    const embedding = await embedQuery(text);

    await upsertEmbedding(product._id, embedding, {
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      rating: product.rating,
      features: product.features,
      stock: product.stock,
    });

    console.log(`[Embedding] Created embedding for product: ${product.title}`);
    return true;
  } catch (error) {
    console.error(`[Embedding] Error embedding product:`, error.message);
    return false;
  }
}

/**
 * Create embedding for a new order immediately after it's created
 */
async function embedOrderOnCreation(order) {
  try {
    if (!order || !order._id) {
      console.warn("[Embedding] Invalid order data");
      return false;
    }

    const { OrderEmbeddingModel } = require("./vectorStore");
    if (!OrderEmbeddingModel) {
      console.warn("[Embedding] OrderEmbeddingModel not available yet");
      return false;
    }

    // Embed order metadata
    const orderText = `Order ${order._id} status ${order.status} amount ${order.totalAmount} items ${
      order.items?.length || 0
    } address ${order.shippingAddress?.city || ""}`;

    const embedding = await embedQuery(orderText);

    await OrderEmbeddingModel.findOneAndUpdate(
      { orderId: order._id },
      {
        orderId: order._id,
        embedding,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      },
      { upsert: true, new: true }
    );

    console.log(`[Embedding] Created embedding for order: ${order._id}`);
    return true;
  } catch (error) {
    console.error(`[Embedding] Error embedding order:`, error.message);
    return false;
  }
}

/**
 * Update product embedding when product is modified
 */
async function updateProductEmbedding(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.warn(`[Embedding] Product ${productId} not found`);
      return false;
    }

    return await embedProductOnCreation(product);
  } catch (error) {
    console.error(`[Embedding] Error updating product embedding:`, error.message);
    return false;
  }
}

/**
 * Update order embedding when order is modified
 */
async function updateOrderEmbedding(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`[Embedding] Order ${orderId} not found`);
      return false;
    }

    return await embedOrderOnCreation(order);
  } catch (error) {
    console.error(`[Embedding] Error updating order embedding:`, error.message);
    return false;
  }
}

module.exports = {
  embedProductOnCreation,
  embedOrderOnCreation,
  updateProductEmbedding,
  updateOrderEmbedding,
};
