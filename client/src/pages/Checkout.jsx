import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";
import axios from "../api/axiosClient";

export default function Checkout() {
  const { user } = useUser();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const singleProduct = location.state?.product || null;
  const cartMode = location.state?.cartMode || false;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pin: "",
    payment: "COD",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        pin: user.pin,
        payment: "COD",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Clear error on user input
  };

  const handlePlaceOrder = () => {
    setError(null);
    setLoading(true);

    const items = singleProduct
      ? [{ ...singleProduct, quantity: 1 }]
      : cartItems;

    if (!items || items.length === 0) {
      setError("No items in cart");
      setLoading(false);
      return;
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderData = {
      userId: user._id,
      items: items.map(item => ({
        productId: item._id,
        title: item.title || item.name,
        name: item.name || item.title,
        brand: item.brand || "N/A",
        quantity: item.quantity,
        price: item.price,
        image: item.images?.[0] || item.imageUrl || "",
      })),
      totalAmount,
      address: {
        street: form.address,
        zipCode: form.pin,
        fullAddress: form.address,
      },
      phone: form.phone,
      pin: form.pin,
      payment: form.payment,
    };

    console.log("Order Data:", orderData);

    axios
      .post("/orders/add", orderData)
      .then((res) => {
        console.log("Order placed successfully:", res.data);
        if (cartMode) clearCart();
        setLoading(false);
        navigate("/myorders");
      })
      .catch((err) => {
        setLoading(false);
        console.error("Order error:", err.response?.data || err.message);
        if (err.response?.status === 400) {
          // Stock validation error
          setError(err.response.data.message);
        } else {
          setError(err.response?.data?.message || "Failed to place order. Please try again.");
        }
      });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please sign in to continue</h2>
          <button onClick={() => navigate('/login')} className="btn-primary mt-4 px-6 py-2">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">🛒 Order Summary</h2>

          <div className="space-y-3">
            {singleProduct ? (
              <div>
                <p className="font-semibold">{singleProduct.title}</p>
                <p className="text-gray-700">₹{singleProduct.price}</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="flex justify-between text-gray-700">
                  <div>{item.title} (x{item.quantity})</div>
                  <div>₹{item.price * item.quantity}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-bold">Total</h3>
            <p className="text-2xl text-primary font-bold">₹{singleProduct ? singleProduct.price : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}</p>
          </div>
        </div>

        {/* Shipping & Payment Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>

          {error && (
            <div className="bg-secondary text-white p-3 rounded mb-4">⚠️ {error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="input-field w-full"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="input-field w-full"
            />

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="input-field w-full"
            />

            <input
              type="text"
              name="pin"
              value={form.pin}
              onChange={handleChange}
              placeholder="Pin Code"
              className="input-field w-full"
            />

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full Address"
              rows="3"
              className="input-field w-full md:col-span-2"
            ></textarea>

            <select name="payment" value={form.payment} onChange={handleChange} className="input-field w-full md:col-span-2">
              <option value="COD">Cash On Delivery (COD)</option>
            </select>
          </div>

          <div className="mt-6">
            <button 
              className="btn-primary px-6 py-3"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
