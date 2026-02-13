// server/controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const { embedOrderOnCreation, updateOrderEmbedding } = require("../rag/embeddingManager");

// CREATE ORDER - WITH STOCK VALIDATION AND UPDATE
exports.createOrder = async (req, res) => {
  try {
    const { items, userId, totalAmount, address, phone, pin, payment } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must have at least one item" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!address) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    // Step 1: Validate stock for all items
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: "Product ID is required for all items" });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${item.title} not found` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.title} only has ${product.stock} items in stock. You requested ${item.quantity}.`,
          productName: item.title,
          available: product.stock,
          requested: item.quantity,
        });
      }
    }

    // Step 2: Create the order
    const order = await Order.create(req.body);

    // Step 3: Create embedding for the order immediately
    await embedOrderOnCreation(order);

    // Step 4: Update stock for all items
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// GET ORDERS OF SPECIFIC USER
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate({
        path: "items.productId",
        select: "name title brand price images imageUrl stock category"
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// GET ALL ORDERS (ADMIN)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .populate("items.productId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// UPDATE ORDER STAGE
exports.updateOrderStage = async (req, res) => {
  try {
    const { orderId, stage } = req.body;
    const validStages = ["packing", "shipped", "outForDelivery", "delivered"];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the stage
    order.stages[stage] = {
      completed: true,
      completedAt: new Date(),
    };

    // Update status based on stage
    const stageMap = {
      packing: "packing",
      shipped: "shipped",
      outForDelivery: "out-for-delivery",
      delivered: "delivered",
    };
    order.status = stageMap[stage];

    if (stage === "delivered") {
      order.delivered = true;
    }

    await order.save();
    
    // Update embedding with new order status
    await updateOrderEmbedding(order._id);
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update order stage" });
  }
};

// GET ORDERS STATISTICS (ADMIN)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ delivered: true });
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    // Orders per month
    const ordersPerMonth = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
      ordersPerMonth,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
