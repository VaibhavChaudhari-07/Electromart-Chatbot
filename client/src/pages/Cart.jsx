import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
  const totalDiscount = totalMRP - totalAmount;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart to get started.</p>
          <button onClick={() => navigate("/products")} className="btn-primary px-6 py-3">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">🛒 Your Shopping Cart ({cartItems.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-5">
            {cartItems.map((item) => {
              const productMRP = item.mrp || item.price;
              const subtotal = item.price * item.quantity;
              const savings = productMRP * item.quantity - subtotal;

              return (
                <div key={item._id} className="card p-6 flex gap-6 shadow-lg hover:shadow-xl">
                  <img src={item.images?.[0] || item.imageUrl || "https://via.placeholder.com/150"} alt={item.title || item.name} className="w-36 h-36 object-cover rounded-xl shadow-md" />
                  <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{item.title || item.name}</h3>
                        {item.brand && <p className="text-sm text-gray-600 font-medium">{item.brand}</p>}
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-500 font-bold hover:text-red-700 text-xl">✕</button>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className="px-4 py-2 hover:bg-gray-100 font-bold">−</button>
                        <div className="px-6 py-2 font-bold border-x border-gray-200">{item.quantity}</div>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-4 py-2 hover:bg-gray-100 font-bold">+</button>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">₹{subtotal}</div>
                        {savings > 0 && <div className="text-sm text-green-600 font-semibold">Saved ₹{Math.round(savings)}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-7 sticky top-28 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h3>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal (MRP)</span>
                  <span className="font-semibold">₹{totalMRP}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{Math.round(totalDiscount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>
              <div className="flex justify-between text-2xl font-bold mb-6 text-gray-900">
                <span>Total:</span>
                <span className="text-primary">₹{Math.round(totalAmount)}</span>
              </div>
              <button onClick={() => navigate("/checkout", { state: { cartMode: true } })} className="btn-primary w-full py-3 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
