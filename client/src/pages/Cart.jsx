import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalMRP = cartItems.reduce(
    (sum, item) => sum + (item.mrp || item.price) * item.quantity,
    0
  );

  const totalDiscount = totalMRP - totalAmount;
  const discountPercent = totalMRP > 0 ? Math.round((totalDiscount / totalMRP) * 100) : 0;

  const handleBuyNow = () => {
    navigate("/checkout", { state: { cartMode: true } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Cart is Empty</h2>
        <p>Add some products to your cart.</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>🛒 Your Shopping Cart</h2>

      <div className="cart-list">
        {cartItems.map((item) => {
          const productMRP = item.mrp || item.price;
          const discount = item.discountPercentage || 0;
          const subtotal = item.price * item.quantity;
          const subtotalMRP = productMRP * item.quantity;
          const subtotalDiscount = subtotalMRP - subtotal;

          return (
            <div className="cart-card-enhanced" key={item._id}>
              {/* Product Image */}
              <div className="cart-img-wrapper">
                <img 
                  src={item.images?.[0] || item.imageUrl || "https://via.placeholder.com/180x180?text=No+Image"} 
                  alt={item.title} 
                  className="cart-img-large"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/180x180?text=No+Image+Available";
                  }}
                />
                {discount > 0 && (
                  <span className="cart-discount-badge">-{discount}%</span>
                )}
              </div>

              {/* Product Details */}
              <div className="cart-details">
                <h3 className="cart-product-name">{item.title || item.name}</h3>
                
                {item.brand && (
                  <p className="cart-brand"><strong>Brand:</strong> {item.brand}</p>
                )}

                {item.category && (
                  <p className="cart-category"><strong>Category:</strong> {item.category}</p>
                )}

                {item.description && (
                  <p className="cart-description">{item.description.substring(0, 80)}...</p>
                )}

                {item.rating && (
                  <p className="cart-rating">⭐ {item.rating} {item.ratingCount ? `(${item.ratingCount})` : ""}</p>
                )}

                {/* Pricing Details */}
                <div className="cart-pricing">
                  <div className="price-row">
                    <span>Price per unit:</span>
                    <div>
                      <span className="cart-price">₹{item.price}</span>
                      {productMRP > item.price && (
                        <span className="cart-mrp"><del>₹{productMRP}</del></span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Control */}
                  <div className="price-row">
                    <span><strong>Quantity:</strong></span>
                    <div className="cart-quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQuantity(item._id, Math.max(1, item.quantity - 1))
                        }
                      >
                        −
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="price-row subtotal-row">
                    <span><strong>Subtotal:</strong></span>
                    <div>
                      <span className="cart-subtotal">₹{subtotal}</span>
                      {subtotalDiscount > 0 && (
                        <span className="cart-saving">Save ₹{subtotalDiscount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                className="btn-danger cart-remove-btn-enhanced"
                onClick={() => removeFromCart(item._id)}
              >
                ✕ Remove
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart Summary Footer */}
      <div className="cart-footer-enhanced">
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal (MRP):</span>
            <span>₹{totalMRP}</span>
          </div>
          <div className="summary-row">
            <span>Discount:</span>
            <span className="discount-text">-₹{Math.round(totalDiscount)} ({discountPercent}%)</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total-row">
            <span><strong>Total Amount:</strong></span>
            <span className="final-total">₹{Math.round(totalAmount)}</span>
          </div>
          <p className="savings-text">You save ₹{Math.round(totalDiscount)} on this order!</p>
        </div>

        <button className="btn-primary cart-buy-btn-enhanced" onClick={handleBuyNow}>
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}
