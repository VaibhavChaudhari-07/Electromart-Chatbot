// Check what orders are in the database
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");  // Load all models first

async function checkOrders() {
  try {
    await connectDB();

    console.log("📊 Database Inventory\n");

    // Get test user
    const testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      console.log("❌ Test user not found");
      process.exit(1);
    }

    console.log(`✅ Test User: ${testUser._id}`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}\n`);

    // Get orders for this user
    const userOrders = await Order.find({ userId: testUser._id }).populate('items.productId').lean();
    console.log(`📦 Orders for test user: ${userOrders.length}`);

    if (userOrders.length === 0) {
      console.log("   No orders found!");
      
      // Check if ANY orders exist
      const allOrders = await Order.find().lean();
      console.log(`\n   Total orders in DB: ${allOrders.length}`);
      
      if (allOrders.length > 0) {
        console.log("   Sample order user IDs:");
        allOrders.slice(0, 3).forEach(o => {
          console.log(`     - Order ${o._id}: userId=${o.userId}`);
        });
      }
    } else {
      userOrders.forEach((order, idx) => {
        console.log(`\n   Order ${idx + 1}:`);
        console.log(`     ID: ${order._id}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Amount: ₹${order.totalAmount}`);
        console.log(`     Items: ${order.items?.length || 0}`);
        if (order.items && order.items.length > 0) {
          console.log(`     - ${order.items[0].title}`);
        }
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkOrders();
