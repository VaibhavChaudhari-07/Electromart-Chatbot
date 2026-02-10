// server/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStage,
  getOrderStats,
} = require("../controllers/orderController");

const { authUser } = require("../config/jwtMiddleware");

// PLACE ORDER
router.post("/add", authUser, createOrder);

// GET ORDERS OF PARTICULAR USER
router.get("/:userId", authUser, getUserOrders);

// GET ALL ORDERS (ADMIN)
router.get("/admin/all", authUser, getAllOrders);

// UPDATE ORDER STAGE (ADMIN)
router.put("/admin/update-stage", authUser, updateOrderStage);

// GET ORDER STATISTICS (ADMIN)
router.get("/admin/stats", authUser, getOrderStats);

module.exports = router;
