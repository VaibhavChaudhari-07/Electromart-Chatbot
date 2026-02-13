import React from "react";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ item, onDelete, onEdit }) {
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
  const warranty = item.warranty || "N/A";
  const features = item.features || [];

  /* Guest Alert: prompt user to login; OK -> go to login, Cancel -> stay */
  const guestAlert = () => {
    const goLogin = window.confirm(
      "You must sign in to continue. Press OK to go to Login, Cancel to stay."
    );
    if (goLogin) navigate("/login?mode=user");
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
    <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden border border-gray-100 h-full flex flex-col">
      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-b from-gray-100 to-gray-50 overflow-hidden">
        <img 
          src={productImage} 
          alt={productName} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          onError={(e)=>{e.target.src='https://via.placeholder.com/400x300?text=No+Image+Available'}} 
        />
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-secondary to-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
            -{discount}%
          </span>
        )}
        {stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg">
            Out of Stock
          </div>
        )}
        <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-lg text-xs font-semibold">
          {item.category || 'Featured'}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Brand */}
        {item.brand && (
          <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
            {item.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {productName}
        </h3>

        {/* Description */}
        {productDescription && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {productDescription.substring(0, 80)}...
          </p>
        )}

        {/* Star Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-sm font-semibold text-gray-700">{rating}</span>
            {ratingCount > 0 && (
              <span className="text-xs text-gray-500">({ratingCount})</span>
            )}
          </div>
        </div>

        {/* Stock Info */}
        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg mb-3 inline-block w-fit ${
          stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          📦 {stock > 0 ? `${stock} in Stock` : 'Out of Stock'}
        </div>

        {/* Warranty & Features */}
        {warranty && warranty !== "N/A" && (
          <p className="text-xs text-gray-600 mb-2">
            <span className="font-semibold">🛡️ Warranty:</span> {warranty}
          </p>
        )}

        {features.length > 0 && (
          <div className="text-xs mb-3">
            <p className="font-semibold text-gray-900 mb-1">✨ Features:</p>
            <div className="space-y-0.5">
              {features.slice(0, 2).map((feature, idx) => (
                <p key={idx} className="text-gray-600">✓ {feature}</p>
              ))}
              {features.length > 2 && (
                <p className="text-gray-500 italic">+ {features.length - 2} more</p>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="mt-auto pt-3 border-t border-gray-200">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-primary">₹{productPrice}</div>
              {productMRP > productPrice && (
                <div className="text-xs text-gray-500 line-through">₹{productMRP}</div>
              )}
            </div>
            {productMRP > productPrice && (
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                Save ₹{Math.round(productMRP - productPrice)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!admin && stock > 0 && (
            <div className="flex gap-2">
              <button 
                onClick={handleAddToCart} 
                className="btn-primary flex-1 py-2 font-bold rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm"
              >
                🛒 Cart
              </button>
              <button 
                onClick={handleBuyNow} 
                className="btn-secondary py-2 font-bold rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm px-3"
              >
                ⚡ Buy
              </button>
            </div>
          )}

          {!admin && stock === 0 && (
            <button 
              className="w-full py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed font-semibold text-sm" 
              disabled
            >
              Out of Stock
            </button>
          )}

          {admin && (
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit && onEdit(item._id)} 
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={() => onDelete(item._id)} 
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
