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
      <div className="admin-dashboard">
        <h2>📊 Admin Dashboard</h2>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h2>📊 Admin Dashboard</h2>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "metrics" ? "active" : ""}`}
          onClick={() => setActiveTab("metrics")}
        >
          📈 Data Metrics
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📋 Order Management
        </button>
        <button
          className={`tab-btn ${activeTab === "stock" ? "active" : ""}`}
          onClick={() => setActiveTab("stock")}
        >
          📦 Stock Management
        </button>
      </div>

      {/* SECTION 1: DATA METRICS */}
      {activeTab === "metrics" && (
        <div className="dashboard-section">
          <h3>📊 Data Metrics</h3>

          {/* Summary Cards */}
          <div className="metrics-cards">
            <div className="metric-card">
              <p className="metric-label">Total Products</p>
              <p className="metric-value">{stats.totalProducts}</p>
            </div>

            <div className="metric-card">
              <p className="metric-label">Total Orders</p>
              <p className="metric-value">{orderStats.totalOrders}</p>
            </div>

            <div className="metric-card">
              <p className="metric-label">Delivered</p>
              <p className="metric-value green">{orderStats.deliveredOrders}</p>
            </div>

            <div className="metric-card">
              <p className="metric-label">Pending</p>
              <p className="metric-value orange">{orderStats.pendingOrders}</p>
            </div>
          </div>

          {/* Products Per Category */}
          <div className="metrics-table">
            <h4>Products Per Category</h4>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.productsPerCategory.map((cat, i) => (
                  <tr key={i}>
                    <td>{cat._id}</td>
                    <td>{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Orders Per Month */}
          <div className="metrics-table">
            <h4>Orders Per Month (Last 12 Months)</h4>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {orderStats.ordersPerMonth.map((month, i) => (
                  <tr key={i}>
                    <td>{month._id}</td>
                    <td>{month.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: ORDER MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="dashboard-section">
          <h3>📋 Order Management</h3>

          <div className="orders-management">
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              orders.map((order) => {
                const nextStage = getNextStage(order);
                return (
                  <div className="order-management-card" key={order._id}>
                    {/* Order Header */}
                    <div className="order-mgmt-header">
                      <div>
                        <h4>Order #{order._id.slice(-8)}</h4>
                        <p className="order-date">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="order-mgmt-status">
                        <span className="status-badge">{order.status.toUpperCase()}</span>
                        <p className="total">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="order-user-details">
                      <div>
                        <p><strong>Customer:</strong> {order.userId?.name}</p>
                        <p><strong>Email:</strong> {order.userId?.email}</p>
                        <p><strong>Phone:</strong> {order.userId?.phone}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong> {order.address?.fullAddress || order.address}</p>
                        <p><strong>Pincode:</strong> {order.pin}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-items-mgmt">
                      <p><strong>Items:</strong></p>
                      {order.items.map((item, idx) => (
                        <p key={idx} className="item-line">
                          • {item.title} (x{item.quantity}) - ₹{item.price * item.quantity}
                        </p>
                      ))}
                    </div>

                    {/* Stage Buttons */}
                    <div className="order-stages-mgmt">
                      <button
                        className={`stage-btn ${order.stages.packing.completed ? "completed" : ""}`}
                        onClick={() => handleUpdateOrderStage(order._id, "packing")}
                        disabled={updatingStage === order._id}
                      >
                        ✓ Packing
                      </button>
                      <button
                        className={`stage-btn ${order.stages.shipped.completed ? "completed" : ""}`}
                        onClick={() => handleUpdateOrderStage(order._id, "shipped")}
                        disabled={updatingStage === order._id || !order.stages.packing.completed}
                      >
                        ✓ Shipped
                      </button>
                      <button
                        className={`stage-btn ${order.stages.outForDelivery.completed ? "completed" : ""}`}
                        onClick={() => handleUpdateOrderStage(order._id, "outForDelivery")}
                        disabled={updatingStage === order._id || !order.stages.shipped.completed}
                      >
                        ✓ Out for Delivery
                      </button>
                      <button
                        className={`stage-btn ${order.stages.delivered.completed ? "completed" : ""}`}
                        onClick={() => handleUpdateOrderStage(order._id, "delivered")}
                        disabled={updatingStage === order._id || !order.stages.outForDelivery.completed}
                      >
                        ✓ Delivered
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: STOCK MANAGEMENT */}
      {activeTab === "stock" && (
        <div className="dashboard-section">
          <h3>📦 Stock Management (Stock &lt; 5)</h3>

          {lowStockProducts.length === 0 ? (
            <p className="stock-okay">✓ All products have sufficient stock!</p>
          ) : (
            <div className="stock-items">
              {lowStockProducts.map((product) => (
                <div className="low-stock-item" key={product._id}>
                  <div className="stock-product-info">
                    <h4>{product.name}</h4>
                    <p>Category: {product.category}</p>
                    <p>Brand: {product.brand}</p>
                    <p className="stock-warning">
                      ⚠️ Current Stock: <strong>{product.stock}</strong> units
                    </p>
                  </div>

                  <div className="add-stock-group">
                    <input
                      type="number"
                      min="1"
                      placeholder="Add quantity"
                      value={stockInput[product._id] || ""}
                      onChange={(e) =>
                        setStockInput({
                          ...stockInput,
                          [product._id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="btn-primary"
                      onClick={() => handleAddStock(product._id)}
                      disabled={addingStock === product._id}
                    >
                      {addingStock === product._id ? "Adding..." : "Add Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
