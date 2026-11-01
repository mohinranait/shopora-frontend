"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { useGetProductByIdQuery, useGetSellerDashboardStatsQuery } from "@/redux";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

function SellerEditProductInner() {
  const params = useParams();
  const id = params?.id as string;

  const { data: dashboardData } = useGetSellerDashboardStatsQuery();
  const profile = dashboardData?.profile;

  const {
    data: product,
    isLoading: loading,
    isError,
  } = useGetProductByIdQuery(id, {
    skip: !id,
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading product specifications...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3 max-w-lg mx-auto my-12">
        <p className="text-sm font-bold text-white">Product not found</p>
        <p className="text-xs text-slate-400">
          The requested product ID does not exist, belongs to another merchant, or has been removed.
        </p>
        <Link href="/seller/products">
          <Button size="sm" variant="outline" className="border-slate-800 text-xs mt-2">
            Back to My Products
          </Button>
        </Link>
      </div>
    );
  }

  // Security guard: Ensure product belongs to this seller
  if (profile && product.sellerId && product.sellerId !== profile.id) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-rose-500/30 rounded-2xl space-y-3 max-w-lg mx-auto my-12">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Access Denied</h3>
        <p className="text-xs text-slate-400">
          You do not have permission to view or edit this product. You can only manage listings that belong to your own store.
        </p>
        <Link href="/seller/products" className="inline-block pt-2">
          <Button size="sm" variant="outline" className="border-slate-800 text-xs">
            Back to My Products
          </Button>
        </Link>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} backUrl="/seller/products" />;
}

export default function SellerEditProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading editor...</p>
        </div>
      }
    >
      <SellerEditProductInner />
    </Suspense>
  );
}
