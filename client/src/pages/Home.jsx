import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { admin } = useAdmin();

  const handleShopNow = () => {
    if (admin) navigate("/admin/products");
    else navigate("/products");
  };

  const handleLoginSelect = (event) => {
    const value = event.target.value;
    if (value === "user") navigate("/login?mode=user");
    if (value === "admin") navigate("/login?mode=admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-dark text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to ElectroMart</h1>
          <p className="text-lg md:text-xl text-primary-light mb-8 max-w-2xl mx-auto">
            Your one-stop shop for premium electronics, gadgets, and accessories — all at unbeatable prices
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleShopNow}
              className="btn-primary bg-white text-primary hover:bg-gray-100 px-8 py-3 font-bold text-lg"
            >
              🛍️ Start Shopping
            </button>

            {!user && !admin && (
              <select
                onChange={handleLoginSelect}
                className="px-6 py-3 rounded-lg bg-white text-primary font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <option value="">🔐 Login Mode</option>
                <option value="user">👤 User Login</option>
                <option value="admin">⚙️ Admin Login</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 max-w-6xl mx-auto px-4">
        <div className="card p-6 text-center">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
          <p className="text-gray-600">100+ products across all categories</p>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
          <p className="text-gray-600">Real-time order tracking</p>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
          <p className="text-gray-600">Smart chatbot for product discovery</p>
        </div>
      </div>

      {/* About Section */}
      <div className="card p-8 md:p-12 bg-white border-l-4 border-primary max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">About ElectroMart</h2>
        <p className="text-gray-700 mb-4 text-lg leading-relaxed">
          ElectroMart brings you the best collection of laptops, smartphones, smartwatches, televisions, and accessories — all in one place with seamless shopping experience.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Explore our extensive product portfolio, compare specifications, track your orders in real-time, and enjoy personalized recommendations powered by our intelligent AI chatbot.
        </p>
      </div>

      {/* CTA Section */}
      {user && (
        <div className="bg-primary-light border-2 border-primary rounded-xl p-8 text-center mt-12 max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-primary mb-4">Continue Exploring</h3>
          <button onClick={handleShopNow} className="btn-primary px-8 py-3 text-lg">View Products</button>
        </div>
      )}
    </div>
  );
}
