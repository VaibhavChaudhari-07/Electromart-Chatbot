import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-white">ElectroMart</h3>
          <p className="text-gray-300">Your trusted store for the best electronic gadgets.</p>
        </div>

        <div className="flex gap-6">
          <div>
            <h4 className="font-semibold">Navigate</h4>
            <ul className="mt-2 text-gray-300">
              <li><a href="/">Home</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>
        </div>

        <div className="text-gray-400 text-sm">© {new Date().getFullYear()} ElectroMart. All rights reserved.</div>
      </div>
    </footer>
  );
}
