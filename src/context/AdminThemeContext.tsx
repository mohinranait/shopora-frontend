"use client";

import React, { createContext, useContext, useSyncExternalStore, ReactNode } from "react";

export type AdminTheme = "dark" | "light";

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const listeners = new Set<() => void>();

function notifyThemeChange() {
  listeners.forEach((listener) => listener());
}

function subscribeAdminTheme(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getAdminThemeSnapshot(): AdminTheme {
  try {
    const saved = localStorage.getItem("shopora_admin_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // Ignore restricted localStorage
  }
  return "dark";
}

function getAdminThemeServerSnapshot(): AdminTheme {
  return "dark";
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeAdminTheme,
    getAdminThemeSnapshot,
    getAdminThemeServerSnapshot
  );

  const setTheme = (newTheme: AdminTheme) => {
    try {
      localStorage.setItem("shopora_admin_theme", newTheme);
    } catch {
      // Ignore write errors
    }
    notifyThemeChange();
  };

  const toggleTheme = () => {
    const nextTheme: AdminTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme(): AdminThemeContextType {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
