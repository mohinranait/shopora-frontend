"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  useGetSellerProductsQuery,
  useDeleteProductMutation,
  useGetSellerDashboardStatsQuery,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IProductItem } from "@/types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";

export default function SellerProductsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search query to avoid excess API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterStatusChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
  };

  const { data: dashboardData } = useGetSellerDashboardStatsQuery();
  const profile = dashboardData?.profile;

  // Build API query parameters for server-side filtering & pagination
  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit: pageSize,
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (filterStatus === "APPROVED") {
      params.approvalStatus = "APPROVED";
    } else if (filterStatus === "PENDING") {
      params.approvalStatus = "PENDING";
    } else if (filterStatus === "REJECTED") {
      params.approvalStatus = "REJECTED";
    } else if (filterStatus === "LOW_STOCK") {
      params.isLowStock = true;
    }

    return params;
  }, [page, pageSize, debouncedSearch, filterStatus]);

  const { data, isLoading, isFetching, refetch } = useGetSellerProductsQuery(queryParams);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = data?.products || [];
  const meta = data?.meta;
  const totalItems = meta?.total ?? products.length;
  const totalPages = meta?.totalPages ?? (totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1);
  const counts = meta?.counts;

  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id).unwrap();
      toast.success(`Product "${productToDelete.name}" deleted.`);
      setProductToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Package className="h-6 w-6 text-brand-500" />
            Product Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your store inventory, stock levels, dynamic variants, and listing approval status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-border text-xs h-9"
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

      {/* Account Pending Approval Notice */}
      {profile && profile.status === "PENDING" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
          <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-200">Seller Account Pending Approval</p>
            <p className="text-amber-300/80 leading-relaxed">
              Your vendor registration is currently under review by our administration team. You can manage your products here once approved.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 bg-card p-1 rounded-xl border border-border">
          {[
            { id: "ALL", label: "All Items", count: counts?.all ?? totalItems },
            {
              id: "APPROVED",
              label: "Live / Approved",
              count: counts?.approved ?? 0,
            },
            {
              id: "PENDING",
              label: "Under Review",
              count: counts?.pending ?? 0,
            },
            {
              id: "REJECTED",
              label: "Action Needed",
              count: counts?.rejected ?? 0,
            },
            {
              id: "LOW_STOCK",
              label: "Low Stock",
              count: counts?.lowStock ?? 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
 filterStatus === tab.id
 ? "bg-brand-600 text-foreground"
 : "text-muted-foreground hover:text-foreground hover:bg-muted"
 }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted border border-border text-foreground">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
            Loading catalog products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground text-xs">
            <Package className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No products found matching criteria</p>
            <p className="text-muted-foreground mt-1">Add your first product to start selling on Shopora.</p>
            <Link href="/seller/products/new" className="inline-block mt-4">
              <Button size="sm" variant="brand" className="text-xs">
                <Plus className="h-4 w-4 mr-1" /> Add Product Now
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Approval</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-foreground">
                {products.map((p: IProductItem) => {
                  const isLow = p.stock <= (p.lowStockThreshold || 5);
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg bg-muted border border-border overflow-hidden shrink-0 relative flex items-center justify-center">
                            {(typeof p.mainImage === "string" ? p.mainImage : p.mainImage?.media?.url) ? (
                              <Image
                                src={typeof p.mainImage === "string" ? p.mainImage : p.mainImage?.media?.url || ""}
                                alt={p.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground/60" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h3 className="font-bold text-foreground truncate hover:text-brand-400">
                              {p.name}
                            </h3>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
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
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        ৳{p.basePrice.toLocaleString()}
                        {p.comparePrice && p.comparePrice > p.basePrice && (
                          <span className="block text-[10px] text-muted-foreground line-through font-normal">
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
                              className="h-7 w-7 p-0 border-border text-foreground hover:text-foreground"
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
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="View on storefront"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setProductToDelete({ id: String(p.id), name: p.name })}
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

          {/* Table Pagination */}
          {totalItems > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50, 100]}
              isLoading={isFetching}
              itemLabel="products"
              variant="dark"
            />
          )}
        </>
      )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Product"
        description={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        variant="danger"
      />
    </div>
  );
}
