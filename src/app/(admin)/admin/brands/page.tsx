"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import {
  useGetBrandsQuery,
  useDeleteBrandMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IBrand } from "@/types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { BrandForm } from "@/components/admin/BrandForm";

export default function AdminBrandsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusFilterChange = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    setPage(1);
  };

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit: pageSize,
      includeInactive: true,
    };
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    return params;
  }, [page, pageSize, debouncedSearch, statusFilter]);

  const { data, isLoading: loading, isFetching, refetch } = useGetBrandsQuery(queryParams);
  const brands = data?.brands || [];
  const meta = data?.meta;
  const totalItems = meta?.total ?? brands.length;
  const totalPages = meta?.totalPages ?? (totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1);
  const counts = meta?.counts;

  const [deleteBrand] = useDeleteBrandMutation();

  // Modal State for Add / Edit Brand
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (brand: IBrand) => {
    setModalMode("edit");
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  // Delete Confirmation State
  const [brandToDelete, setBrandToDelete] = useState<IBrand | null>(null);
  const [isDeletingBrand, setIsDeletingBrand] = useState(false);

  const confirmDeleteBrand = async () => {
    if (!brandToDelete) return;
    try {
      setIsDeletingBrand(true);
      await deleteBrand(brandToDelete.id).unwrap();
      toast.success(`Brand "${brandToDelete.name}" removed successfully.`);
      setBrandToDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeletingBrand(false);
    }
  };

  // TanStack Table Column Definitions
  const columns: ColumnDef<IBrand>[] = useMemo(
    () => [
      {
        id: "details",
        header: "Brand Logo & Details",
        cell: ({ row }) => {
          const brand = row.original;
          const displayLogo = brand.logo?.media?.url;
          return (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg overflow-hidden border border-border bg-muted/40 shrink-0 flex items-center justify-center p-1">
                {displayLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayLogo}
                    alt={brand.logo?.alt || brand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Tag className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm">{brand.name}</p>
                {brand.description && (
                  <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                    {brand.description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => {
          const brand = row.original;
          return (
            <div className="font-mono text-muted-foreground text-xs">
              <span>Slug: {brand.slug}</span>
              {brand.logo?.alt && (
                <p className="text-[10px] text-muted-foreground/80 truncate max-w-45">
                  Alt: &quot;{brand.logo.alt}&quot;
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "website",
        header: "Official Website",
        cell: ({ row }) => {
          const brand = row.original;
          return brand.website ? (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>{brand.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ) : (
            <span className="text-muted-foreground/60 text-[11px]">—</span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          return row.original.isActive ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        meta: { className: "text-right" },
        cell: ({ row }) => {
          const brand = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(brand)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-muted transition cursor-pointer"
                title="Edit Brand"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => setBrandToDelete(brand)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Delete Brand"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Brand Management
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Dynamic API & Media Library
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage manufacturer brands, official store logos, and SEO UseMedia metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={loading || isFetching}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-brand" : "text-muted-foreground"}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="brand"
            onClick={handleOpenCreate}
            className="gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Brand</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-card border border-border rounded-lg p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => handleStatusFilterChange("all")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
 statusFilter === "all"
 ? "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground hover:bg-muted"
 }`}
          >
            All Brands ({counts?.all !== undefined ? counts.all : totalItems})
          </button>
          <button
            onClick={() => handleStatusFilterChange("active")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
 statusFilter === "active"
 ? "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground hover:bg-muted"
 }`}
          >
            Active {counts?.active !== undefined ? `(${counts.active})` : ""}
          </button>
          <button
            onClick={() => handleStatusFilterChange("inactive")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
 statusFilter === "inactive"
 ? "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground hover:bg-muted"
 }`}
          >
            Inactive {counts?.inactive !== undefined ? `(${counts.inactive})` : ""}
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand name, slug..."
            className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand transition"
          />
        </div>
      </div>

      {/* Brands Table (Reusable TanStack DataTable) */}
      <DataTable
        columns={columns}
        data={brands}
        isLoading={loading || isFetching}
        loadingMessage="Loading brands from database..."
        emptyMessage="No brands found matching your criteria."
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
          itemLabel: "brands",
        }}
      />

      {/* Reusable Global Modal with BrandForm as children */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "create" ? "Add New Brand" : `Edit Brand: ${editingBrand?.name}`}
        icon={<Tag className="h-4 w-4 text-sky-400" />}
        description={
          modalMode === "create"
            ? "Create a new manufacturer brand with official logo and metadata."
            : `Update details for "${editingBrand?.name}".`
        }
      >
        <BrandForm
          key={editingBrand?.id ?? "create"}
          mode={modalMode}
          brand={editingBrand}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(brandToDelete)}
        onClose={() => setBrandToDelete(null)}
        onConfirm={confirmDeleteBrand}
        isLoading={isDeletingBrand}
        title="Delete Brand"
        description={`Are you sure you want to permanently delete "${brandToDelete?.name}"? Products currently assigned to this brand will lose their brand association.`}
        confirmText="Delete Brand"
        variant="danger"
      />
    </div>
  );
}
