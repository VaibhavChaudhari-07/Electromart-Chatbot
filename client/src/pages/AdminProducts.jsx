import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import ProductCard from "../components/ProductCard";

export default function AdminProducts() {
  const { admin } = useAdmin();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);

  const categories = ["all", "laptops", "smartphones", "smart tvs", "wearables", "accessories"];

  useEffect(() => {
    axios
      .get("/products")
      .then((res) => {
        setProducts(res.data || []);
        setFiltered(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const uniqueBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  useEffect(() => {
    let temp = [...products];

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      temp = temp.filter(
        (p) =>
          (p.title || p.name || "").toLowerCase().includes(s) ||
          (p.brand || "").toLowerCase().includes(s) ||
          (p.description || "").toLowerCase().includes(s)
      );
    }

    if (activeCategory !== "all") {
      temp = temp.filter((p) => (p.category || "").toLowerCase() === activeCategory.toLowerCase());
    }

    temp = temp.filter((p) => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedBrands.length > 0) temp = temp.filter((p) => selectedBrands.includes(p.brand));

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

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    axios
      .delete(`/admin/delete-product/${id}`)
      .then(() => {
        const updated = products.filter((p) => p._id !== id);
        setProducts(updated);
        setFiltered(updated);
      })
      .catch((err) => {
        alert("Failed to delete product");
        console.error(err);
      });
  };

  const handleEdit = (id) => navigate(`/admin/add-edit-product/${id}`);

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Admin access required</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">📦 Manage Products</h2>
          <button className="btn-primary" onClick={() => navigate('/admin/add-edit-product')}>➕ Add New Product</button>
        </div>

        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field w-full" />
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1">
              <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value||0), priceRange[1]])} className="w-24 px-2 py-1 text-sm border-r border-gray-200" />
              <span className="text-sm px-1">-</span>
              <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value||500000)])} className="w-24 px-2 py-1 text-sm" />
            </div>

            <select value={selectedBrands[0]||""} onChange={(e)=>{const v=e.target.value; setSelectedBrands(v? [v]: []);}} className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-md">
              <option value="">All Brands</option>
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select value={selectedDiscounts[0]||""} onChange={(e)=>{const v=e.target.value; setSelectedDiscounts(v? [v]: []);}} className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-md">
              <option value="">All</option>
              <option value="no-discount">No Discount</option>
              <option value="0-25">0% - 25%</option>
              <option value="25-50">25% - 50%</option>
              <option value="50+">50%+</option>
            </select>
            <button onClick={()=>{setPriceRange([0,500000]); setSelectedBrands([]); setSelectedDiscounts([]);}} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Clear</button>
          </div>
        </div>


        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-3 py-1 rounded ${activeCategory===c?'bg-primary text-white':'bg-white border'}`}>{c.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <ProductCard key={item._id} item={item} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>
      </div>
    </div>
  );
}
