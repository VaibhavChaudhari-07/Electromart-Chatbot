import React from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Account() {
  const { user, logout } = useUser();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="account-container">
        <h2>Please login to view account details</h2>
      </div>
    );
  }

  const handleLogout = () => {
    clearCart();
    logout();
    navigate("/");
  };

  return (
    <div className="account-container">
      <h2>My Account</h2>

      <div className="account-card card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>Pin Code:</strong> {user.pin}</p>

        <div className="account-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/update-details")}
          >
            Update Details
          </button>

          <button className="btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
