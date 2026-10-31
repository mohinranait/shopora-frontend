"use client";

import React from "react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function SellerNewProductPage() {
  return (
    <div className="py-2">
      <ProductForm backUrl="/seller/products" />
    </div>
  );
}
