// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const {
  signupAdmin,
  loginAdmin,
  getAdminInfo,
  addProduct,
  deleteProductAdmin,
} = require("../controllers/adminController");

const { authAdmin } = require("../config/jwtMiddleware");

// SIGNUP
router.post("/signup", signupAdmin);

// LOGIN
router.post("/login", loginAdmin);

// PROFILE
router.get("/:id", authAdmin, getAdminInfo);

// PRODUCT MANAGEMENT
router.post("/add-product", authAdmin, addProduct);
router.delete("/delete-product/:id", authAdmin, deleteProductAdmin);

module.exports = router;
