"use client";

import React, { createContext, useContext, useSyncExternalStore, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  useLoginMutation,
  useRegisterCustomerMutation,
  useRegisterSellerMutation,
  useAppDispatch,
  baseApi,
} from "@/redux";
import {
  IAuthUser,
  ILoginResponse,
  UserRole,
  IRegisterCustomerPayload,
  IRegisterSellerPayload,
} from "@/types";

interface AuthSnapshot {
  user: IAuthUser | null;
  token: string | null;
}

const SERVER_SNAPSHOT: AuthSnapshot = { user: null, token: null };
let currentSnapshot: AuthSnapshot = { user: null, token: null };

const listeners = new Set<() => void>();

function notifyAuthChange() {
  listeners.forEach((listener) => listener());
}

function getClientAuthSnapshot(): AuthSnapshot {
  return currentSnapshot;
}

function subscribeAuth(callback: () => void): () => void {
  listeners.add(callback);
  const handleStorage = () => {
    try {
      const savedToken = localStorage.getItem("shopora_token");
      const savedUser = localStorage.getItem("shopora_user");
      currentSnapshot = {
        token: savedToken || null,
        user: savedUser ? (JSON.parse(savedUser) as IAuthUser) : null,
      };
    } catch {
      currentSnapshot = { user: null, token: null };
    }
    notifyAuthChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

const emptySubscribe = () => () => {};

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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginMutation] = useLoginMutation();
  const [registerCustomerMutation] = useRegisterCustomerMutation();
  const [registerSellerMutation] = useRegisterSellerMutation();

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const auth = useSyncExternalStore(
    subscribeAuth,
    getClientAuthSnapshot,
    () => SERVER_SNAPSHOT
  );

  // Sync with client-side localStorage after hydration so server & client initial render match 100%
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("shopora_token");
      const savedUser = localStorage.getItem("shopora_user");
      if (savedToken || savedUser) {
        currentSnapshot = {
          token: savedToken || null,
          user: savedUser ? (JSON.parse(savedUser) as IAuthUser) : null,
        };
        notifyAuthChange();
      }
    } catch {
      currentSnapshot = { user: null, token: null };
      notifyAuthChange();
    }
  }, []);

  const user = auth.user;
  const token = auth.token;
  const isLoading = !isMounted;

  const handleAuthSuccess = (data: ILoginResponse) => {
    currentSnapshot = {
      user: data.user,
      token: data.accessToken,
    };
    localStorage.setItem("shopora_token", data.accessToken);
    localStorage.setItem("shopora_user", JSON.stringify(data.user));
    document.cookie = `shopora_role=${data.user.role}; path=/; max-age=604800`;
    notifyAuthChange();
  };

  const login = async (email: string, password: string) => {
    const data = await loginMutation({ email, password }).unwrap();
    handleAuthSuccess(data);
    return data;
  };

  const registerCustomer = async (payload: IRegisterCustomerPayload) => {
    const data = await registerCustomerMutation(payload).unwrap();
    handleAuthSuccess(data);
    return data;
  };

  const registerSeller = async (payload: IRegisterSellerPayload) => {
    const data = await registerSellerMutation(payload).unwrap();
    handleAuthSuccess(data);
    return data;
  };

  const logout = () => {
    currentSnapshot = { user: null, token: null };
    localStorage.removeItem("shopora_token");
    localStorage.removeItem("shopora_user");
    document.cookie = "shopora_role=; path=/; max-age=0";
    notifyAuthChange();
    dispatch(baseApi.util.resetApiState());
    router.push("/");
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
