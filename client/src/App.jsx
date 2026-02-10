import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Layout & Common components */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatbotWidget from "./components/ChatbotWidget";

/* Pages - Public / User */
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import Account from "./pages/Account";
import UpdateDetails from "./pages/UpdateDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";

/* Admin pages */
import AdminHome from "./pages/AdminHome";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AddEditProduct from "./pages/AddEditProduct";
import AdminAccount from "./pages/AdminAccount";
import AdminSignup from "./pages/AdminSignup";

/* Context hooks */
import { useUser } from "./context/UserContext";
import { useAdmin } from "./context/AdminContext";
import { useChatbot } from "./context/ChatbotContext";

/* Simple route guards */
function RequireUser({ children }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/login?mode=user" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/login?mode=admin" replace />;
  return children;
}

export default function App() {
  const { open: chatbotOpen } = useChatbot();

  return (
    <BrowserRouter>
      <div
        className="app-root"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Navbar />

        {/* Main content area */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public / Guest */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* User-only pages (protected) */}
            <Route
              path="/cart"
              element={
                <RequireUser>
                  <Cart />
                </RequireUser>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireUser>
                  <Checkout />
                </RequireUser>
              }
            />
            <Route
              path="/myorders"
              element={
                <RequireUser>
                  <MyOrders />
                </RequireUser>
              }
            />
            <Route
              path="/account"
              element={
                <RequireUser>
                  <Account />
                </RequireUser>
              }
            />
            <Route
              path="/update-details"
              element={
                <RequireUser>
                  <UpdateDetails />
                </RequireUser>
              }
            />

            {/* Admin routes (prefix /admin) */}
            <Route
              path="/admin/home"
              element={
                <RequireAdmin>
                  <AdminHome />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RequireAdmin>
                  <AdminProducts />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/add-edit-product"
              element={
                <RequireAdmin>
                  <AddEditProduct />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/add-edit-product/:id"
              element={
                <RequireAdmin>
                  <AddEditProduct />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/account"
              element={
                <RequireAdmin>
                  <AdminAccount />
                </RequireAdmin>
              }
            />

            <Route 
              path="/admin/signup" 
              element={
                  <AdminSignup />
              } 
            />

            {/* Fallbacks */}
            <Route
              path="/404"
              element={
                <div style={{ padding: 40 }}>
                  <h2>Page not found</h2>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Chatbot - placed outside routes so it shows on every page */}
        <ChatbotWidget />
      </div>
    </BrowserRouter>
  );
}
