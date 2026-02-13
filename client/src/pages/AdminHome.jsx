import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome Admin</h1>
          <p className="text-gray-700 mb-4">Manage your electronic products and track the store inventory.</p>

          <div className="flex gap-3">
            <button
              className="btn-primary"
              onClick={() => navigate('/admin/dashboard')}
            >
              Dashboard
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/admin/products')}
            >
              Manage Products
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">Admin Panel Overview</h2>
          <p className="text-gray-700">This section allows administrators to manage the full catalogue of electronic products. Add, delete, and monitor product data.</p>
          <p className="text-gray-700 mt-2">The dashboard provides live control over inventory, helping maintain accurate and updated listings across all user modes.</p>
        </div>
      </div>
    </div>
  );
}
