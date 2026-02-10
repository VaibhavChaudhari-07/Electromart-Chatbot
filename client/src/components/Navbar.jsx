import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout: userLogout } = useUser();
  const { admin, logout: adminLogout } = useAdmin();
  const { totalItems } = useCart();

  const handleLogout = () => {
    if (user) userLogout();
    if (admin) adminLogout();
  };

  return (
    <nav className="navbar">
      {/* Branding */}
      <div className="nav-brand">
        <Link to="/">ElectroMart</Link>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        {/* Guest Mode */}
        {!user && !admin && (
          <>
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
          </>
        )}

        {/* User Mode */}
        {user && (
          <>
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart ({totalItems})</Link>
            <Link to="/myorders">My Orders</Link>
            <Link to="/account">Account</Link>
          </>
        )}

        {/* Admin Mode */}
        {admin && (
          <>
            <Link to="/admin/home">Home</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/account">Account</Link>
          </>
        )}
      </div>

      {/* Right Side: Login / Logout */}
      <div className="nav-actions">
        {/* Guest Mode */}
        {!user && !admin && (
          <Link to="/login" className="btn-primary nav-login-btn">
            Login
          </Link>
        )}

        {/* User/Admin Mode */}
        {(user || admin) && (
          <button onClick={handleLogout} className="btn-danger nav-logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
