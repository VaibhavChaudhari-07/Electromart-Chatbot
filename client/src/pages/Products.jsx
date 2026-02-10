import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const { user } = useUser();
  const { admin } = useAdmin();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [error, setError] = useState(null);

  const categories = ["all", "laptops", "smartphones", "smart tvs", "wearables", "accessories"];

  useEffect(() => {
    axios.get("/products")
      .then((res) => {
        console.log("Products fetched:", res.data.length);
        setProducts(res.data || []);
        setFiltered(res.data || []);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
        setFiltered([]);
      });
  }, []);

  /* Search + Category Filter */
  const applyFilters = () => {
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
  };

  useEffect(() => applyFilters(), [search, activeCategory]);

  /* Guest Mode Buttons Alert */
  const guestAlert = () => {
    if (!user && !admin) {
      const ok = window.confirm("Please sign in first!\n\nOK = Close\nSign In = Go to login");
      if (!ok) navigate("/login?mode=user");
      return true;
    }
    return false;
  };

  /* Buy Now */
  const handleBuyNow = (item) => {
    if (guestAlert()) return;
    navigate("/checkout", { state: { product: item } });
  };

  /* Add to Cart */
  const handleAddToCart = (item) => {
    if (guestAlert()) return;
    addToCart(item);
    const ok = window.confirm("Product added to cart!\n\nOK = Close\nGo to Cart = View");
    if (!ok) navigate("/cart");
  };

  /* Admin Delete */
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    axios.delete(`/admin/delete-product/${id}`)
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

  return (
    <div className="products-container">
      {/* Error Message */}
      {error && (
        <div style={{ 
          background: "#ff6b6b", 
          color: "white", 
          padding: "12px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <input 
        type="text" 
        placeholder="Search products..." 
        className="products-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category Tabs */}
      <div className="products-categories">
        {categories.map((c) => (
          <button 
            key={c}
            className={`category-btn ${activeCategory === c ? "active-category" : ""}`}
            onClick={() => setActiveCategory(c)}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px 20px", 
          color: "#666"
        }}>
          <h3>No products found</h3>
          <p>Try adjusting your search or category filters.</p>
        </div>
      ) : (
        <div className="grid-3">
        {filtered.map((item) => {
          const productName = item.title || item.name || "Product";
          const productImage = item.images?.[0] || item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image";
          const productPrice = item.price || 0;
          const productMRP = item.mrp || item.price || 0;
          const discount = item.discountPercentage || 0;
          const rating = item.rating || 0;
          const ratingCount = item.ratingCount || 0;
          const stock = item.stock || 0;

          return (
            <div className="card product-card" key={item._id}>
              <div className="product-img-container">
                <img 
                  src={productImage} 
                  alt={productName} 
                  className="product-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image+Available";
                  }}
                />
                {discount > 0 && (
                  <span className="discount-badge">-{discount}%</span>
                )}
              </div>

              <h3 className="product-title">{productName}</h3>
              
              {item.brand && (
                <p className="product-brand"><strong>Brand:</strong> {item.brand}</p>
              )}

              <p className="product-desc">{item.description?.substring(0, 80)}...</p>
              {item.category && (
                <p className="product-category"><small>Category: {item.category}</small></p>
              )}

              <div className="product-pricing">
                <p className="product-price">₹{productPrice}</p>
                {productMRP > productPrice && (
                  <p className="product-mrp"><del>₹{productMRP}</del></p>
                )}
              </div>

              <div className="product-info">
                <p className="product-rating">⭐ {rating} {ratingCount > 0 ? `(${ratingCount})` : ""}</p>
                {stock > 0 ? (
                  <p className="product-stock" style={{ color: "green" }}>In Stock ({stock})</p>
                ) : (
                  <p className="product-stock" style={{ color: "red" }}>Out of Stock</p>
                )}
              </div>

              {/* Guest + User Mode Buttons */}
              {!admin && stock > 0 && (
                <div className="product-actions">
                  <button className="btn-primary" onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </button>

                  <button className="btn-secondary" onClick={() => handleBuyNow(item)}>
                    Buy Now
                  </button>
                </div>
              )}

              {!admin && stock === 0 && (
                <button className="btn-disabled" disabled>
                  Out of Stock
                </button>
              )}

              {/* Admin Delete Button */}
              {admin && (
                <button 
                  className="btn-danger product-delete-btn"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete Product
                </button>
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
