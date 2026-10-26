"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

function AdminRouteGuardInner({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAuthorized = !isLoading && isAuthenticated && user?.role === "ADMIN";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      toast.error("Session expired or unauthorized. Please sign in as Administrator.");
      router.replace(`/admin-login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.role !== "ADMIN") {
      toast.error("Access Denied: Only Super Administrators can access the Command Center.");
      router.replace("/admin-login");
      return;
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 select-none">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-brand to-brand-deep flex items-center justify-center text-white shadow-xl shadow-brand/20">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-sky-400">
              <Lock className="h-2.5 w-2.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">
              Verifying Administrative Security
            </h3>
            <p className="text-xs text-slate-400">
              Checking cryptographic tokens and RBAC credentials...
            </p>
          </div>

          <Loader2 className="h-5 w-5 text-sky-400 animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
        </div>
      }
    >
      <AdminRouteGuardInner>{children}</AdminRouteGuardInner>
    </Suspense>
  );
}
