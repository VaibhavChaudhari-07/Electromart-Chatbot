import React, { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("electro_admin");
    if (saved) setAdmin(JSON.parse(saved));
  }, []);

  const saveAdmin = (a) => {
    setAdmin(a);
    localStorage.setItem("electro_admin", JSON.stringify(a));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("electro_admin");
  };

  return (
    <AdminContext.Provider value={{ admin, setAdmin: saveAdmin, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
