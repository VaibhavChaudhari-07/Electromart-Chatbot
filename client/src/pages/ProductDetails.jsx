import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../api/axiosClient";

export default function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeParams = useParams();
  const initialProduct = location.state?.product;
  const [product, setProduct] = useState(initialProduct || null);

  // If we don't have specifications or full product, fetch from API by id
  useEffect(() => {
    const id = routeParams.id || (initialProduct && (initialProduct._id || initialProduct.id));
    if (!id) return;
    // If product missing or specs missing, fetch fresh
    if (!product || !product.specifications || Object.keys(product.specifications || {}).length === 0) {
      axios
        .get(`/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => {
          console.error("Failed to fetch full product:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
      {/* Product Images */}
      <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
        <img
          src={product.images?.[0] || product.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={product.title || product.name}
          className="rounded-lg shadow-md w-full h-auto object-contain"
        />
      </div>
      {/* Product Details */}
      <div className="md:w-1/2 p-8 flex flex-col">
        <h2 className="text-3xl font-bold text-primary mb-2">{product.title || product.name}</h2>
        <p className="text-lg text-gray-600 mb-2">{product.brand}</p>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-yellow-400 text-xl">⭐ {product.rating}</span>
          <span className="text-gray-500">({product.ratingCount} reviews)</span>
        </div>
        <div className="mb-4">
          <span className="text-2xl font-bold text-green-600 mr-2">₹{product.price}</span>
          {product.mrp && product.mrp !== product.price && (
            <span className="text-lg line-through text-gray-400">₹{product.mrp}</span>
          )}
          {product.discountPercentage > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">-{product.discountPercentage}%</span>
          )}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Stock:</span> {product.stock > 0 ? (
            <span className="text-green-600 font-bold ml-1">{product.stock} in stock</span>
          ) : (
            <span className="text-red-600 font-bold ml-1">Out of stock</span>
          )}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Warranty:</span> {product.warranty || "N/A"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Category:</span> {product.category}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Description:</span>
          <p className="text-gray-700 mt-1">{product.description || "No description available."}</p>
        </div>
        {/* Flexible specifications rendering: support several possible keys and formats */}
        {(() => {
          // Detect possible spec sources and normalize to an object or array
          let raw =
            product.specifications ||
            product.specs ||
            product.technicalSpecifications ||
            product.technical_specifications ||
            product.attributes ||
            null;

          // If specs stored as JSON string, try parse
          if (typeof raw === "string" && raw.trim()) {
            try {
              const parsed = JSON.parse(raw);
              raw = parsed;
            } catch (e) {
              // Not JSON; keep as string
            }
          }

          if (!raw) {
            return (
              <div className="mb-6">
                <span className="font-semibold text-lg block mb-2">Specifications</span>
                <div className="text-sm text-gray-600">No specifications available for this product.</div>
              </div>
            );
          }

          // If specs is an array of sections
          if (Array.isArray(raw) && raw.length > 0) {
            return (
              <div className="mb-6">
                <span className="font-semibold text-lg block mb-3">Specifications</span>
                <div className="space-y-4">
                  {raw.map((section, si) => (
                    <div key={si} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      {section.section && <div className="font-medium mb-2">{section.section}</div>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(section.specs || section).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <div className="text-sm text-gray-600 w-1/3 font-medium">{k.replace(/_/g, ' ')}</div>
                            <div className="text-sm text-gray-900">{String(v)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // If specs is an object of key -> value
          if (typeof raw === "object" && Object.keys(raw).length > 0) {
            return (
              <div className="mb-6">
                <span className="font-semibold text-lg block mb-3">Specifications</span>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg bg-white">
                    <tbody>
                      {Object.entries(raw).map(([key, value]) => (
                        <tr key={key} className="border-b last:border-b-0">
                          <td className="px-4 py-3 font-medium text-gray-700 capitalize w-1/3 bg-gray-50">{key.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3 text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // Fall back: show raw string
          return (
            <div className="mb-6">
              <span className="font-semibold text-lg block mb-2">Specifications</span>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{String(raw)}</div>
            </div>
          );
        })()}
        <div className="flex gap-4 mt-auto">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btn-success">Add to Cart</button>
          <button className="btn btn-warning">Buy Now</button>
        </div>
      </div>
    </div>
  );
}
