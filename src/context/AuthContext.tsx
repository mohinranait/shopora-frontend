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
  updateUser: (updatedFields: Partial<IAuthUser>) => void;
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
        const parsedUser = savedUser ? (JSON.parse(savedUser) as IAuthUser) : null;
        currentSnapshot = {
          token: savedToken || null,
          user: parsedUser,
        };

        // Ensure cookies are synced for Next.js middleware protection
        if (savedToken && !document.cookie.includes("shopora_token=")) {
          document.cookie = `shopora_token=${savedToken}; path=/; max-age=604800; SameSite=Lax`;
        }
        if (parsedUser?.role && !document.cookie.includes("shopora_role=")) {
          document.cookie = `shopora_role=${parsedUser.role}; path=/; max-age=604800; SameSite=Lax`;
        }

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
    if (data.refreshToken) {
      localStorage.setItem("shopora_refresh_token", data.refreshToken);
    }
    localStorage.setItem("shopora_user", JSON.stringify(data.user));
    document.cookie = `shopora_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `shopora_role=${data.user.role}; path=/; max-age=604800; SameSite=Lax`;
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

  const updateUser = (updatedFields: Partial<IAuthUser>) => {
    if (!currentSnapshot.user) return;
    const updated = { ...currentSnapshot.user, ...updatedFields };
    currentSnapshot = {
      ...currentSnapshot,
      user: updated,
    };
    localStorage.setItem("shopora_user", JSON.stringify(updated));
    if (updated.role) {
      document.cookie = `shopora_role=${updated.role}; path=/; max-age=604800; SameSite=Lax`;
    }
    notifyAuthChange();
  };

  const logout = () => {
    currentSnapshot = { user: null, token: null };
    localStorage.removeItem("shopora_token");
    localStorage.removeItem("shopora_refresh_token");
    localStorage.removeItem("shopora_user");
    document.cookie = "shopora_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "shopora_role=; path=/; max-age=0; SameSite=Lax";
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
        updateUser,
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
