"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SellerRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("shopora_token");
      const userStr = localStorage.getItem("shopora_user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token) {
        router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const role = user?.role;
      if (role === "SELLER" || role === "ADMIN") {
        setIsAuthorized(true);
      } else {
        router.replace("/seller/register");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-3" />
        <p className="text-sm text-slate-400 font-medium">Verifying seller access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
