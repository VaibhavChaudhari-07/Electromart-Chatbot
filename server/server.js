// server/server.js
require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const path = require("path");

/* DB connection */
const { connectDB } = require("./config/db");

/* ROUTES */
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json({ limit: "10mb" })); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true }));

/* Connect to DB */
connectDB();

/* API Routes */
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chatbot", chatbotRoutes);

/* Health check route */
app.get("/", (req, res) => {
  res.send("ElectroMart Backend Running Successfully 🚀");
});

/* Static file hosting (optional for production deploy) */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* Start Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
});
