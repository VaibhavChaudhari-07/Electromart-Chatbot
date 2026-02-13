// server/controllers/productController.js
const Product = require("../models/Product");
const { embedProductOnCreation, updateProductEmbedding } = require("../rag/embeddingManager");

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// GET product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// ADMIN — Add product
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    // Create embedding immediately
    await embedProductOnCreation(product);
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
};

// ADMIN — Edit product
exports.editProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // Update embedding with new product data
    await updateProductEmbedding(product._id);
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

// ADMIN — Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// ADMIN — Get low stock products (stock < 5)
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 5 } })
      .sort({ stock: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low stock products" });
  }
};

// ADMIN — Add stock to product
exports.addStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: quantity } },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: `Added ${quantity} items to stock`, product });
  } catch (err) {
    res.status(500).json({ message: "Failed to add stock" });
  }
};

// ADMIN — Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    // Products per category
    const productsPerCategory = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get all products with order count (mock data - would need order join in real scenario)
    const allProducts = await Product.find().select("_id name brand category stock");

    res.json({
      totalProducts,
      productsPerCategory,
      allProducts,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
