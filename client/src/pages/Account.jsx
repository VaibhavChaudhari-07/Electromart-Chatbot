import React from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Account() {
  const { user, logout } = useUser();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please sign in to view account details</h2>
          <button onClick={() => navigate('/login')} className="btn-primary mt-4 px-6 py-2">Sign In</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearCart();
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">My Account</h2>

        <div className="grid grid-cols-1 gap-3 text-gray-700 mb-6">
          <div><span className="font-semibold">Name:</span> {user.name}</div>
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">Phone:</span> {user.phone}</div>
          <div><span className="font-semibold">Address:</span> {user.address}</div>
          <div><span className="font-semibold">Pin Code:</span> {user.pin}</div>
        </div>

        <div className="flex gap-3">
          <button
            className="btn-primary px-5 py-2"
            onClick={() => navigate('/update-details')}
          >
            Update Details
          </button>

          <button className="btn-danger px-5 py-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
