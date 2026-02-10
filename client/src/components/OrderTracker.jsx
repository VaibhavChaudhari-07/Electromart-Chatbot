import React from "react";

export default function OrderTracker({ stage }) {
  /*
    stage = number from 0 to 4
    0 = placed (no progress)
    1 = packing
    2 = shipped
    3 = out for delivery
    4 = delivered
  */

  const getWidth = () => (stage / 4) * 100;

  return (
    <div className="tracker-container">
      <div className="tracker-line">
        <div
          className="tracker-progress"
          style={{ width: `${getWidth()}%` }}
        />
      </div>

      <div className="tracker-steps">
        <span className={stage >= 1 ? "tracker-active" : ""}>Packing</span>
        <span className={stage >= 2 ? "tracker-active" : ""}>Shipped</span>
        <span className={stage >= 3 ? "tracker-active" : ""}>Out for Delivery</span>
        <span className={stage >= 4 ? "tracker-active" : ""}>Delivered</span>
      </div>
    </div>
  );
}
