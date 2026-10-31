"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IProductItem } from "@/types";
import { toast } from "sonner";

export default function SellerProductsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const { data, isLoading, isFetching, refetch } = useGetProductsQuery({ limit: 50 });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const allProducts = data?.products || [];

  const filteredProducts = allProducts.filter((p: IProductItem) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === "APPROVED") return p.approvalStatus === "APPROVED";
    if (filterStatus === "PENDING") return p.approvalStatus === "PENDING";
    if (filterStatus === "REJECTED") return p.approvalStatus === "REJECTED";
    if (filterStatus === "LOW_STOCK") return p.stock <= (p.lowStockThreshold || 5);

    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProduct(id).unwrap();
      toast.success(`Product "${name}" deleted.`);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="h-6 w-6 text-brand-500" />
            Product Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your store inventory, stock levels, dynamic variants, and listing approval status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-slate-800 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/seller/products/new">
            <Button size="sm" variant="brand" className="gap-1.5 text-xs font-bold h-9">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: "ALL", label: "All Items", count: allProducts.length },
            {
              id: "APPROVED",
              label: "Live / Approved",
              count: allProducts.filter((p) => p.approvalStatus === "APPROVED").length,
            },
            {
              id: "PENDING",
              label: "Under Review",
              count: allProducts.filter((p) => p.approvalStatus === "PENDING").length,
            },
            {
              id: "REJECTED",
              label: "Action Needed",
              count: allProducts.filter((p) => p.approvalStatus === "REJECTED").length,
            },
            {
              id: "LOW_STOCK",
              label: "Low Stock",
              count: allProducts.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
            Loading catalog products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">No products found matching criteria</p>
            <p className="text-slate-500 mt-1">Add your first product to start selling on Shopora.</p>
            <Link href="/seller/products/new" className="inline-block mt-4">
              <Button size="sm" variant="brand" className="text-xs">
                <Plus className="h-4 w-4 mr-1" /> Add Product Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Approval</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredProducts.map((p: IProductItem) => {
                  const isLow = p.stock <= (p.lowStockThreshold || 5);
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 relative flex items-center justify-center">
                            {p.mainImage ? (
                              <Image
                                src={p.mainImage}
                                alt={p.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h3 className="font-bold text-white truncate hover:text-brand-400">
                              {p.name}
                            </h3>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>SKU: {p.sku || "N/A"}</span>
                              {p.productType === "VARIABLE" && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-indigo-500/40 text-indigo-300">
                                  Variable ({p.variants?.length || 0})
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 font-bold text-white">
                        ৳{p.basePrice.toLocaleString()}
                        {p.comparePrice && p.comparePrice > p.basePrice && (
                          <span className="block text-[10px] text-slate-500 line-through font-normal">
                            ৳{p.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {isOut ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Out of stock
                            </Badge>
                          ) : isLow ? (
                            <Badge variant="outline" className="text-amber-400 border-amber-500/40 bg-amber-500/10 text-[10px] gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Low: {p.stock}
                            </Badge>
                          ) : (
                            <span className="font-semibold text-emerald-400">
                              {p.stock} in stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="px-5 py-3.5">
                        {p.approvalStatus === "APPROVED" ? (
                          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </Badge>
                        ) : p.approvalStatus === "PENDING" ? (
                          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] gap-1">
                            <Clock className="h-3 w-3" />
                            Under Review
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px] gap-1" title={p.rejectionReason || "Listing rejected"}>
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                      </td>

                      {/* Listing Status */}
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={p.status === "PUBLISHED" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/seller/products/${p.id}/edit`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-slate-700 text-slate-300 hover:text-white"
                              title="Edit product"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          {p.slug && p.approvalStatus === "APPROVED" && (
                            <Link href={`/products/${p.slug}`} target="_blank">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                                title="View on storefront"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(String(p.id), p.name)}
                            disabled={isDeleting}
                            className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
