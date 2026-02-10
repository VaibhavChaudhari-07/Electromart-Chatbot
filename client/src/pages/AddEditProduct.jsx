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
    <div className="add-edit-product-container">
      <h2>{isEditMode ? "✏️ Edit Product" : "➕ Add New Product"}</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="product-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>📝 Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Apple MacBook Air M1"
              />
            </div>

            <div className="form-group">
              <label>Title (Alternative)</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Product title"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g., Apple"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Laptops</option>
                <option>Smartphones</option>
                <option>Smart TVs</option>
                <option>Wearables</option>
                <option>Accessories</option>
              </select>
            </div>
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows="4"
            ></textarea>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="form-section">
          <h3>💰 Pricing</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Sale Price *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>MRP (Original Price)</label>
              <input
                type="number"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Discount %</label>
              <input
                type="number"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Stock & Ratings */}
        <div className="form-section">
          <h3>📦 Stock & Ratings</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <input
                type="number"
                name="rating"
                value={form.rating}
                onChange={handleChange}
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Rating Count</label>
              <input
                type="number"
                name="ratingCount"
                value={form.ratingCount}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>🖼️ Images & Media</h3>

          <div className="form-group full">
            <label>Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {form.imageUrl && (
            <div className="image-preview">
              <img src={form.imageUrl} alt="Preview" onError={(e) => {
                e.target.src = "https://via.placeholder.com/200x200?text=Image+Error";
              }} />
            </div>
          )}
        </div>

        {/* Features */}
        <div className="form-section">
          <h3>✨ Features</h3>

          <div className="form-row">
            <div className="form-group full">
              <label>Add Feature</label>
              <div className="feature-input-group">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g., 16GB RAM"
                  onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <button 
                  type="button" 
                  onClick={handleAddFeature}
                  className="btn-add-feature"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {form.features.length > 0 && (
            <div className="features-list">
              {form.features.map((feature, index) => (
                <div key={index} className="feature-tag">
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="remove-feature"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="form-section">
          <h3>ℹ️ Additional Information</h3>

          <div className="form-group full">
            <label>Specifications</label>
            <textarea
              name="specifications"
              value={form.specifications}
              onChange={handleChange}
              placeholder="Technical specifications..."
              rows="3"
            ></textarea>
          </div>

          <div className="form-group full">
            <label>Warranty</label>
            <input
              type="text"
              name="warranty"
              value={form.warranty}
              onChange={handleChange}
              placeholder="e.g., 2 years warranty"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              id="isActive"
            />
            <label htmlFor="isActive">Active Product</label>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            ← Cancel
          </button>
          <button
            className="btn-primary"
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
  );
}
