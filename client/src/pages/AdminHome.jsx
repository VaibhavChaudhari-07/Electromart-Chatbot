import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="adminhome-container">

      <div className="adminhome-hero card">
        <h1>Welcome Admin</h1>
        <p>Manage your electronic products and track the store inventory.</p>

        <div className="adminhome-buttons">
          <button
            className="btn-primary"
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            Manage Products
          </button>
        </div>
      </div>

      <div className="adminhome-about card">
        <h2>Admin Panel Overview</h2>
        <p>
          This section allows administrators to manage the full catalogue of
          electronic products. Add, delete, and monitor product data.
        </p>
        <p>
          The dashboard provides live control over inventory, helping maintain
          accurate and updated listings across all user modes.
        </p>
      </div>

    </div>
  );
}
