"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/services/api";
import {
  IAuthUser,
  ILoginResponse,
  UserRole,
  IRegisterCustomerPayload,
  IRegisterSellerPayload,
} from "@/types";

interface AuthContextType {
  user: IAuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<ILoginResponse>;
  registerCustomer: (payload: IRegisterCustomerPayload) => Promise<ILoginResponse>;
  registerSeller: (payload: IRegisterSellerPayload) => Promise<ILoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on client load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("shopora_token");
      const savedUser = localStorage.getItem("shopora_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (data: ILoginResponse) => {
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem("shopora_token", data.accessToken);
    localStorage.setItem("shopora_user", JSON.stringify(data.user));
    // Also set cookie for simple client-side tracking if needed
    document.cookie = `shopora_role=${data.user.role}; path=/; max-age=604800`;
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    handleAuthSuccess(data);
    return data;
  };

  const registerCustomer = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const data = await authApi.registerCustomer(payload);
    handleAuthSuccess(data);
    return data;
  };

  const registerSeller = async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    storeName: string;
    businessAddress: string;
    storeDescription?: string;
    taxNumber?: string;
    nidOrTradeLicense?: string;
    bkashOrNagad?: string;
  }) => {
    const data = await authApi.registerSeller(payload);
    handleAuthSuccess(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("shopora_token");
    localStorage.removeItem("shopora_user");
    document.cookie = "shopora_role=; path=/; max-age=0";
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerCustomer,
        registerSeller,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
