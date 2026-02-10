import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState(() => {
    // Try to restore cart from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('electro_cart_temp');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  /* Load cart when user changes */
  useEffect(() => {
    if (!user) {
      return; // Don't clear cart when user becomes null
    }

    // Load user-specific cart
    const saved = localStorage.getItem(`electro_cart_${user._id}`);
    if (saved) {
      setCartItems(JSON.parse(saved));
    } else if (cartItems.length > 0) {
      // If no user cart exists but temp cart has items, save it for this user
      localStorage.setItem(`electro_cart_${user._id}`, JSON.stringify(cartItems));
      localStorage.removeItem('electro_cart_temp');
    }
  }, [user]);

  /* Save cart */
  const saveCart = (items) => {
    setCartItems(items);
    if (user) {
      localStorage.setItem(`electro_cart_${user._id}`, JSON.stringify(items));
      localStorage.setItem('electro_cart_temp', JSON.stringify(items));
    } else {
      localStorage.setItem('electro_cart_temp', JSON.stringify(items));
    }
  };

  /* Add to Cart */
  const addToCart = (item) => {
    let updated = [...cartItems];

    const existing = updated.find((i) => i._id === item._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      updated.push({ ...item, quantity: 1 });
    }

    saveCart(updated);
  };

  /* Remove */
  const removeFromCart = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    saveCart(updated);
  };

  /* Update Quantity */
  const updateQuantity = (id, qty) => {
    const updated = cartItems.map((item) =>
      item._id === id ? { ...item, quantity: qty } : item
    );
    saveCart(updated);
  };

  /* Clear cart on logout or after checkout */
  const clearCart = () => {
    setCartItems([]);
    if (user) {
      localStorage.removeItem(`electro_cart_${user._id}`);
    }
    localStorage.removeItem('electro_cart_temp');
  };

  /* Total Items */
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
