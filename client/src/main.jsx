import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/* Context Providers */
import { UserProvider } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";
import { CartProvider } from "./context/CartContext";
import { ChatbotProvider } from "./context/ChatbotContext";

/* Global CSS */
import "../style.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <AdminProvider>
        <CartProvider>
          <ChatbotProvider>
            <App />
          </ChatbotProvider>
        </CartProvider>
      </AdminProvider>
    </UserProvider>
  </React.StrictMode>
);
