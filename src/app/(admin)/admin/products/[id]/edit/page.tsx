"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { productApi, getApiErrorMessage } from "@/services/api";
import { IProductItem } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function EditProductInner() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<IProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productApi.getById(Number(id));
        setProduct(data);
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
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
