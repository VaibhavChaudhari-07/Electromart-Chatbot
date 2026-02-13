import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    productsPerCategory: [],
    allProducts: [],
  });

  const [orders, setOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stockInput, setStockInput] = useState({});
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    ordersPerMonth: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("metrics");
  const [updatingStage, setUpdatingStage] = useState(null);
  const [addingStock, setAddingStock] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, lowStockRes, orderStatsRes] = await Promise.all([
        axios.get("/products/admin/dashboard-stats"),
        axios.get("/orders/admin/all"),
        axios.get("/products/admin/low-stock"),
        axios.get("/orders/admin/stats"),
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setLowStockProducts(lowStockRes.data);
      setOrderStats(orderStatsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateOrderStage = async (orderId, stage) => {
    setUpdatingStage(orderId);
    try {
      await axios.put("/orders/admin/update-stage", { orderId, stage });
      loadDashboardData();
      setUpdatingStage(null);
    } catch (err) {
      console.error(err);
      setUpdatingStage(null);
    }
  };

  const handleAddStock = async (productId) => {
    const quantity = parseInt(stockInput[productId]) || 0;
    if (quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setAddingStock(productId);
    try {
      await axios.put(`/products/admin/add-stock/${productId}`, { quantity });
      loadDashboardData();
      setStockInput({ ...stockInput, [productId]: "" });
      setAddingStock(null);
    } catch (err) {
      console.error(err);
      setAddingStock(null);
    }
  };

  const getNextStage = (order) => {
    if (!order.stages.packing.completed) return "packing";
    if (!order.stages.shipped.completed) return "shipped";
    if (!order.stages.outForDelivery.completed) return "outForDelivery";
    if (!order.stages.delivered.completed) return "delivered";
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">📊 Admin Dashboard</h2>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">📊 Admin Dashboard</h2>
          <div className="space-x-2">
            <button className={`px-4 py-2 rounded ${activeTab==='metrics'?'bg-primary text-white':''}`} onClick={() => setActiveTab('metrics')}>📈 Data Metrics</button>
            <button className={`px-4 py-2 rounded ${activeTab==='orders'?'bg-primary text-white':''}`} onClick={() => setActiveTab('orders')}>📋 Order Management</button>
            <button className={`px-4 py-2 rounded ${activeTab==='stock'?'bg-primary text-white':''}`} onClick={() => setActiveTab('stock')}>📦 Stock Management</button>
          </div>
        </div>

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-8 shadow-lg hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Products</p>
                    <p className="text-4xl font-bold text-primary mt-2">{stats.totalProducts}</p>
                  </div>
                  <div className="text-5xl opacity-20">📦</div>
                </div>
              </div>

              <div className="card p-8 shadow-lg hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Orders</p>
                    <p className="text-4xl font-bold text-accent mt-2">{orderStats.totalOrders}</p>
                  </div>
                  <div className="text-5xl opacity-20">📋</div>
                </div>
              </div>

              <div className="card p-8 shadow-lg hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Delivered</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{orderStats.deliveredOrders}</p>
                    <p className="text-xs text-gray-500 mt-1">({Math.round((orderStats.deliveredOrders / orderStats.totalOrders) * 100)}%)</p>
                  </div>
                  <div className="text-5xl opacity-20">✓</div>
                </div>
              </div>

              <div className="card p-8 shadow-lg hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending</p>
                    <p className="text-4xl font-bold text-yellow-600 mt-2">{orderStats.pendingOrders}</p>
                    <p className="text-xs text-gray-500 mt-1">({Math.round((orderStats.pendingOrders / orderStats.totalOrders) * 100)}%)</p>
                  </div>
                  <div className="text-5xl opacity-20">⏳</div>
                </div>
              </div>
            </div>

            {/* Products by Category */}
            <div className="card p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Products by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.productsPerCategory?.map((cat) => (
                  <div key={cat.category} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-200">
                    <div className="text-3xl font-bold text-primary mb-2">{cat.count}</div>
                    <p className="text-sm font-semibold text-gray-700">{cat.category}</p>
                    <p className="text-xs text-gray-500 mt-2">{Math.round((cat.count / stats.totalProducts) * 100)}% of total</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Orders Chart */}
            <div className="card p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Orders per Month</h3>
              <div className="space-y-3">
                {orderStats.ordersPerMonth?.map((month, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 font-semibold text-gray-700">{month.month}</div>
                    <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden h-12">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-full flex items-center justify-end pr-4 font-bold text-white transition-all duration-300"
                        style={{ width: `${(month.orders / (Math.max(...orderStats.ordersPerMonth.map(m => m.orders), 1)) * 100)}%` }}
                      >
                        {month.orders}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="card p-12 text-center shadow-lg">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-lg font-semibold text-gray-600">No orders found</p>
              </div>
            ) : (
              orders.map(order => {
                const nextStage = getNextStage(order);
                return (
                  <div key={order._id} className="card p-8 shadow-lg hover:shadow-2xl">
                    <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h4>
                        <p className="text-sm text-gray-600 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">₹{order.totalAmount}</div>
                          <div className="text-xs text-gray-500 font-semibold mt-1">{order.items.length} items</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
                      <div className="card p-4 bg-gray-50">
                        <p className="text-xs font-bold text-gray-600 uppercase mb-2">Customer</p>
                        <p className="font-bold text-gray-900">{order.userId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.userId?.email}</p>
                        <p className="text-sm text-gray-600">{order.userId?.phone}</p>
                      </div>
                      <div className="card p-4 bg-gray-50">
                        <p className="text-xs font-bold text-gray-600 uppercase mb-2">Delivery Address</p>
                        <p className="text-sm font-semibold text-gray-900">{order.address?.fullAddress || order.address}</p>
                        <p className="text-sm text-gray-600">PIN: {order.pin}</p>
                      </div>
                      <div className="card p-4 bg-gray-50">
                        <p className="text-xs font-bold text-gray-600 uppercase mb-2">Items</p>
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((it, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              • {it.title} <span className="text-gray-600">x{it.quantity}</span>
                            </p>
                          ))}
                          {order.items.length > 3 && <p className="text-sm text-primary font-semibold">+ {order.items.length - 3} more</p>}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Stages */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-4">Delivery Stages</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { key: 'packing', label: '📋 Packing', color: 'from-blue-500 to-blue-600' },
                          { key: 'shipped', label: '🚚 Shipped', color: 'from-purple-500 to-purple-600' },
                          { key: 'outForDelivery', label: '📍 Out for Delivery', color: 'from-orange-500 to-orange-600' },
                          { key: 'delivered', label: '✓ Delivered', color: 'from-green-500 to-green-600' },
                        ].map((stage) => (
                          <button
                            key={stage.key}
                            onClick={() => handleUpdateOrderStage(order._id, stage.key)}
                            disabled={updatingStage === order._id || order.stages[stage.key]?.completed}
                            className={`py-3 px-2 rounded-lg font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                              order.stages[stage.key]?.completed
                                ? `bg-gradient-to-r ${stage.color}`
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          >
                            {stage.label}
                          </button>
                        ))}
                      </div>
                      {updatingStage === order._id && <p className="text-sm text-primary font-semibold mt-2">Updating...</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4">📦 Stock Management (Stock &lt; 5)</h3>
            {lowStockProducts.length === 0 ? (
              <div className="text-green-600 font-semibold">✓ All products have sufficient stock!</div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">Category: {product.category} • Brand: {product.brand}</p>
                      <p className="text-sm text-red-600 mt-1">⚠️ Current Stock: <strong>{product.stock}</strong> units</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" placeholder="Qty" value={stockInput[product._id] || ''} onChange={(e) => setStockInput({...stockInput, [product._id]: e.target.value})} className="input-field w-32" />
                      <button onClick={() => handleAddStock(product._id)} className="btn-primary">{addingStock===product._id?'Adding...':'Add Stock'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
