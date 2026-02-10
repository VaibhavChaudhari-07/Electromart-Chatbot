import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3 className="footer-brand">ElectroMart</h3>
        <p>Your trusted store for the best electronic gadgets.</p>

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <a href="/login">Login</a>
        </div>

        <p className="footer-copy">© {new Date().getFullYear()} ElectroMart. All rights reserved.</p>
      </div>
    </footer>
  );
}
