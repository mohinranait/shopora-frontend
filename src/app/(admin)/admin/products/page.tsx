"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import {
  useGetAdminProductsQuery,
  useReviewProductApprovalMutation,
  useDeleteProductMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IProductItem } from "@/types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type TabType = "all" | "platform" | "vendor" | "pending" | "low_stock";

function getInitialTab(filter: string | null): TabType {
  if (filter === "pending" || filter === "low_stock" || filter === "platform" || filter === "vendor") {
    return filter;
  }
  return "all";
}

function AdminProductsInner() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [prevFilterParam, setPrevFilterParam] = useState(filterParam);
  const [activeTab, setActiveTab] = useState<TabType>(() => getInitialTab(filterParam));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (filterParam !== prevFilterParam) {
    setPrevFilterParam(filterParam);
    setActiveTab(getInitialTab(filterParam));
    setPage(1);
  }

  // Debounce search query to avoid firing API requests on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Build API query parameters for server-side filtering & pagination
  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit: pageSize,
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (activeTab === "platform") {
      params.isPlatformOwned = true;
    } else if (activeTab === "vendor") {
      params.isPlatformOwned = false;
    } else if (activeTab === "pending") {
      params.approvalStatus = "PENDING";
    } else if (activeTab === "low_stock") {
      params.isLowStock = true;
    }

    return params;
  }, [page, pageSize, debouncedSearch, activeTab]);

  const { data, isLoading: loading, isFetching, refetch } = useGetAdminProductsQuery(queryParams);
  const [reviewProductApproval] = useReviewProductApprovalMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.products || [];
  const meta = data?.meta;
  const totalItems = meta?.total ?? products.length;
  const totalPages = meta?.totalPages ?? (totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1);
  const counts = meta?.counts;

  const allCount = counts?.all ?? totalItems;
  const platformCount = counts?.platform ?? 0;
  const vendorCount = counts?.vendor ?? 0;
  const pendingCount = counts?.pending ?? 0;
  const lowStockCount = counts?.lowStock ?? 0;

  // Rejection Dialog State
  const [rejectingProductId, setRejectingProductId] = useState<string | number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async (id: string | number) => {
    try {
      await reviewProductApproval({ id, status: "APPROVED" }).unwrap();
      toast.success("Product approved and published successfully.");
      refetch();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleOpenReject = (id: string | number) => {
    setRejectingProductId(id);
    setRejectionReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectingProductId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason for the seller.");
      return;
    }
    try {
      setIsRejecting(true);
      await reviewProductApproval({
        id: rejectingProductId,
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      }).unwrap();
      toast.info("Product marked as rejected.");
      setRejectingProductId(null);
      setRejectionReason("");
      refetch();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsRejecting(false);
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

  // TanStack Table Column Definitions (Reusable DataTable)
  const columns: ColumnDef<IProductItem>[] = useMemo(
    () => [
      {
        id: "productInfo",
        header: "Product Info",
        cell: ({ row }) => {
          const prod = row.original;
          const displayImage =
            typeof prod.mainImage === "string"
              ? prod.mainImage
              : prod.mainImage?.media?.url;

          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                {displayImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayImage}
                    alt={prod.name}
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 max-w-xs sm:max-w-md">
                <Link
                  href={`/admin/products/${prod.id}/edit`}
                  className="font-bold text-foreground truncate hover:text-brand transition block"
                >
                  {prod.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  {prod.productType === "VARIABLE" ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Variable ({prod.variants?.length || 0})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      <Package className="h-2.5 w-2.5" />
                      <span>Simple</span>
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground truncate">
                    {prod.category?.name || "General"}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "skuBrand",
        header: "SKU & Brand",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div>
              <p className="font-mono text-foreground font-semibold">
                {prod.sku || "N/A"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {prod.brand?.name || "Unbranded"}
              </p>
            </div>
          );
        },
      },
      {
        id: "originVendor",
        header: "Origin / Vendor",
        cell: ({ row }) => {
          const prod = row.original;
          return prod.isPlatformOwned ? (
            <Badge variant="brand" className="text-[10px]">
              Shopora Direct
            </Badge>
          ) : (
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Store className="h-3 w-3 text-purple-500 dark:text-purple-400" />
              <span>{prod.seller?.storeName || "Vendor"}</span>
            </div>
          );
        },
      },
      {
        id: "pricing",
        header: "Price / MSRP",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div>
              <p className="font-bold text-foreground">
                ৳ {prod.basePrice.toLocaleString()}
              </p>
              {prod.comparePrice && prod.comparePrice > prod.basePrice && (
                <p className="text-[10px] text-muted-foreground line-through">
                  ৳ {prod.comparePrice.toLocaleString()}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "stock",
        header: "Stock Status",
        cell: ({ row }) => {
          const prod = row.original;
          return prod.stock <= prod.lowStockThreshold ? (
            <span className="inline-flex items-center gap-1 font-bold text-rose-500 dark:text-rose-400">
              <AlertTriangle className="h-3 w-3" />
              {prod.stock} units
            </span>
          ) : (
            <span className="font-semibold text-foreground">
              {prod.stock} units
            </span>
          );
        },
      },
      {
        id: "moderation",
        header: "Moderation",
        cell: ({ row }) => {
          const prod = row.original;
          return prod.approvalStatus === "PENDING" ? (
            <Badge variant="warning" className="animate-pulse">
              Pending Review
            </Badge>
          ) : prod.approvalStatus === "APPROVED" ? (
            <Badge variant="success">Approved</Badge>
          ) : (
            <Badge variant="destructive">Rejected</Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        meta: { className: "text-right" },
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              {prod.approvalStatus === "PENDING" && (
                <>
                  <button
                    onClick={() => handleApprove(prod.id)}
                    className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition cursor-pointer"
                    title="Approve & Publish to Storefront"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenReject(prod.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Reject with Reason"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
              <Link
                href={`/admin/products/${prod.id}/edit`}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-muted transition cursor-pointer"
                title="Edit Product"
              >
                <Edit className="h-4 w-4" />
              </Link>
              {prod.slug && prod.approvalStatus === "APPROVED" && (
                <Link
                  href={`/products/${prod.slug}`}
                  target="_blank"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-muted transition cursor-pointer"
                  title="Preview on Storefront"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
              <button
                onClick={() => setProductToDelete(prod)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Delete Product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Package className="h-7 w-7 text-brand" />
            <span>Product Master Catalog</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review vendor listing submissions, oversee system-wide inventory, pricing, and variant matrixes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-brand" : "text-muted-foreground"}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/products/attributes">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Attributes</span>
            </Button>
          </Link>

          <Link href="/admin/products/new">
            <Button size="sm" variant="brand" className="text-xs gap-1.5 font-bold cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Pills */}
        <div className="flex flex-wrap items-center bg-card border border-border rounded-lg p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
 activeTab === "all"
 ? "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground hover:bg-muted"
 }`}
          >
            All Products ({allCount})
          </button>
          <button
            onClick={() => handleTabChange("platform")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
 activeTab === "platform"
 ? "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground hover:bg-muted"
 }`}
          >
            Shopora Direct ({platformCount})
          </button>
          <button
            onClick={() => handleTabChange("vendor")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
 activeTab === "vendor"
 ? "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground hover:bg-muted"
 }`}
          >
            Vendor Products ({vendorCount})
          </button>
          <button
            onClick={() => handleTabChange("pending")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
 activeTab === "pending"
 ? "bg-amber-500 text-slate-950 font-bold "
 : "text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10"
 }`}
          >
            <span>Pending Review</span>
            <span
              className={`h-4 px-1.5 rounded-full text-[10px] font-bold ${
 activeTab === "pending"
 ? "bg-slate-950/20 text-slate-950"
 : "bg-amber-500/15 text-amber-500 dark:text-amber-400"
 }`}
            >
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => handleTabChange("low_stock")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
 activeTab === "low_stock"
 ? "bg-rose-600 text-white "
 : "text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
 }`}
          >
            <span>Low Stock</span>
            <span
              className={`h-4 px-1.5 rounded-full text-[10px] font-bold ${
 activeTab === "low_stock"
 ? "bg-white/20 text-white"
 : "bg-rose-500/15 text-rose-500 dark:text-rose-400"
 }`}
            >
              {lowStockCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand transition"
          />
        </div>
      </div>

      {/* Products Table (Reusable TanStack DataTable) */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={loading || isFetching}
        loadingMessage="Loading product catalog..."
        emptyMessage={
          activeTab === "pending"
            ? "There are currently no seller products pending moderation."
            : "No products found matching your criteria."
        }
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPage(1);
          },
          pageSizeOptions: [10, 20, 50, 100],
          itemLabel: "products",
        }}
      />

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

      {/* shadcn Rejection Dialog Modal */}
      <Dialog
        open={Boolean(rejectingProductId)}
        onOpenChange={(open) => !open && setRejectingProductId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              <span>Reject Submitted Product</span>
            </DialogTitle>
            <DialogDescription>
              Please provide clear feedback explaining why this product is rejected so the seller can revise and resubmit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="rejection-reason" className="text-xs">
              Rejection Reason & Compliance Notes <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g. Incomplete specifications, low image resolution, or trademark violation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectingProductId(null)}
              disabled={isRejecting}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={isRejecting}
              className="text-xs font-bold cursor-pointer"
            >
              {isRejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-2" />
          Loading products...
        </div>
      }
    >
      <AdminProductsInner />
    </Suspense>
  );
}
