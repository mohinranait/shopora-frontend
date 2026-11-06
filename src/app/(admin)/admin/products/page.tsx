"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Store,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ExternalLink,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetAdminProductsQuery,
  useReviewProductApprovalMutation,
  useDeleteProductMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IProductItem } from "@/types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function AdminProductsInner() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");

  const { data, isLoading: loading, isFetching, refetch } = useGetAdminProductsQuery({ limit: 100 });
  const [reviewProductApproval] = useReviewProductApprovalMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.products || [];
  const [activeTab, setActiveTab] = useState<
    "all" | "platform" | "vendor" | "pending" | "low_stock"
  >(filterParam === "pending" ? "pending" : "all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (filterParam === "pending") {
      setActiveTab("pending");
    }
  }, [filterParam]);

  const handleApprove = async (id: string | number) => {
    try {
      await reviewProductApproval({ id, status: "APPROVED" }).unwrap();
      toast.success("Product approved and published successfully.");
      refetch();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleReject = async (id: string | number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await reviewProductApproval({ id, status: "REJECTED", rejectionReason: reason }).unwrap();
      toast.info("Product marked as rejected.");
      refetch();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const [productToDelete, setProductToDelete] = useState<IProductItem | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsDeletingProduct(true);
      await deleteProduct(productToDelete.id).unwrap();
      toast.success(`Product "${productToDelete.name}" deleted successfully.`);
      setProductToDelete(null);
      refetch();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const filteredProducts = products.filter((prod) => {
    if (activeTab === "platform" && !prod.isPlatformOwned) return false;
    if (activeTab === "vendor" && prod.isPlatformOwned) return false;
    if (activeTab === "pending" && prod.approvalStatus !== "PENDING") return false;
    if (activeTab === "low_stock" && prod.stock > prod.lowStockThreshold) return false;
    if (
      search &&
      !prod.name.toLowerCase().includes(search.toLowerCase()) &&
      !prod.sku.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const platformCount = products.filter((p) => p.isPlatformOwned).length;
  const vendorCount = products.filter((p) => !p.isPlatformOwned).length;
  const pendingCount = products.filter((p) => p.approvalStatus === "PENDING").length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="h-7 w-7 text-brand" />
            <span>Product Master Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review vendor listing submissions, oversee system-wide inventory, pricing, and variant matrixes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/products/attributes">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Attributes</span>
            </Button>
          </Link>

          <Link href="/admin/products/new">
            <Button size="sm" variant="brand" className="text-xs gap-1.5 font-bold">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Pills */}
        <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === "all"
                ? "bg-brand text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("platform")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === "platform"
                ? "bg-brand text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Shopora Direct ({platformCount})
          </button>
          <button
            onClick={() => setActiveTab("vendor")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === "vendor"
                ? "bg-brand text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vendor Products ({vendorCount})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <span>Pending Review</span>
            <span
              className={`h-4 px-1.5 rounded-full text-[10px] font-bold ${
                activeTab === "pending"
                  ? "bg-slate-950/20 text-slate-950"
                  : "bg-amber-400/20 text-amber-400"
              }`}
            >
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("low_stock")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "low_stock"
                ? "bg-rose-600 text-white"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <span>Low Stock</span>
            <span className="h-4 px-1.5 rounded-full bg-rose-500/20 text-[10px] font-bold">
              {lowStockCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Products Table Card */}
      <Card className="border-slate-800 bg-slate-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/50 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Info</th>
                  <th className="py-3 px-4">SKU &amp; Brand</th>
                  <th className="py-3 px-4">Origin / Vendor</th>
                  <th className="py-3 px-4">Price / MSRP</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Moderation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-2" />
                      Loading product catalog...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Package className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-300">No products found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeTab === "pending"
                          ? "There are currently no seller products pending moderation."
                          : "Try adjusting your search criteria or tab filters."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      className={`hover:bg-slate-850/50 transition-colors ${
                        prod.approvalStatus === "PENDING" ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {((prod.mainImage as any)?.media?.url || (typeof prod.mainImage === "string" ? prod.mainImage : null)) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={((prod.mainImage as any)?.media?.url || (typeof prod.mainImage === "string" ? prod.mainImage : "")) as string}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <p className="font-bold text-white truncate hover:text-brand transition cursor-pointer">
                              {prod.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {prod.productType === "VARIABLE" ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  <span>Variable ({prod.variants?.length || 0})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  <Package className="h-2.5 w-2.5" />
                                  <span>Simple</span>
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">
                                {prod.category?.name || "General"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-mono text-slate-300 font-semibold">
                          {prod.sku || "N/A"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {prod.brand?.name || "Unbranded"}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        {prod.isPlatformOwned ? (
                          <Badge variant="brand" className="text-[10px]">
                            Shopora Direct
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1 font-semibold text-slate-200">
                            <Store className="h-3 w-3 text-purple-400" />
                            <span>{prod.seller?.storeName || "Vendor"}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-white">
                          ৳ {prod.basePrice.toLocaleString()}
                        </p>
                        {prod.comparePrice && prod.comparePrice > prod.basePrice && (
                          <p className="text-[10px] text-slate-400 line-through">
                            ৳ {prod.comparePrice.toLocaleString()}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {prod.stock <= prod.lowStockThreshold ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                            <AlertTriangle className="h-3 w-3" />
                            {prod.stock} units
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-200">
                            {prod.stock} units
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {prod.approvalStatus === "PENDING" ? (
                          <Badge variant="warning" className="animate-pulse">
                            Pending Review
                          </Badge>
                        ) : prod.approvalStatus === "APPROVED" ? (
                          <Badge variant="success">Approved</Badge>
                        ) : (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {prod.approvalStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(prod.id)}
                                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer"
                                title="Approve & Publish to Storefront"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(prod.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                                title="Reject with Reason"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/products/${prod.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {prod.slug && prod.approvalStatus === "APPROVED" && (
                            <Link
                              href={`/products/${prod.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Preview on Storefront"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        isLoading={isDeletingProduct}
        title="Delete Product"
        description={`Are you sure you want to permanently delete "${productToDelete?.name}"? All associated inventory and variant combinations will be permanently removed.`}
        confirmText="Delete Product"
        variant="danger"
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-2" />
          Loading products...
        </div>
      }
    >
      <AdminProductsInner />
    </Suspense>
  );
}
