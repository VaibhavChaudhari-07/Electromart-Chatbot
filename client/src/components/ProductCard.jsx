import React from "react";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ item, onDelete }) {
  const { user } = useUser();
  const { admin } = useAdmin();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Support both naming conventions
  const productName = item.title || item.name || "Product";
  const productImage = item.images?.[0] || item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image";
  const productDescription = item.description || "";
  const productPrice = item.price || 0;
  const productMRP = item.mrp || item.price || 0;
  const discount = item.discountPercentage || 0;
  const rating = item.rating || 0;
  const ratingCount = item.ratingCount || 0;
  const stock = item.stock || 0;

  /* Guest Alert */
  const guestAlert = () => {
    const ok = window.confirm(
      "Please sign in first!\n\nOK = Close\nSign In = Go to login"
    );
    if (!ok) navigate("/login?mode=user");
    return true;
  };

  const handleBuyNow = () => {
    if (!user && !admin) return guestAlert();
    navigate("/checkout", { state: { product: item } });
  };

  const handleAddToCart = () => {
    if (!user && !admin) return guestAlert();
    addToCart(item);

    const ok = window.confirm(
      "Product added to cart!\n\nOK = Close\nGo to cart = View"
    );
    if (!ok) navigate("/cart");
  };

  return (
    <div className="card productcard">
      {/* Product Image */}
      <div className="productcard-img-container">
        <img 
          src={productImage} 
          alt={productName} 
          className="productcard-img"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image+Available";
          }}
        />
        {discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}
      </div>

      {/* Product Name */}
      <h3 className="productcard-title">{productName}</h3>

      {/* Product Brand */}
      {item.brand && (
        <p className="productcard-brand"><strong>Brand:</strong> {item.brand}</p>
      )}

      {/* Product Description */}
      {productDescription && (
        <p className="productcard-desc">{productDescription.substring(0, 80)}...</p>
      )}

      {/* Category */}
      {item.category && (
        <p className="productcard-category"><small>Category: {item.category}</small></p>
      )}

      {/* Pricing */}
      <div className="productcard-pricing">
        <p className="productcard-price">₹{productPrice}</p>
        {productMRP > productPrice && (
          <p className="productcard-mrp"><del>₹{productMRP}</del></p>
        )}
      </div>

      {/* Rating & Stock */}
      <div className="productcard-info">
        <p className="productcard-rating">⭐ {rating} {ratingCount > 0 ? `(${ratingCount})` : ""}</p>
        {stock > 0 ? (
          <p className="productcard-stock" style={{ color: "green" }}>In Stock ({stock})</p>
        ) : (
          <p className="productcard-stock" style={{ color: "red" }}>Out of Stock</p>
        )}
      </div>

      {/* --- USER MODE BUTTONS --- */}
      {!admin && stock > 0 && (
        <div className="productcard-actions">
          <button className="btn-primary" onClick={handleAddToCart}>
            Add to Cart
          </button>

          <button className="btn-secondary" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      )}

      {!admin && stock === 0 && (
        <button className="btn-disabled" disabled>
          Out of Stock
        </button>
      )}

      {/* --- ADMIN DELETE BUTTON --- */}
      {admin && (
        <button className="btn-danger productcard-delete" onClick={() => onDelete(item._id)}>
          Delete Product
        </button>
      )}
    </div>
  );
}
