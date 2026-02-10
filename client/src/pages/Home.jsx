import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { admin } = useAdmin();

  const handleShopNow = () => {
    if (!user && !admin) {
      navigate("/products");
    } else if (user) {
      navigate("/products");
    } else if (admin) {
      navigate("/admin/products");
    }
  };

  const handleLoginSelect = (event) => {
    const value = event.target.value;
    if (value === "user") navigate("/login?mode=user");
    if (value === "admin") navigate("/login?mode=admin");
  };

  return (
    <div className="home-container">

      <div className="home-hero">
        <h1>Welcome to ElectroMart</h1>
        <p>Your one-stop shop for all electronic essentials.</p>

        <div className="home-buttons">
          <button className="btn-primary" onClick={handleShopNow}>
            Shop Now
          </button>

          {/* Show login dropdown only in guest mode */}
          {!user && !admin && (
            <select className="login-dropdown" onChange={handleLoginSelect}>
              <option value="">Login Mode</option>
              <option value="user">User Login</option>
              <option value="admin">Admin Login</option>
            </select>
          )}
        </div>
      </div>

      <div className="home-about card">
        <h2>About Us</h2>
        <p>
          ElectroMart brings you the best collection of laptops, smartphones,
          smartwatches, televisions, and accessories — all in one place.
        </p>
        <p>
          Explore our 100+ products, compare features, track your orders, and
          enjoy smooth shopping with our intelligent AI-powered chatbot.
        </p>
      </div>
    </div>
  );
}
