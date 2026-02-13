import React, { useState } from "react";
import axios from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pin: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSignup = async () => {
    // Validation
    if (!form.name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!form.address.trim()) {
      setError("Address is required");
      return;
    }
    if (!form.pin.trim()) {
      setError("Pin code is required");
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/users/signup", form);
      setUser(res.data);
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-400 to-primary-dark flex items-center justify-center p-4 relative overflow-hidden py-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full -ml-40 -mb-40"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-full shadow-lg mb-4">
            <span className="text-4xl">📝</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join ElectroMart</h1>
          <p className="text-blue-100 text-sm">
            Create account and start shopping amazing electronics
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Create Your Account
            </h2>
            <p className="text-blue-100 text-sm text-center mt-1">
              Sign up in just a few minutes
            </p>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <span className="text-red-600 text-xl">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <span className="text-green-600 text-xl">✅</span>
                <span className="text-green-700">{success}</span>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email Address *
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

              {/* Phone & Pin Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📱 Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91-XXXXXXXXXX"
                    className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 Pin Code *
                  </label>
                  <input
                    type="text"
                    name="pin"
                    value={form.pin}
                    onChange={handleChange}
                    placeholder="110001"
                    className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏠 Full Address *
                </label>
                <textarea
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your complete address..."
                  className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Create Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-5 h-5 mt-0.5"
                  defaultChecked
                />
                <label htmlFor="terms" className="text-xs text-gray-700 cursor-pointer">
                  I agree to the <span className="font-semibold text-primary">Terms of Service</span> and{" "}
                  <span className="font-semibold text-primary">Privacy Policy</span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                className="btn-primary w-full py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "✨ Sign Up Now"}
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

              {/* Sign In Link */}
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-bold hover:text-primary-dark transition"
                >
                  Sign In here
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Footer Message */}
        <p className="text-center text-blue-100 text-xs mt-6">
          ✅ Your information is safe and encrypted
        </p>
      </div>
    </div>
  );
}
