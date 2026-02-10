const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        name: String,
        brand: String,
        quantity: Number,
        price: Number,
        image: String,
      },
    ],

    totalAmount: { type: Number, required: true },

    address: {
      street: { type: String },
      city: { type: String },
      zipCode: { type: String },
      fullAddress: { type: String }, // For backward compatibility
    },
    phone: { type: String, required: true },
    pin: { type: String, required: true },
    payment: { type: String, enum: ["COD"], default: "COD" },

    // Order Status Tracking
    status: {
      type: String,
      enum: ["pending", "packing", "shipped", "out-for-delivery", "delivered", "cancelled"],
      default: "pending",
    },

    stages: {
      packing: {
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
      shipped: {
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
      outForDelivery: {
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
      delivered: {
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    },

    delivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
