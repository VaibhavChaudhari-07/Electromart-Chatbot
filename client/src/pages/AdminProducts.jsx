import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminProducts() {
  const { admin } = useAdmin();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", "laptops", "smartphones", "smart tvs", "wearables", "accessories"];

  useEffect(() => {
    axios
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  /* SEARCH & CATEGORY FILTERS */
  useEffect(() => {
    let temp = [...products];

    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      temp = temp.filter((p) => {
        const productName = (p.title || p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        return (
          productName.includes(searchLower) ||
          brand.includes(searchLower) ||
          description.includes(searchLower)
        );
      });
    }

    if (activeCategory !== "all") {
      temp = temp.filter((p) => {
        const productCategory = (p.category || "").toLowerCase();
        return productCategory === activeCategory.toLowerCase();
      });
    }

    setFiltered(temp);
  }, [search, activeCategory, products]);

  /* DELETE PRODUCT */
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    axios
      .delete(`/products/admin/delete-product/${id}`)
      .then(() => {
        alert("Product deleted successfully!");
        const updated = products.filter((p) => p._id !== id);
        setProducts(updated);
        setFiltered(updated);
      })
      .catch((err) => {
        alert("Failed to delete product");
        console.error(err);
      });
  };

  if (!admin) {
    return (
      <div className="adminproducts-container">
        <h2>Admin access required</h2>
      </div>
    );
  }

  return (
    <div className="adminproducts-container">
      <div className="admin-header">
        <h2>📦 Manage Products</h2>
        <button 
          className="btn-primary add-product-btn"
          onClick={() => navigate("/admin/add-edit-product")}
        >
          ➕ Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search products..."
        className="adminproducts-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Categories */}
      <div className="adminproducts-categories">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`admin-cat-btn ${activeCategory === c ? "admin-cat-active" : ""}`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid-3">
        {filtered.map((item) => {
          const productName = item.title || item.name || "Product";
          const productImage = item.images?.[0] || item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image";
          const productPrice = item.price || 0;
          const productMRP = item.mrp || item.price || 0;
          const discount = item.discountPercentage || 0;
          const rating = item.rating || 0;
          const ratingCount = item.ratingCount || 0;

          return (
            <div className="card adminproduct-card" key={item._id}>
              <div className="adminproduct-img-container">
                <img 
                  src={productImage} 
                  alt={productName} 
                  className="adminproduct-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image+Available";
                  }}
                />
                {discount > 0 && (
                  <span className="discount-badge">-{discount}%</span>
                )}
              </div>

              <h3 className="adminproduct-title">{productName}</h3>
              
              {item.brand && (
                <p className="adminproduct-brand"><strong>Brand:</strong> {item.brand}</p>
              )}

              <p className="adminproduct-desc">{item.description?.substring(0, 70)}...</p>
              
              {item.category && (
                <p className="adminproduct-category"><small>Cat: {item.category}</small></p>
              )}

              <div className="adminproduct-pricing">
                <p className="adminproduct-price">₹{productPrice}</p>
                {productMRP > productPrice && (
                  <p className="adminproduct-mrp"><del>₹{productMRP}</del></p>
                )}
              </div>

              <div className="adminproduct-info">
                <p className="adminproduct-rating">⭐ {rating} {ratingCount > 0 ? `(${ratingCount})` : ""}</p>
              </div>

              <div className="admin-product-actions">
                <button
                  className="btn-secondary admin-edit-btn"
                  onClick={() => navigate(`/admin/add-edit-product/${item._id}`)}
                >
                  ✏️ Edit
                </button>

                <button
                  className="btn-danger admin-delete-btn"
                  onClick={() => handleDelete(item._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
