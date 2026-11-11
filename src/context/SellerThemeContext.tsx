"use client";

import React, { createContext, useContext, useSyncExternalStore, ReactNode } from "react";

export type SellerTheme = "dark" | "light";

interface SellerThemeContextType {
  theme: SellerTheme;
  toggleTheme: () => void;
  setTheme: (theme: SellerTheme) => void;
}

const SellerThemeContext = createContext<SellerThemeContextType | undefined>(undefined);

const listeners = new Set<() => void>();

function notifyThemeChange() {
  listeners.forEach((listener) => listener());
}

function subscribeSellerTheme(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSellerThemeSnapshot(): SellerTheme {
  try {
    const saved = localStorage.getItem("shopora_seller_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // Ignore restricted localStorage
  }
  return "dark";
}

function getSellerThemeServerSnapshot(): SellerTheme {
  return "dark";
}

export function SellerThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeSellerTheme,
    getSellerThemeSnapshot,
    getSellerThemeServerSnapshot
  );

  const setTheme = (newTheme: SellerTheme) => {
    try {
      localStorage.setItem("shopora_seller_theme", newTheme);
    } catch {
      // Ignore write errors
    }
    notifyThemeChange();
  };

  const toggleTheme = () => {
    const nextTheme: SellerTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <SellerThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </SellerThemeContext.Provider>
  );
}

export function useSellerTheme(): SellerThemeContextType {
  const context = useContext(SellerThemeContext);
  if (!context) {
    throw new Error("useSellerTheme must be used within a SellerThemeProvider");
  }
  return context;
}
