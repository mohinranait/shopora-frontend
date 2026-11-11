"use client";

import React from "react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { useGetSellerDashboardStatsQuery } from "@/redux";
import { Clock, ShieldAlert, ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellerNewProductPage() {
  const { data: dashboardData, isLoading } = useGetSellerDashboardStatsQuery();
  const profile = dashboardData?.profile;

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
        <Package className="h-8 w-8 animate-pulse text-brand mb-2" />
        <p className="text-xs">Checking vendor authorization...</p>
      </div>
    );
  }

  // If seller profile exists but is not yet approved
  if (profile && profile.status !== "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-8 rounded-2xl bg-card border border-amber-500/30 text-center space-y-4 shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <Clock className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Account Approval Required</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your vendor registration for <strong className="text-amber-600 dark:text-amber-300 font-semibold">{profile.storeName}</strong> is currently <span className="text-amber-600 dark:text-amber-400 font-bold uppercase">{profile.status}</span>. You will be able to upload and publish products once your account has been reviewed and approved by the Shopora administration team.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Link href="/seller/products">
              <Button size="sm" variant="outline" className="border-border text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to My Products
              </Button>
            </Link>
            <Link href="/seller/dashboard">
              <Button size="sm" variant="brand" className="text-xs font-bold shadow-xs">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <ProductForm backUrl="/seller/products" />
    </div>
  );
}
