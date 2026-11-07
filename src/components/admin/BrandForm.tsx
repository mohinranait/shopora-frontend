"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/media/ImageUploadField";
import { useCreateBrandMutation, useUpdateBrandMutation } from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IBrand, ImageValue } from "@/types";
import { toast } from "sonner";
import { Input } from "../ui/input";

export interface BrandFormProps {
  mode: "create" | "edit";
  brand?: IBrand | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function BrandForm({
  mode,
  brand,
  onCancel,
  onSuccess,
}: BrandFormProps) {
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();

  // Initialize form state directly from props without an effect
  const [name, setName] = useState(() => (mode === "edit" && brand ? brand.name : ""));
  const [website, setWebsite] = useState(() => (mode === "edit" && brand ? brand.website || "" : ""));
  const [description, setDescription] = useState(() => (mode === "edit" && brand ? brand.description || "" : ""));
  const [isActive, setIsActive] = useState(() => (mode === "edit" && brand ? brand.isActive : true));
  const [logo, setLogo] = useState<ImageValue | null>(() => {
    if (mode === "edit" && brand?.logo) {
      return {
        url: brand.logo?.media?.url || "",
        useMediaId: brand.logoId ?? undefined,
        alt: brand.logo?.alt || `${brand.name} Logo`,
        description: brand.logo?.description || "",
      };
    }
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if brand prop changes while component remains mounted
  const [prevBrandId, setPrevBrandId] = useState(brand?.id);
  if (brand?.id !== prevBrandId) {
    setPrevBrandId(brand?.id);
    setName(brand?.name || "");
    setWebsite(brand?.website || "");
    setDescription(brand?.description || "");
    setIsActive(brand ? brand.isActive : true);
    setLogo(
      brand?.logo
        ? {
            url: brand.logo?.media?.url || "",
            useMediaId: brand.logoId ?? undefined,
            alt: brand.logo?.alt || `${brand.name} Logo`,
            description: brand.logo?.description || "",
          }
        : null
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        website: website.trim() || undefined,
        description: description.trim() || undefined,
        isActive,
        logo: logo?.url || undefined,
        logoId: logo?.useMediaId ?? null,
      };

      if (mode === "create") {
        await createBrand(payload).unwrap();
        toast.success("Brand created successfully!");
      } else if (brand) {
        await updateBrand({ id: brand.id, body: payload }).unwrap();
        toast.success("Brand updated successfully!");
      }

      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-200">
          Brand Name <span className="text-rose-400">*</span>
        </label>
        <Input
          type="text"
          required
          placeholder="e.g. Sony, Anker, Apple"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 "
        />
      </div>

      {/* WordPress-Style Media Library Image Upload Field */}
      <div>
        <ImageUploadField
          label="Brand Official Logo"
          value={logo}
          onChange={setLogo}
          helperText="Select logo from WordPress-style Media Library or upload new image to Cloudinary."
          modalTitle="Select Brand Logo Asset"
        />
      </div>

      {/* Official Website */}
      <div>
        <label className="block text-xs font-semibold text-slate-200">
          Official Website
        </label>
        <input
          type="url"
          placeholder="https://example.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand font-mono disabled:opacity-50"
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 w-full p-2.5 rounded-lg border border-slate-700 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand resize-none disabled:opacity-50"
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
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-brand disabled:opacity-50 cursor-pointer"
        />
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="brand"
          size="sm"
          disabled={isSubmitting}
          className="text-xs font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Create Brand"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
