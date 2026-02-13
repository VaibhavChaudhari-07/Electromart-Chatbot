import React from "react";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";
import { useCart } from "../context/CartContext";

export default function TopNavbar({ isSidebarOpen, setIsSidebarOpen }) {
  const { user } = useUser();
  const { admin } = useAdmin();
  const { totalItems } = useCart();

  const isUserMode = !!user;
  const isAdminMode = !!admin;
  const currentUser = user || admin;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark text-white border-b border-primary-dark shadow-lg sticky top-0 z-30">
      <div className="h-20 px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold">ElectroMart</h2>
          </div>
        </div>

        {/* Center: Status */}
        {currentUser && (
          <div className="hidden sm:block text-center">
            <p className="text-sm opacity-90 font-medium">{getGreeting()}</p>
            <p className="font-bold text-lg truncate" >
              Welcome, {currentUser.name}!
            </p>
          </div>
        )}

        {/* Right: User Info + Cart */}
        <div className="flex items-center gap-6">
          {currentUser && (
            <div className="sm:hidden flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {currentUser && (
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold text-lg">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Cart Icon (user mode only) */}
          {isUserMode && (
            <div className="relative group">
              <svg
                className="w-7 h-7 text-white hover:text-accent transition-all duration-200 cursor-pointer transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m0 0h2.71L12 5"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-3 -right-3 bg-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
