"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { useGetProductByIdQuery } from "@/redux";
import { Loader2 } from "lucide-react";

function EditProductInner() {
  const params = useParams();
  const id = params?.id as string;
  const numId = Number(id);

  const {
    data: product,
    isLoading: loading,
    isError,
  } = useGetProductByIdQuery(numId, {
    skip: !numId || isNaN(numId),
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading product specifications...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
        <p className="text-sm font-bold text-white">Product not found</p>
        <p className="text-xs text-slate-400">
          The requested product ID does not exist or has been removed.
        </p>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}

export default function AdminEditProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading editor...</p>
        </div>
      }
    >
      <EditProductInner />
    </Suspense>
  );
}
