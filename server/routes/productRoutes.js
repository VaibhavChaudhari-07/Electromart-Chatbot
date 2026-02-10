// server/routes/productRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
  getLowStockProducts,
  addStock,
  getDashboardStats,
} = require("../controllers/productController");

const { authAdmin } = require("../config/jwtMiddleware");

// PUBLIC ROUTES
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ADMIN ROUTES
router.post("/admin/add-product", authAdmin, addProduct);
router.put("/admin/edit-product/:id", authAdmin, editProduct);
router.delete("/admin/delete-product/:id", authAdmin, deleteProduct);
router.get("/admin/low-stock", authAdmin, getLowStockProducts);
router.put("/admin/add-stock/:id", authAdmin, addStock);
router.get("/admin/dashboard-stats", authAdmin, getDashboardStats);

module.exports = router;
