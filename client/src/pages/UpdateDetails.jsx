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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please sign in to update your details</h2>
          <button onClick={() => navigate('/login')} className="btn-primary mt-4 px-6 py-2">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Update Account Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="input-field w-full"
          />

          <input
            type="email"
            value={user.email}
            readOnly
            className="input-field w-full bg-gray-100"
          />

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="input-field w-full"
          />

          <input
            type="text"
            name="pin"
            value={form.pin}
            onChange={handleChange}
            placeholder="Pin Code"
            className="input-field w-full"
          />

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full Address"
            rows="3"
            className="input-field w-full md:col-span-2"
          ></textarea>
        </div>

        <div className="mt-6">
          <button className="btn-primary px-6 py-2" onClick={handleUpdate}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
