import React from "react";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

export default function AdminAccount() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Admin access required</h2>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Admin Account</h2>
        <p className="mb-2"><strong>Name:</strong> {admin.name}</p>
        <p className="mb-4"><strong>Email:</strong> {admin.email}</p>

        <button className="btn-danger px-4 py-2" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
