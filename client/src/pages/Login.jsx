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
    <div className="login-container">
      <h2>{mode === "admin" ? "Admin Login" : "User Login"}</h2>

      <div className="login-card card">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter Email"
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter Password"
        />

        <button className="btn-primary login-btn" onClick={handleLogin}>
          Login
        </button>

        {/* USER SIGNUP LINK */}
        {mode === "user" && (
          <p className="login-bottom-text">
            Don’t have an account?{" "}
            <Link to="/signup" className="login-signup-link">
              Sign Up
            </Link>
          </p>
        )}

        {/* ADMIN SIGNUP BUTTON */}
        {mode === "admin" && (
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button
              className="btn-secondary"
              onClick={() => navigate("/admin/signup")}
            >
              Create Admin Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
