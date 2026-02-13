(async () => {
  try {
    const { connectDB } = require("./config/db");
    await connectDB();
    const User = require("./models/User");
    const Order = require("./models/Order");
    const { embedOrderOnCreation } = require("./rag/embeddingManager");
    const { OrderEmbeddingModel } = require("./rag/vectorStore");

    // Create a test user
    const user = await User.create({
      name: "Embed Test User",
      email: `embed-test-${Date.now()}@example.com`,
      phone: "9999999999",
      address: "Test Address, Mumbai",
      pin: "400001",
      password: "password123"
    });

    console.log("Created test user:", user._id.toString());

    // Create a test order
    const orderData = {
      userId: user._id,
      items: [
        { title: "Test Product A", productId: user._id, quantity: 1, price: 12345 },
        { title: "Test Product B", productId: user._id, quantity: 2, price: 2345 }
      ],
      totalAmount: 17035,
      address: { city: "Mumbai", fullAddress: "Test Address" },
      phone: "9999999999",
      pin: "400001",
      payment: "COD",
      status: "pending"
    };

    const order = await Order.create(orderData);
    console.log("Created order:", order._id.toString());

    // Call embedding manager to create embedding
    const ok = await embedOrderOnCreation(order);
    console.log("embedOrderOnCreation returned:", ok);

    // Check order_embeddings collection
    const found = await OrderEmbeddingModel.findOne({ orderId: order._id }).lean();
    console.log("Order embedding doc:", found);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();