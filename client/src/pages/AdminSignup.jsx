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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Admin Account</h2>

        {error && <div className="bg-secondary text-white p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" required value={form.name} onChange={handleChange} className="input-field w-full" />
          <input type="email" name="email" placeholder="Admin Email" required value={form.email} onChange={handleChange} className="input-field w-full" />
          <input type="password" name="password" placeholder="Password" required value={form.password} onChange={handleChange} className="input-field w-full" />
          <button type="submit" className="btn-primary w-full py-2">Create Admin</button>
        </form>
      </div>
    </div>
  );
}
