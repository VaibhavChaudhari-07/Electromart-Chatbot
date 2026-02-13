import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const { user } = useUser();
  const { admin } = useAdmin();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ["all", "laptops", "mobiles", "tablets", "headphones", "accessories"];

  // Fetch products
  useEffect(() => {
    setLoading(true);
    axios
      .get("/products")
      .then((res) => {
        setProducts(res.data || []);
        setFiltered(res.data || []);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load products. Please try again.");
        setProducts([]);
        setFiltered([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Get unique brands
  const uniqueBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  // Filter logic
  useEffect(() => {
    let temp = [...products];

    // Search filter
    if (search.trim()) {
      const s = search.toLowerCase();
      temp = temp.filter(
        (p) =>
          (p.title || p.name || "").toLowerCase().includes(s) ||
          (p.brand || "").toLowerCase().includes(s) ||
          (p.description || "").toLowerCase().includes(s)
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      temp = temp.filter(
        (p) => (p.category || "").toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Price range filter
    temp = temp.filter((p) => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Brand filter
    if (selectedBrands.length > 0) {
      temp = temp.filter((p) => selectedBrands.includes(p.brand));
    }

    // Discount filter
    if (selectedDiscounts.length > 0) {
      temp = temp.filter((p) => {
        const discount = p.discountPercentage || 0;
        return selectedDiscounts.some((range) => {
          if (range === "no-discount") return discount === 0;
          if (range === "0-25") return discount > 0 && discount <= 25;
          if (range === "25-50") return discount > 25 && discount <= 50;
          if (range === "50+") return discount > 50;
          return false;
        });
      });
    }

    setFiltered(temp);
  }, [search, activeCategory, priceRange, selectedBrands, selectedDiscounts, products]);

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Delete this product?")) {
      axios
        .delete(`/admin/delete-product/${productId}`)
        .then(() => {
          setProducts((prev) => prev.filter((p) => p._id !== productId));
        })
        .catch(() => alert("Delete failed"));
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/add-edit-product/${productId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🛍️ Products</h1>
          <p className="text-gray-600">Discover our amazing collection of electronics</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search products by name, brand, or description..."
            className="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-min">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-5 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeCategory === c
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
                    : "bg-white border-2 border-gray-300 text-gray-700 hover:border-primary"
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Filters Bar: Price - Brand - Discount */}
        <div className="mb-6">
          <div className="flex gap-2 items-center w-full flex-wrap lg:flex-nowrap">
            {/* Price small inputs */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
                className="w-20 px-2 py-1 text-sm border-r border-gray-200"
                placeholder="Min"
              />
              <span className="text-sm px-1">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 500000)])}
                className="w-20 px-2 py-1 text-sm"
                placeholder="Max"
              />
            </div>

            {/* Brand dropdown */}
            <select
              value={selectedBrands[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBrands(val ? [val] : []);
              }}
              className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-md"
            >
              <option value="">All Brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Discount dropdown */}
            <select
              value={selectedDiscounts[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDiscounts(val ? [val] : []);
              }}
              className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-md"
            >
              <option value="">All Discounts</option>
              <option value="no-discount">No Discount</option>
              <option value="0-25">0% - 25%</option>
              <option value="25-50">25% - 50%</option>
              <option value="50+">50%+</option>
            </select>

            {/* Clear button */}
            <button
              onClick={() => {
                setPriceRange([0, 500000]);
                setSelectedBrands([]);
                setSelectedDiscounts([]);
                setSearch("");
                setActiveCategory("all");
              }}
              className="px-3 py-2 bg-gray-100 rounded-md text-sm font-semibold hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">📭 No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600 font-semibold">
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  onDelete={handleDeleteProduct}
                  onEdit={handleEditProduct}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
