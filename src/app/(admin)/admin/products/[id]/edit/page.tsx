"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { useGetProductByIdQuery } from "@/redux";
import { Loader2 } from "lucide-react";

function EditProductInner() {
  const params = useParams();
  const id = params?.id as string;

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
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
        <p className="text-xs text-muted-foreground">Loading product specifications...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-2xl space-y-2 shadow-xs">
        <p className="text-sm font-bold text-foreground">Product not found</p>
        <p className="text-xs text-muted-foreground">
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
          <Loader2 className="h-8 w-8 text-brand animate-spin" />
          <p className="text-xs text-muted-foreground">Loading editor...</p>
        </div>
      }
    >
      <EditProductInner />
    </Suspense>
  );
}
