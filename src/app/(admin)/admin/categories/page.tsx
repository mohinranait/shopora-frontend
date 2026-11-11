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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { ICategory, ImageValue, getCategoryImageUrl } from "@/types";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/media/ImageUploadField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";

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
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formDescription, setFormDescription] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImage, setFormImage] = useState<ImageValue | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Open Create Modal
  const handleOpenCreate = (parentId?: string) => {
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
        url: getCategoryImageUrl(cat) || "",
        useMediaId: cat.imageId ?? cat.useMediaId ?? undefined,
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
        imageId: formImage?.useMediaId ?? null,
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

  // Delete Confirmation State
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeletingCategory(true);
      await deleteCategory(categoryToDelete.id).unwrap();
      toast.success(`Category "${categoryToDelete.name}" removed successfully.`);
      setCategoryToDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeletingCategory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Categories & Taxonomy Hierarchy
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Dynamic API & Media Library
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Organize multi-level catalog categories, slug structures, and navigational menu ribbons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || isFetching}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-brand" : "text-muted-foreground"}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="brand"
            onClick={() => handleOpenCreate()}
            className="gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Categories Tree Grid */}
      {loading ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 text-brand animate-spin mx-auto mb-2" />
          Loading category taxonomy from database...
        </Card>
      ) : treeCategories.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No categories found. Click &quot;Add Category&quot; to create your first root category.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {treeCategories.map((cat) => {
            const displayImage = getCategoryImageUrl(cat);
            return (
              <Card key={cat.id} className="overflow-hidden">
                <div className="p-4 sm:p-5 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center p-1">
                      {displayImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={displayImage}
                          alt={cat.useMedia?.alt || cat.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FolderTree className="h-6 w-6 text-brand" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                        <span>{cat.name}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        /{cat.slug} 
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpenEdit(cat)}
                      className="text-xs cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="brand"
                      onClick={() => handleOpenCreate(cat.id)}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Subcategory
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => setCategoryToDelete(cat)}
                      className="text-xs p-1.5 cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories */}
                {cat.children && cat.children.length > 0 && (
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Subcategories ({cat.children.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {cat.children.map((sub) => {
                        const subImage = getCategoryImageUrl(sub);
                        return (
                          <div
                            key={sub.id}
                            className="p-3 rounded-lg border border-border bg-card flex items-center justify-between hover:border-brand/40 hover:bg-muted/30 transition group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {subImage && (
                                <div className="h-8 w-8 rounded overflow-hidden border border-border bg-muted shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={subImage}
                                    alt={sub.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground group-hover:text-brand transition truncate">
                                  {sub.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono truncate">
                                  /{sub.slug}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="p-1 rounded text-muted-foreground hover:text-brand hover:bg-muted transition cursor-pointer"
                                title="Edit subcategory"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setCategoryToDelete(sub)}
                                className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "create" ? "Add New Category" : `Edit Category: ${editingCategory?.name}`}
        icon={<Layers className="h-4 w-4 text-brand" />}
        description={
          modalMode === "create"
            ? "Create a new catalog category, slug structure, and hierarchy."
            : `Update details for "${editingCategory?.name}".`
        }
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">
              Category Name <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="cat-name"
              type="text"
              required
              placeholder="e.g. Smartwatches, Men's Clothing"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-parent">Parent Category</Label>
            <Select
              value={formParentId || ""}
              onValueChange={(val) => setFormParentId(val === "root" || !val ? null : val)}
            >
              <SelectTrigger id="cat-parent">
                <SelectValue placeholder="Select Parent Category">
                  {formParentId
                    ? categories.find((c) => c.id === formParentId)?.name || "Selected Subcategory"
                    : "None (Top-Level Root Category)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">None (Top-Level Root Category)</SelectItem>
                {categories
                  .filter((c) => (editingCategory ? c.id !== editingCategory.id : true))
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.parentId ? "(Subcategory)" : "(Root)"}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* WordPress-Style Media Library Image Upload Field */}
          <div>
            <ImageUploadField
              label="Category Cover Image"
              value={formImage}
              onChange={setFormImage}
              helperText="Select cover image from Media Library or upload new image for this category."
              modalTitle="Select Category Cover Asset"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              rows={2}
              placeholder="Short summary for SEO and navigation cards..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Display Order</Label>
              <Input
                id="cat-order"
                type="number"
                value={formDisplayOrder}
                onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30 h-9">
              <span className="text-xs font-bold text-foreground">Active</span>
              <Switch
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={formSubmitting}
              className="text-xs font-bold cursor-pointer"
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
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        isLoading={isDeletingCategory}
        title="Delete Category"
        description={`Are you sure you want to permanently delete "${categoryToDelete?.name}"? Any subcategories or products linked to this category may be affected.`}
        confirmText="Delete Category"
        variant="danger"
      />
    </div>
  );
}
