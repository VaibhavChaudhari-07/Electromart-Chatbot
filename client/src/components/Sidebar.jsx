import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: userLogout } = useUser();
  const { admin, logout: adminLogout } = useAdmin();

  const isUserMode = !!user;
  const isAdminMode = !!admin;

  const handleLogout = () => {
    if (user) userLogout();
    if (admin) adminLogout();
  };

  const isActive = (path) => location.pathname === path;

  const userNavLinks = [
    { label: "🏠 Home", path: "/" },
    { label: "📦 Products", path: "/products" },
    { label: "🛒 Cart", path: "/cart" },
    { label: "📋 My Orders", path: "/myorders" },
  ];

  const guestNavLinks = [
    { label: "🏠 Home", path: "/" },
    { label: "📦 Products", path: "/products" },
  ];

  const adminNavLinks = [
    { label: "🏠 Home", path: "/admin/home" },
    { label: "📦 Products", path: "/admin/products" },
    { label: "📊 Dashboard", path: "/admin/dashboard" },
  ];

  const navLinks = isAdminMode ? adminNavLinks : isUserMode ? userNavLinks : guestNavLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-2xl transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            ElectroMart
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isAdminMode ? "Admin Panel" : "Shopping"}
          </p>
        </div>

        {/* Top header (no tabs) */}
        <div className="p-4 border-b border-gray-200">
          {/* simple spacing area to match previous layout */}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                isActive(link.path)
                  ? "bg-gradient-to-r from-primary to-primary-dark text-white"
                  : "text-gray-700 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* AI Assistant button - only for logged in users */}
        {(isUserMode || isAdminMode) && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/ai");
              }}
              className="w-full px-4 py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:shadow-lg"
            >
              🤖 AI Assistant
            </button>
          </div>
        )}

        {/* Account Link - Only for logged in users */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {(isUserMode || isAdminMode) ? (
            <Link
              to={isAdminMode ? "/admin/account" : "/account"}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                isActive(isAdminMode ? "/admin/account" : "/account")
                  ? "bg-gradient-to-r from-primary to-primary-dark text-white"
                  : "text-gray-700 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              👤 Account
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg text-center"
            >
              🔐 Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
