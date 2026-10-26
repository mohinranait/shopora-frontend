"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  FolderTree,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { ICategory, ImageValue } from "@/types";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/media/ImageUploadField";

export default function AdminCategoriesPage() {
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isFetching: isCategoriesFetching,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  const {
    data: treeCategories = [],
    isLoading: isTreeLoading,
    isFetching: isTreeFetching,
    refetch: refetchTree,
  } = useGetCategoryTreeQuery();

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const loading = isCategoriesLoading || isTreeLoading;
  const isFetching = isCategoriesFetching || isTreeFetching;

  const handleRefresh = () => {
    refetchCategories();
    refetchTree();
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState<number | null>(null);
  const [formDescription, setFormDescription] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImage, setFormImage] = useState<ImageValue | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Open Create Modal
  const handleOpenCreate = (parentId?: number) => {
    setModalMode("create");
    setEditingCategory(null);
    setFormName("");
    setFormParentId(parentId !== undefined ? parentId : null);
    setFormDescription("");
    setFormDisplayOrder(categories.length + 1);
    setFormIsActive(true);
    setFormImage(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: ICategory) => {
    setModalMode("edit");
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormParentId(cat.parentId || null);
    setFormDescription(cat.description || "");
    setFormDisplayOrder(cat.displayOrder || 0);
    setFormIsActive(cat.isActive);

    if (cat.image || cat.useMedia) {
      setFormImage({
        url: cat.useMedia?.media?.url || cat.image || "",
        useMediaId: cat.useMediaId,
        alt: cat.useMedia?.alt || `${cat.name} Category`,
        description: cat.useMedia?.description || "",
      });
    } else {
      setFormImage(null);
    }

    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        parentId: formParentId || null,
        displayOrder: Number(formDisplayOrder) || 0,
        isActive: formIsActive,
        image: formImage?.url || undefined,
        useMediaId: formImage?.useMediaId ?? null,
      };

      if (modalMode === "create") {
        await createCategory(payload).unwrap();
        toast.success("Category created successfully!");
      } else if (editingCategory) {
        await updateCategory({ id: editingCategory.id, body: payload }).unwrap();
        toast.success("Category updated successfully!");
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (cat: ICategory) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      await deleteCategory(cat.id).unwrap();
      toast.success(`Category "${cat.name}" removed successfully.`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Categories & Taxonomy Hierarchy
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Dynamic API & Media Library
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize multi-level catalog categories, slug structures, and navigational menu ribbons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-sky-400" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="brand"
            onClick={() => handleOpenCreate()}
            className="gap-1.5 text-xs font-bold shadow-md shadow-brand/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Categories Tree Grid */}
      {loading ? (
        <Card className="p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 text-sky-400 animate-spin mx-auto mb-2" />
          Loading category taxonomy from database...
        </Card>
      ) : treeCategories.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          No categories found. Click &quot;Add Category&quot; to create your first root category.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {treeCategories.map((cat) => {
            const displayImage = cat.useMedia?.media?.url || cat.image;
            return (
              <Card key={cat.id} className="overflow-hidden">
                <div className="p-4 sm:p-5 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center p-1">
                      {displayImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={displayImage}
                          alt={cat.useMedia?.alt || cat.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FolderTree className="h-6 w-6 text-sky-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <span>{cat.name}</span>
                        {cat.useMediaId && (
                          <Badge variant="brand" className="text-[10px] font-mono py-0">
                            UseMedia #{cat.useMediaId}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        /{cat.slug} {cat.description && `• ${cat.description}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpenEdit(cat)}
                      className="text-xs"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="brand"
                      onClick={() => handleOpenCreate(cat.id)}
                      className="text-xs bg-sky-600 hover:bg-sky-500 text-white"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Subcategory
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-xs p-1.5"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories */}
                {cat.children && cat.children.length > 0 && (
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Subcategories ({cat.children.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {cat.children.map((sub) => {
                        const subImage = sub.useMedia?.media?.url || sub.image;
                        return (
                          <div
                            key={sub.id}
                            className="p-3 rounded-lg border border-slate-800/80 bg-slate-950 flex items-center justify-between hover:border-slate-700 transition group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {subImage && (
                                <div className="h-8 w-8 rounded overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={subImage}
                                    alt={sub.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition truncate">
                                  {sub.name}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                  /{sub.slug}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="p-1 rounded text-slate-400 hover:text-sky-400 transition"
                                title="Edit subcategory"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(sub)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                                title="Delete subcategory"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                {modalMode === "create" ? "Add New Category" : `Edit Category: ${editingCategory?.name}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smartwatches, Men's Clothing"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Parent Category
                </label>
                <select
                  value={formParentId || ""}
                  onChange={(e) => setFormParentId(e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">None (Top-Level Root Category)</option>
                  {categories
                    .filter((c) => editingCategory ? c.id !== editingCategory.id : true)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.parentId ? "(Subcategory)" : "(Root)"}
                      </option>
                    ))}
                </select>
              </div>

              {/* WordPress-Style Media Library Image Upload Field */}
              <div>
                <ImageUploadField
                  label="Category Cover Image"
                  value={formImage}
                  onChange={setFormImage}
                  helperText="Select cover image from WordPress-style Media Library or upload new image to Cloudinary."
                  modalTitle="Select Category Cover Asset"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary for SEO and navigation cards..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg border border-slate-700 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 mt-4">
                  <span className="text-xs font-bold text-white">Active</span>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-brand"
                  />
                </div>
              </div>

              {/* Buttons */}
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
                  className="text-xs font-bold shadow-md shadow-brand/20"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : modalMode === "create" ? (
                    "Create Category"
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
