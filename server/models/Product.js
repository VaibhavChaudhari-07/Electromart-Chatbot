const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      enum: ["Laptops", "Smartphones", "Smart TVs", "Wearables", "Accessories"],
    },
    brand: { type: String, default: "" },
    price: { type: Number, required: true },
    mrp: { type: Number },
    discountPercentage: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    imageUrl: { type: String },
    features: [{ type: String }],
    specifications: { type: String, default: "" },
    warranty: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
