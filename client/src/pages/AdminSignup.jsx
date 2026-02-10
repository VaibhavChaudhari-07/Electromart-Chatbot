import React, { useState } from "react";
import axios from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function AdminSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/admin/signup", form);
      alert("Admin account created successfully!");
      navigate("/admin/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin");
    }
  };

  return (
    <div className="admin-auth-container">
      <h2>Create Admin Account</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-auth-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" className="btn-primary">
          Create Admin
        </button>
      </form>
    </div>
  );
}
