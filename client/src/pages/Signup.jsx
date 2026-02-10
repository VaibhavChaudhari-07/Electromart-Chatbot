import React, { useState } from "react";
import axios from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = () => {
    axios
      .post("/users/signup", form)
      .then((res) => {
        setUser(res.data);
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        alert("Signup failed. Try again.");
      });
  };

  return (
    <div className="signup-container">
      <h2>Create New Account</h2>

      <div className="signup-card card">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
        />

        <textarea
          name="address"
          rows={2}
          value={form.address}
          onChange={handleChange}
          placeholder="Full Address"
        ></textarea>

        <input
          type="text"
          name="pin"
          value={form.pin}
          onChange={handleChange}
          placeholder="Pin Code"
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />

        <button className="btn-primary signup-btn" onClick={handleSignup}>
          Create Account
        </button>
      </div>
    </div>
  );
}
