// Create sample orders for testing
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const { connectDB } = require("../config/db");

async function createSampleOrders() {
  try {
    await connectDB();

    console.log("🔍 Finding or creating test user...");
    
    // Create/find test user
    let testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      testUser = await User.create({
        name: "Test User",
        email: "test@example.com",
        phone: "9999999999",
        password: "test123",
        address: "123 Main St",
        pin: "10001",
      });
      console.log("✅ Test user created");
    } else {
      console.log("✅ Test user found");
    }

    // Clear existing test orders
    await Order.deleteMany({ userId: testUser._id });

    // Create sample orders with different statuses
    const orders = [
      {
        userId: testUser._id,
        items: [
          {
            title: "Dell Legion 5 1",
            name: "Dell Legion",
            brand: "Dell",
            quantity: 1,
            price: 49207,
            image: "/images/dell-legion.jpg",
          },
        ],
        totalAmount: 49207,
        address: {
          fullAddress: "123 Main St, New York, NY 10001",
          street: "123 Main St",
          city: "New York",
          zipCode: "10001",
        },
        phone: "9999999999",
        pin: "10001",
        payment: "COD",
        status: "delivered",
        stages: {
          packing: { completed: true, completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
          shipped: { completed: true, completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          outForDelivery: { completed: true, completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          delivered: { completed: true, completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
        },
        delivered: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        items: [
          {
            title: "HP Envy 13 32",
            name: "HP Envy",
            brand: "HP",
            quantity: 1,
            price: 64250,
            image: "/images/hp-envy.jpg",
          },
        ],
        totalAmount: 64250,
        address: {
          fullAddress: "456 Oak Ave, Boston, MA 02101",
          street: "456 Oak Ave",
          city: "Boston",
          zipCode: "02101",
        },
        phone: "9999999999",
        pin: "02101",
        payment: "COD",
        status: "out-for-delivery",
        stages: {
          packing: { completed: true, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          shipped: { completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          outForDelivery: { completed: true, completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          delivered: { completed: false },
        },
        delivered: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        items: [
          {
            title: "Apple MacBook Air M1 41",
            name: "MacBook Air",
            brand: "Apple",
            quantity: 1,
            price: 120674,
            image: "/images/macbook.jpg",
          },
        ],
        totalAmount: 120674,
        address: {
          fullAddress: "789 Pine Rd, San Francisco, CA 94105",
          street: "789 Pine Rd",
          city: "San Francisco",
          zipCode: "94105",
        },
        phone: "9999999999",
        pin: "94105",
        payment: "COD",
        status: "shipped",
        stages: {
          packing: { completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          shipped: { completed: true, completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
          outForDelivery: { completed: false },
          delivered: { completed: false },
        },
        delivered: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    const created = await Order.insertMany(orders);
    console.log(`✅ Created ${created.length} sample orders for testing\n`);

    // Display order summaries
    created.forEach((order, i) => {
      console.log(`Order ${i + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Product: ${order.items[0].title}`);
      console.log(`  Amount: ₹${order.totalAmount.toLocaleString()}\n`);
    });

    console.log("✅ Test data ready! You can now:");
    console.log("  1. Log in with test@example.com (password: test123)");
    console.log("  2. Try queries like:");
    console.log("     - Track my order");
    console.log("     - Where is my Dell Legion order");
    console.log("     - Order status\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

createSampleOrders();
