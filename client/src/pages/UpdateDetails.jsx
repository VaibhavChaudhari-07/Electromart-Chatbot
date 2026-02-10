import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import axios from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function UpdateDetails() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pin: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        phone: user.phone,
        address: user.address,
        pin: user.pin,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    axios
      .put(`/users/update/${user._id}`, form)
      .then((res) => {
        setUser(res.data); // update user context
        navigate("/account");
      })
      .catch((err) => console.error(err));
  };

  if (!user) {
    return (
      <div className="update-container">
        <h2>Please login to update your details</h2>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2>Update Account Details</h2>

      <div className="update-card card">
        {/* Name */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
        />

        {/* Email (Fixed) */}
        <input
          type="email"
          value={user.email}
          readOnly
          className="update-disabled"
        />

        {/* Phone */}
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
        />

        {/* Address */}
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Full Address"
          rows="3"
        ></textarea>

        {/* Pin */}
        <input
          type="text"
          name="pin"
          value={form.pin}
          onChange={handleChange}
          placeholder="Pin Code"
        />

        <button className="btn-primary update-btn" onClick={handleUpdate}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
