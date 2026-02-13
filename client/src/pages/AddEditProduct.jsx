import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosClient";

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    category: "Laptops",
    brand: "",
    price: 0,
    mrp: 0,
    discountPercentage: 0,
    rating: 4.5,
    ratingCount: 0,
    stock: 0,
    imageUrl: "",
    images: [],
    features: [],
    specifications: "",
    warranty: "",
    isActive: true,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`/products/${id}`)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => setError("Failed to load product"));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    setError(null);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setForm({
        ...form,
        features: [...form.features, featureInput],
      });
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index) => {
    setForm({
      ...form,
      features: form.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (form.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (form.stock < 0) {
      setError("Stock cannot be negative");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`/products/admin/edit-product/${id}`, form);
        setSuccess("Product updated successfully!");
      } else {
        await axios.post("/products/admin/add-product", form);
        setSuccess("Product added successfully!");
      }
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="card p-10 shadow-xl mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2">
            {isEditMode ? "✏️ Edit Product" : "➕ Add New Product"}
          </h2>
          <p className="text-gray-600">
            {isEditMode ? "Update product information" : "Create a new product listing"}
          </p>
        </div>

        {error && <div className="bg-gradient-to-r from-secondary to-red-600 text-white p-4 rounded-xl mb-6 shadow-lg font-semibold">⚠️ {error}</div>}
        {success && <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl mb-6 shadow-lg font-semibold">✓ {success}</div>}

        <div className="card p-10 shadow-xl">
          <div className="product-form space-y-8">
            {/* Basic Information */}
            <div className="form-section pb-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-3xl">📝</span>Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Product Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Apple MacBook Air M1" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Product Title</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Product title" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Brand</label>
                  <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g., Apple" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input-field w-full">
                    <option>Laptops</option>
                    <option>Smartphones</option>
                    <option>Smart TVs</option>
                    <option>Wearables</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Detailed product description..." rows="4" className="input-field w-full"></textarea>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="form-section pb-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-3xl">💰</span>Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Sale Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-600 font-bold">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      className="input-field w-full pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">MRP (Original Price)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-600 font-bold">₹</span>
                    <input
                      type="number"
                      name="mrp"
                      value={form.mrp}
                      onChange={handleChange}
                      placeholder="0"
                      className="input-field w-full pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Discount %</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-600 font-bold">%</span>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={form.discountPercentage}
                      onChange={handleChange}
                      placeholder="0"
                      className="input-field w-full pl-8"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock & Ratings */}
            <div className="form-section pb-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-3xl">📦</span>Stock & Ratings</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="input-field w-full"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Rating</label>
                  <input
                    type="number"
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                    className="input-field w-full"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Rating Count</label>
                  <input
                    type="number"
                    name="ratingCount"
                    value={form.ratingCount}
                    onChange={handleChange}
                    placeholder="0"
                    className="input-field w-full"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="form-section pb-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-3xl">🖼️</span>Images & Media</h3>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="input-field w-full mb-4"
                />
              </div>

              {form.imageUrl && (
                <div className="card p-6 bg-gray-50">
                  <p className="text-sm font-bold text-gray-700 mb-3">Image Preview</p>
                  <img src={form.imageUrl} alt="Preview" className="w-full max-w-sm h-64 object-cover rounded-lg shadow-lg" onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300?text=Image+Error";
                  }} />
                </div>
              )}
            </div>

            {/* Features */}
            <div className="form-section pb-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-3xl">✨</span>Features</h3>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g., 16GB RAM"
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <button 
                  type="button" 
                  onClick={handleAddFeature}
                  className="btn-primary px-6 py-2 rounded-lg shadow-lg hover:shadow-xl"
                >
                  Add
                </button>
              </div>

              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {form.features.map((feature, index) => (
                    <div key={index} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="hover:text-red-200 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="form-section pb-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-3xl">ℹ️</span>Additional Information</h3>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Specifications</label>
                  <textarea
                    name="specifications"
                    value={form.specifications}
                    onChange={handleChange}
                    placeholder="Technical specifications..."
                    rows="3"
                    className="input-field w-full"
                  ></textarea>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={form.warranty}
                    onChange={handleChange}
                    placeholder="e.g., 2 years warranty"
                    className="input-field w-full"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    id="isActive"
                    className="w-5 h-5 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="font-semibold text-gray-700 cursor-pointer">
                    ✓ Active Product
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions flex gap-4 justify-end pt-6">
              <button
                className="btn-secondary px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl"
                onClick={() => window.history.back()}
              >
                ← Cancel
              </button>
              <button
                className="btn-primary px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
