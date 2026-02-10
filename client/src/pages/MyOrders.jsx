import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import { useUser } from "../context/UserContext";

export default function MyOrders() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`/orders/${user._id}`);
      const enrichedOrders = res.data.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          productId: item.productId && typeof item.productId === 'object' ? item.productId : null,
        })),
      }));
      setOrders(enrichedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Auto-refresh orders every 30 seconds to reflect admin updates
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  /* Get tracking stage from actual order stages (updated by admin) */
  const getTrackingStage = (order) => {
    if (order.stages) {
      if (order.stages.delivered?.completed) return 4;
      if (order.stages.outForDelivery?.completed) return 3;
      if (order.stages.shipped?.completed) return 2;
      if (order.stages.packing?.completed) return 1;
    }
    return 0;
  };

  /* Calculate dates for tracking stages */
  const getTrackingDates = (orderDate) => {
    const placed = new Date(orderDate);
    const packing = new Date(placed);
    packing.setDate(packing.getDate() + 1);
    const shipped = new Date(placed);
    shipped.setDate(shipped.getDate() + 2);
    const outForDelivery = new Date(placed);
    outForDelivery.setDate(outForDelivery.getDate() + 3);
    const delivery = new Date(placed);
    delivery.setDate(delivery.getDate() + 4);

    return {
      ordered: placed,
      packing: packing,
      shipped: shipped,
      outForDelivery: outForDelivery,
      delivery: delivery,
    };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orders.length === 0) {
    return (
      <div className="myorders-container">
        <h2>📦 No Orders Found</h2>
        <p>Your orders will appear here after purchasing.</p>
      </div>
    );
  }

  return (
    <div className="myorders-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📋 My Orders</h2>
        <button 
          className="btn-primary" 
          onClick={loadOrders}
          disabled={loading}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Status'}
        </button>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const stage = getTrackingStage(order);
          const dates = getTrackingDates(order.createdAt);
          const now = new Date();

          return (
            <div className="order-card-enhanced" key={order._id}>
              {/* Order Header */}
              <div className="order-header">
                <div className="order-info-top">
                  <h3>Order #{order._id.slice(-8)}</h3>
                  <span className="order-status">
                    {order.stages?.delivered?.completed ? "✓ Delivered" : order.stages?.packing?.completed === false ? "🕐 Processing" : "📦 In Transit"}
                  </span>
                </div>
                <p className="order-date">
                  Ordered on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </p>
              </div>

              {/* Delivery Tracking Timeline */}
              <div className="tracking-section">
                <h4>📍 Delivery Progress</h4>

                <div className="timeline-container">
                  {/* Timeline Line */}
                  <div className="timeline-base">
                    <div
                      className="timeline-progress"
                      style={{ width: `${(stage / 4) * 100}%` }}
                    ></div>
                  </div>

                  {/* Timeline Steps */}
                  <div className="timeline-steps-enhanced">
                    {/* Step 1: Packing */}
                    <div className={`timeline-step ${order.stages?.packing?.completed ? "completed" : "pending"}`}>
                      <div className="step-dot"></div>
                      <div className="step-content">
                        <p className="step-title">Packing</p>
                        {order.stages?.packing?.completed ? (
                          <p className="step-date">✓ {formatDate(order.stages.packing.completedAt)}</p>
                        ) : (
                          <p className="step-expected">Pending</p>
                        )}
                      </div>
                    </div>

                    {/* Step 2: Shipped */}
                    <div className={`timeline-step ${order.stages?.shipped?.completed ? "completed" : "pending"}`}>
                      <div className="step-dot"></div>
                      <div className="step-content">
                        <p className="step-title">Shipped</p>
                        {order.stages?.shipped?.completed ? (
                          <p className="step-date">✓ {formatDate(order.stages.shipped.completedAt)}</p>
                        ) : (
                          <p className="step-expected">Pending</p>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Out for Delivery */}
                    <div className={`timeline-step ${order.stages?.outForDelivery?.completed ? "completed" : "pending"}`}>
                      <div className="step-dot"></div>
                      <div className="step-content">
                        <p className="step-title">Out for Delivery</p>
                        {order.stages?.outForDelivery?.completed ? (
                          <p className="step-date">✓ {formatDate(order.stages.outForDelivery.completedAt)}</p>
                        ) : (
                          <p className="step-expected">Pending</p>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className={`timeline-step ${order.stages?.delivered?.completed ? "completed" : "pending"}`}>
                      <div className="step-dot"></div>
                      <div className="step-content">
                        <p className="step-title">Delivered</p>
                        {order.stages?.delivered?.completed ? (
                          <p className="step-date">✓ {formatDate(order.stages.delivered.completedAt)}</p>
                        ) : (
                          <p className="step-expected">Pending</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items-section">
                <h4>📦 Items ({order.items.length})</h4>
                <div className="order-items-list">
                  {order.items.map((item, index) => {
                    const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                    const productName = product?.title || product?.name || item.title || item.name || "Product";
                    const productBrand = product?.brand || item.brand || "N/A";
                    const productImage = product?.images?.[0] || product?.imageUrl || item.image || "";
                    
                    return (
                      <div className="order-item" key={index}>
                        {productImage && (
                          <img src={productImage} alt={productName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        <div className="item-info">
                          <p className="item-name">{productName}</p>
                          <p className="item-brand">Brand: {productBrand}</p>
                          <p className="item-qty">Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          <p>₹{item.price * item.quantity}</p>
                          <small>₹{item.price} each</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee:</span>
                  <span>FREE</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span><strong>Total Amount:</strong></span>
                  <span className="total-price">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="order-address">
                <h4>📍 Delivery Address</h4>
                <p>
                  {order.address?.street || "Address not specified"}, 
                  {order.address?.city ? ` ${order.address.city}` : ""} 
                  {order.address?.zipCode ? ` - ${order.address.zipCode}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
