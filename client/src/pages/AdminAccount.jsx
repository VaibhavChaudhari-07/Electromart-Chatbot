import React from "react";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

export default function AdminAccount() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  if (!admin) {
    return (
      <div className="adminaccount-container">
        <h2>Admin access required</h2>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="adminaccount-container">
      <h2>Admin Account</h2>

      <div className="adminaccount-card card">
        <p><strong>Name:</strong> {admin.name}</p>
        <p><strong>Email:</strong> {admin.email}</p>

        <button className="btn-danger adminaccount-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
