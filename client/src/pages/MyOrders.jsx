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
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">📦 No Orders Found</h2>
          <p className="text-gray-600">Your orders will appear here after purchasing.</p>
          <button onClick={() => window.location.href = '/products'} className="btn-primary mt-4 px-6 py-2">Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">📋 My Orders</h2>
          <button 
            className="btn-primary px-4 py-2"
            onClick={loadOrders}
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Status'}
          </button>
        </div>

        <div className="space-y-8">
          {orders.map((order) => {
          const stage = getTrackingStage(order);
          const dates = getTrackingDates(order.createdAt);
          const now = new Date();

            return (
              <div key={order._id} className="card bg-white p-8 shadow-lg hover:shadow-xl">
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className="text-sm text-gray-600 mt-1">Ordered on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-md ${order.stages?.delivered?.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {order.stages?.delivered?.completed ? '✓ Delivered' : '📦 In Transit'}
                    </span>
                  </div>
                </div>

                {/* Tracking Timeline - Sequential Stages */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg text-gray-900">📊 Delivery Progress</h4>
                    <span className="text-sm font-semibold text-primary">{Math.round((stage / 4) * 100)}% Complete</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
                    <div className="h-3 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${(stage / 4) * 100}%` }}></div>
                  </div>

                  {/* Sequential Stage Cards */}
                  <div className="space-y-3">
                    {/* Stage 0: Ordered */}
                    <div className={`p-4 rounded-lg border-2 transition-all ${stage >= 0 ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${stage >= 0 ? 'bg-gradient-to-r from-primary to-primary-dark' : 'bg-gray-400'}`}>
                            ✓
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">📦 Order Placed</div>
                            <div className="text-sm text-gray-600">{formatDate(dates.ordered)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage 1: Packing */}
                    <div className={`p-4 rounded-lg border-2 transition-all ${stage >= 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'} ${stage < 1 ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${stage >= 1 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-400'}`}>
                            {stage >= 1 ? '✓' : '2'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">📋 Packing</div>
                            <div className="text-sm text-gray-600">{stage >= 1 ? formatDate(dates.packing) : 'Pending'}</div>
                          </div>
                        </div>
                        {stage >= 1 && <span className="text-xl">✓</span>}
                      </div>
                    </div>

                    {/* Stage 2: Shipped */}
                    <div className={`p-4 rounded-lg border-2 transition-all ${stage >= 2 ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'} ${stage < 2 ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${stage >= 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gray-400'}`}>
                            {stage >= 2 ? '✓' : '3'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">🚚 Shipped</div>
                            <div className="text-sm text-gray-600">{stage >= 2 ? formatDate(dates.shipped) : 'Pending'}</div>
                          </div>
                        </div>
                        {stage >= 2 && <span className="text-xl">✓</span>}
                      </div>
                    </div>

                    {/* Stage 3: Out for Delivery */}
                    <div className={`p-4 rounded-lg border-2 transition-all ${stage >= 3 ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'} ${stage < 3 ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${stage >= 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gray-400'}`}>
                            {stage >= 3 ? '✓' : '4'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">🚗 Out for Delivery</div>
                            <div className="text-sm text-gray-600">{stage >= 3 ? formatDate(dates.outForDelivery) : 'Pending'}</div>
                          </div>
                        </div>
                        {stage >= 3 && <span className="text-xl">✓</span>}
                      </div>
                    </div>

                    {/* Stage 4: Delivered */}
                    <div className={`p-4 rounded-lg border-2 transition-all ${stage >= 4 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} ${stage < 4 ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${stage >= 4 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-400'}`}>
                            {stage >= 4 ? '✓' : '5'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">🎉 Delivered</div>
                            <div className="text-sm text-gray-600">{stage >= 4 ? formatDate(dates.delivery) : 'Expected soon'}</div>
                          </div>
                        </div>
                        {stage >= 4 && <span className="text-xl">✓</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="lg:col-span-2">
                    <h4 className="font-bold text-gray-900 mb-4">Items ({order.items.length})</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => {
                        const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                        const productName = product?.title || product?.name || item.title || item.name || "Product";
                        const productBrand = product?.brand || item.brand || "N/A";
                        const productImage = product?.images?.[0] || product?.imageUrl || item.image || "";

                        return (
                          <div key={idx} className="card p-4 flex items-center gap-4 shadow-md hover:shadow-lg">
                            {productImage && (
                              <img src={productImage} alt={productName} className="w-20 h-20 object-cover rounded-lg shadow-md" />
                            )}
                            <div className="flex-grow">
                              <div className="font-bold text-gray-900">{productName}</div>
                              <div className="text-sm text-gray-600">Brand: {productBrand} • Qty: {item.quantity}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary text-lg">₹{item.price * item.quantity}</div>
                              <div className="text-sm text-gray-500">₹{item.price} each</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card p-6 shadow-lg h-fit">
                    <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
                    <div className="space-y-2 text-gray-700 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold">₹{order.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span className="font-semibold text-green-600">FREE</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-primary">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Delivery Address</h4>
                  <p className="text-gray-700 leading-relaxed">{order.address?.street || "Address not specified"}{order.address?.city ? `, ${order.address.city}` : ''}{order.address?.zipCode ? ` - ${order.address.zipCode}` : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
