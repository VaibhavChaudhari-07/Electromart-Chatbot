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
      <div className="checkout-container">
        <h2>Please login to continue</h2>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>🛒 Checkout</h2>

      {/* ERROR ALERT */}
      {error && (
        <div className="checkout-error-alert">
          ⚠️ {error}
        </div>
      )}

      {/* ORDER SUMMARY */}
      <div className="checkout-summary card">
        <h3>Order Summary</h3>

        {singleProduct ? (
          <p>
            <strong>{singleProduct.title}</strong> — ₹{singleProduct.price}
          </p>
        ) : (
          cartItems.map((item) => (
            <p key={item._id}>
              {item.title} (x{item.quantity}) — ₹{item.price * item.quantity}
            </p>
          ))
        )}

        <h3 className="checkout-total">
          Total: ₹
          {singleProduct
            ? singleProduct.price
            : cartItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              )}
        </h3>
      </div>

      {/* USER DETAILS */}
      <div className="checkout-form card">
        <h3>Shipping Details</h3>

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
        />

        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Full Address"
          rows="3"
        ></textarea>

        <input
          type="text"
          name="pin"
          value={form.pin}
          onChange={handleChange}
          placeholder="Pin Code"
        />

        <select name="payment" value={form.payment} onChange={handleChange}>
          <option value="COD">Cash On Delivery (COD)</option>
        </select>

        <button 
          className="btn-primary checkout-btn" 
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
