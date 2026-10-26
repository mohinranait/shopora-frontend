"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  useGetProductsQuery,
  useReviewProductApprovalMutation,
  useDeleteProductMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IProductItem } from "@/types";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const { data, isLoading: loading, isFetching, refetch } = useGetProductsQuery({ limit: 50 });
  const [reviewProductApproval] = useReviewProductApprovalMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.products || [];
  const [activeTab, setActiveTab] = useState<
    "all" | "platform" | "vendor" | "pending" | "low_stock"
  >("all");
  const [search, setSearch] = useState("");

  const handleApprove = async (id: number) => {
    try {
      await reviewProductApproval({ id, status: "APPROVED" }).unwrap();
      toast.success("Product approved and published successfully.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await reviewProductApproval({ id, status: "REJECTED", rejectionReason: reason }).unwrap();
      toast.info("Product marked as rejected.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (prod: IProductItem) => {
    if (!confirm(`Are you sure you want to delete product "${prod.name}"?`)) return;
    try {
      await deleteProduct(prod.id).unwrap();
      toast.success(`Product "${prod.name}" deleted successfully.`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Products & Catalog Management
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Dynamic Database Live
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your retail inventory, multi-vendor submissions, attributes, and stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-sky-400" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/attributes">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Attributes</span>
            </Button>
          </Link>

          <Link href="/admin/products/new">
            <Button size="sm" variant="brand" className="text-xs gap-1.5 shadow-md shadow-brand/20 font-bold">
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
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "all"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("platform")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "platform"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Shopora Direct ({platformCount})
          </button>
          <button
            onClick={() => setActiveTab("vendor")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "vendor"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vendor Products ({vendorCount})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <span>Pending Review</span>
            <span className="h-4 px-1.5 rounded-full bg-amber-400/20 text-[10px] font-bold">
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("low_stock")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === "low_stock"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <span>Low Stock</span>
            <span className="h-4 px-1.5 rounded-full bg-rose-500/20 text-[10px] font-bold">
              {lowStockCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Products Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">SKU / Brand</th>
                  <th className="py-3 px-4">Source / Seller</th>
                  <th className="py-3 px-4">Price (BDT)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 text-sky-400 animate-spin mx-auto mb-2" />
                      Loading catalog from database...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No products found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="h-11 w-11 rounded-lg object-cover border border-slate-700 bg-slate-900 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-xs sm:max-w-sm">
                              {prod.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
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
                              {prod.mainImageUseMediaId && (
                                <Badge variant="brand" className="text-[9px] font-mono py-0 px-1">
                                  Media #{prod.mainImageUseMediaId}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-mono text-slate-300 font-semibold">
                          {prod.sku}
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
                        <p className="font-bold text-white font-mono text-sm">
                          {prod.productType === "VARIABLE" && prod.variants && prod.variants.length > 0 ? (
                            <>৳ {Math.min(...prod.variants.map((v) => v.price)).toLocaleString()}</>
                          ) : (
                            <>৳ {prod.basePrice.toLocaleString()}</>
                          )}
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
                          <Badge variant="warning">Pending Review</Badge>
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
                                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition"
                                title="Approve Product"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(prod.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                                title="Reject Product"
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
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
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
    </div>
  );
}
