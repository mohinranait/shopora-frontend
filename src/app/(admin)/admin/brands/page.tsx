"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IBrand, ImageValue } from "@/types";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/media/ImageUploadField";

export default function AdminBrandsPage() {
  const { data: brands = [], isLoading: loading, isFetching, refetch } = useGetBrandsQuery(true);
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State for Add / Edit Brand
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLogo, setFormLogo] = useState<ImageValue | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingBrand(null);
    setFormName("");
    setFormWebsite("");
    setFormDescription("");
    setFormIsActive(true);
    setFormLogo(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (brand: IBrand) => {
    setModalMode("edit");
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormWebsite(brand.website || "");
    setFormDescription(brand.description || "");
    setFormIsActive(brand.isActive);

    if (brand.logo || brand.useMedia) {
      setFormLogo({
        url: brand.useMedia?.media?.url || brand.logo || "",
        useMediaId: brand.logoId ?? brand.useMediaId ?? undefined,
        alt: brand.useMedia?.alt || `${brand.name} Logo`,
        description: brand.useMedia?.description || "",
      });
    } else {
      setFormLogo(null);
    }

    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        name: formName.trim(),
        website: formWebsite.trim() || undefined,
        description: formDescription.trim() || undefined,
        isActive: formIsActive,
        logo: formLogo?.url || undefined,
        logoId: formLogo?.useMediaId ?? null,
        useMediaId: formLogo?.useMediaId ?? null,
      };

      if (modalMode === "create") {
        await createBrand(payload).unwrap();
        toast.success("Brand created successfully!");
      } else if (editingBrand) {
        await updateBrand({ id: editingBrand.id, body: payload }).unwrap();
        toast.success("Brand updated successfully!");
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Brand
  const handleDeleteBrand = async (brand: IBrand) => {
    if (!confirm(`Are you sure you want to delete brand "${brand.name}"?`)) return;

    try {
      await deleteBrand(brand.id).unwrap();
      toast.success(`Brand "${brand.name}" removed successfully.`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Filtered List
  const filteredBrands = brands.filter((b) => {
    if (statusFilter === "active" && !b.isActive) return false;
    if (statusFilter === "inactive" && b.isActive) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Brand Management
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Dynamic API & Media Library
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage manufacturer brands, official store logos, and SEO UseMedia metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={loading || isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-sky-400" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="brand"
            onClick={handleOpenCreate}
            className="gap-1.5 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Brand</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === "all"
                ? "bg-brand text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Brands ({brands.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === "active"
                ? "bg-brand text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === "inactive"
                ? "bg-brand text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Inactive
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand name, slug..."
            className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Brands Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Brand Logo & Details</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">UseMedia Reference</th>
                  <th className="py-3 px-4">Official Website</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 text-sky-400 animate-spin mx-auto mb-2" />
                      Loading brands from database...
                    </td>
                  </tr>
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No brands found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => {
                    const displayLogo = brand.useMedia?.media?.url || brand.logo;
                    return (
                      <tr key={brand.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 flex items-center justify-center p-1">
                              {displayLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={displayLogo}
                                  alt={brand.useMedia?.alt || brand.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Tag className="h-5 w-5 text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm">{brand.name}</p>
                              {brand.description && (
                                <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                  {brand.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                          /{brand.slug}
                        </td>

                        <td className="py-3 px-4">
                          {brand.logoId || brand.useMediaId ? (
                            <div className="space-y-0.5">
                              <Badge variant="brand" className="text-[10px] font-mono">
                                UseMedia #{brand.logoId || brand.useMediaId}
                              </Badge>
                              {brand.useMedia?.alt && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                  Alt: &quot;{brand.useMedia.alt}&quot;
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">None</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {brand.website ? (
                            <a
                              href={brand.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span>{brand.website.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {brand.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(brand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                              title="Edit Brand"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(brand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                              title="Delete Brand"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE / EDIT BRAND MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-sky-400" />
                {modalMode === "create" ? "Add New Brand" : `Edit Brand: ${editingBrand?.name}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Brand Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony, Anker, Apple"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* WordPress-Style Media Library Image Upload Field */}
              <div>
                <ImageUploadField
                  label="Brand Official Logo"
                  value={formLogo}
                  onChange={setFormLogo}
                  helperText="Select logo from WordPress-style Media Library or upload new image to Cloudinary."
                  modalTitle="Select Brand Logo Asset"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short overview about the brand and product portfolio..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg border border-slate-700 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                <div>
                  <p className="text-xs font-bold text-white">Active Status</p>
                  <p className="text-[11px] text-slate-400">
                    Visible in catalog filters and storefront navigation
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-brand"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={formSubmitting}
                  className="text-xs font-bold"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : modalMode === "create" ? (
                    "Create Brand"
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
