// server/controllers/adminController.js
const Admin = require("../models/Admin");
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");
const { signToken } = require("../config/jwtMiddleware");

// SIGNUP ADMIN
exports.signupAdmin = async (req, res) => {
  try {
    const exists = await Admin.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(req.body.password, 10);

    const admin = await Admin.create({
      name: req.body.name,
      email: req.body.email,
      password: hashed,
      isAdmin: true,
    });

    const token = signToken({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      isAdmin: true,
    });

    res.json({ ...admin._doc, token });
  } catch (err) {
    res.status(500).json({ message: "Failed to create admin account" });
  }
};

// LOGIN ADMIN
exports.loginAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(req.body.password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      isAdmin: true,
    });

    res.json({ ...admin._doc, token });
  } catch (err) {
    res.status(500).json({ message: "Admin login failed" });
  }
};

// GET ADMIN INFO
exports.getAdminInfo = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin info" });
  }
};

// ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to add product" });
  }
};

// DELETE PRODUCT
exports.deleteProductAdmin = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};
