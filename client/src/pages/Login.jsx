import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosClient";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const { setUser } = useUser();
  const { setAdmin } = useAdmin();

  // Detect login mode from URL
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "user"; // default user login

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    // USER LOGIN
    if (mode === "user") {
      axios
        .post("/users/login", form)
        .then((res) => {
          setUser(res.data);
          navigate("/");
        })
        .catch(() => alert("Invalid user credentials"));
    }

    // ADMIN LOGIN
    if (mode === "admin") {
      axios
        .post("/admin/login", form)
        .then((res) => {
          setAdmin(res.data);
          navigate("/admin/home");
        })
        .catch(() => alert("Invalid admin credentials"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-400 to-primary-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full -ml-40 -mb-40"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-full shadow-lg mb-4">
            <span className="text-4xl">{mode === "admin" ? "🔐" : "🛍️"}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {mode === "admin" ? "Admin Portal" : "ElectroMart"}
          </h1>
          <p className="text-blue-100 text-sm">
            {mode === "admin" ? "Manage your store" : "Shop the latest electronics"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {mode === "admin" ? "Admin Login" : "Sign In"}
            </h2>
            <p className="text-blue-100 text-sm text-center mt-1">
              {mode === "admin" ? "Secure access to admin dashboard" : "Welcome back!"}
            </p>
          </div>

          {/* Card Body */}
          <div className="p-8 space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary font-semibold hover:text-primary-dark transition">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              className="btn-primary w-full py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={handleLogin}
            >
              ✨ Sign In
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Mode Toggle & Links */}
            {mode === "user" && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <p className="text-sm text-gray-700 mb-2">
                    Are you an admin?
                  </p>
                  <button
                    className="text-primary font-bold hover:text-primary-dark transition"
                    onClick={() => navigate("/login?mode=admin")}
                  >
                    🔐 Switch to Admin Login
                  </button>
                </div>

                <p className="text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary font-bold hover:text-primary-dark transition"
                  >
                    Create one now
                  </Link>
                </p>
              </>
            )}

            {mode === "admin" && (
              <>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-center">
                  <p className="text-sm text-gray-700 mb-2">
                    Don't have an admin account?
                  </p>
                  <button
                    className="text-primary font-bold hover:text-primary-dark transition"
                    onClick={() => navigate("/admin/signup")}
                  >
                    📝 Create Admin Account
                  </button>
                </div>

                <button
                  className="btn-secondary w-full py-2 rounded-lg font-semibold transition-all"
                  onClick={() => navigate("/login")}
                >
                  ← Back to User Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer Message */}
        <p className="text-center text-blue-100 text-xs mt-6">
          Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}
