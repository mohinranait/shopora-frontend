"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Layers,
  Sparkles,
  DollarSign,
  Boxes,
  Truck,
  Globe,
  Upload,
  Plus,
  Trash2,
  Check,
  X,
  Eye,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
  Palette,
  Hash,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetAttributesQuery,
  useGenerateCombinationsMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import {
  IProductItem,
  IAttribute,
  ICategory,
  ICreateProductPayload,
  IProductVariantInput,
  IProductImageInput,
  IProductSelectedAttributeInput,
  SelectedMediaPayload,
} from "@/types";
import { MediaLibraryModal } from "@/components/media/MediaLibraryModal";
import { toast } from "sonner";

/* ========================================================================== */
/* UI Helper Interfaces                                                       */
/* ========================================================================== */

interface SelectedAttrGroup {
  attributeId: number;
  attributeName: string;
  type: string;
  selectedValues: number[];
}

interface ProductFormProps {
  initialData?: IProductItem;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();

  // ==========================================
  // Global Data Catalogs (RTK Query Cache)
  // ==========================================
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: brands = [], isLoading: isBrandsLoading } = useGetBrandsQuery(true);
  const { data: availableAttributes = [] } = useGetAttributesQuery(true);
  const [generateCombinations, { isLoading: isGenerating }] = useGenerateCombinationsMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // ==========================================
  // Form State: 1. Core General Info
  // ==========================================
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [categoryId, setCategoryId] = useState<number | "">(initialData?.categoryId || "");
  const [brandId, setBrandId] = useState<number | "">(initialData?.brandId || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
  const [warranty, setWarranty] = useState(initialData?.warranty || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");

  // ==========================================
  // Form State: 2. Product Type
  // ==========================================
  const [productType, setProductType] = useState<"SIMPLE" | "VARIABLE">(
    (initialData?.productType as "SIMPLE" | "VARIABLE") || "SIMPLE"
  );

  // ==========================================
  // Form State: 3. Pricing & Inventory (Simple Fallback)
  // ==========================================
  const [basePrice, setBasePrice] = useState<number | "">(initialData?.basePrice ?? "");
  const [comparePrice, setComparePrice] = useState<number | "">(initialData?.comparePrice ?? "");
  const [costPrice, setCostPrice] = useState<number | "">(initialData?.costPrice ?? "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [stock, setStock] = useState<number | "">(initialData?.stock ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | "">(
    initialData?.lowStockThreshold ?? 5
  );
  const [trackStock, setTrackStock] = useState(initialData?.trackStock ?? true);

  // ==========================================
  // Form State: 4. Media
  // ==========================================
  const [mainImageUrl, setMainImageUrl] = useState(initialData?.mainImage || "");
  const [mainImageUseMediaId, setMainImageUseMediaId] = useState<number | undefined>(
    initialData?.mainImageUseMediaId ?? undefined
  );
  const [galleryImages, setGalleryImages] = useState<
    Array<{ url: string; useMediaId?: number; altText?: string }>
  >(
    initialData?.images?.map((img) => ({
      url: img.url,
      useMediaId: img.useMediaId ?? undefined,
      altText: img.altText ?? undefined,
    })) || []
  );

  // Media Modal Trigger Target
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"main" | "gallery" | { variantIndex: number }>("main");

  // ==========================================
  // Form State: 5. Variable Products (Attributes & Variant Matrix)
  // ==========================================
  const [selectedAttributeGroups, setSelectedAttributeGroups] = useState<SelectedAttrGroup[]>(() => {
    if (!initialData?.selectedAttributes || initialData.selectedAttributes.length === 0) return [];
    return initialData.selectedAttributes.map((sa) => ({
      attributeId: sa.attributeId,
      attributeName: sa.name || `Attribute #${sa.attributeId}`,
      type: sa.type || "SELECT",
      selectedValues: sa.values
        .map((v) => v.attributeValueId)
        .filter((v): v is number => typeof v === "number"),
    }));
  });

  const [variantRows, setVariantRows] = useState<IProductVariantInput[]>(() => {
    if (!initialData?.variants || initialData.variants.length === 0) return [];
    return initialData.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      comparePrice: v.comparePrice,
      costPrice: v.costPrice,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold || 5,
      image: v.image,
      useMediaId: v.useMediaId,
      barcode: v.barcode,
      isDefault: v.isDefault,
      isActive: v.isActive,
      attributeValueIds: v.attributeValues?.map((av) => av.attributeValueId) || [],
      attributes: v.attributes,
    }));
  });

  // Bulk Edit Inputs
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");

  // ==========================================
  // Form State: 6. Shipping & Dimensions
  // ==========================================
  const [weightKg, setWeightKg] = useState<number | "">(initialData?.weightKg ?? "");
  const [lengthCm, setLengthCm] = useState<number | "">(initialData?.dimensions?.length ?? "");
  const [widthCm, setWidthCm] = useState<number | "">(initialData?.dimensions?.width ?? "");
  const [heightCm, setHeightCm] = useState<number | "">(initialData?.dimensions?.height ?? "");
  const [isFreeShipping, setFreeShipping] = useState(initialData?.isFreeShipping ?? false);

  // ==========================================
  // Form State: 7. SEO Metadata (SEO-Friendly!)
  // ==========================================
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [metaKeywords, setMetaKeywords] = useState(initialData?.metaKeywords || "");

  // ==========================================
  // Form State: 8. Status & Flags
  // ==========================================
  const [status, setStatus] = useState<"PUBLISHED" | "UNPUBLISHED" | "ARCHIVED">(
    (initialData?.status as "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED") || "PUBLISHED"
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isTrending, setIsTrending] = useState(initialData?.isTrending ?? false);

  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // 1. Auto-generate Slug from Product Name
  // ==========================================
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugCustomized) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
      if (!metaTitle) {
        setMetaTitle(val ? `${val} | Shopora Bangladesh` : "");
      }
    }
  };

  // ==========================================
  // 3. Media Selection Callback
  // ==========================================
  const handleMediaSelected = (payload: SelectedMediaPayload) => {
    if (mediaTarget === "main") {
      setMainImageUrl(payload.url);
      setMainImageUseMediaId(payload.useMediaId);
      toast.success("Main product image updated.");
    } else if (mediaTarget === "gallery") {
      setGalleryImages((prev) => [
        ...prev,
        { url: payload.url, useMediaId: payload.useMediaId, altText: payload.alt },
      ]);
      toast.success("Image added to gallery.");
    } else if (typeof mediaTarget === "object" && "variantIndex" in mediaTarget) {
      const idx = mediaTarget.variantIndex;
      setVariantRows((prev) =>
        prev.map((r, i) =>
          i === idx ? { ...r, image: payload.url, useMediaId: payload.useMediaId } : r
        )
      );
      toast.success("Variant image assigned.");
    }
    setIsMediaModalOpen(false);
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // 4. Attribute Group Selection for Variable Products
  // ==========================================
  const handleAddAttributeGroup = (attrId: number) => {
    if (!attrId) return;
    if (selectedAttributeGroups.some((g) => g.attributeId === attrId)) {
      toast.info("This attribute is already added to the product.");
      return;
    }

    const matched = availableAttributes.find((a) => a.id === attrId);
    if (!matched) return;

    setSelectedAttributeGroups((prev) => [
      ...prev,
      {
        attributeId: matched.id,
        attributeName: matched.name,
        type: matched.type,
        selectedValues: matched.values.map((v) => v.id), // Default to selecting all
      },
    ]);
  };

  const handleRemoveAttributeGroup = (attrId: number) => {
    setSelectedAttributeGroups((prev) => prev.filter((g) => g.attributeId !== attrId));
  };

  const handleToggleAttributeValue = (attrId: number, valueId: number) => {
    setSelectedAttributeGroups((prev) =>
      prev.map((g) => {
        if (g.attributeId !== attrId) return g;
        const exists = g.selectedValues.includes(valueId);
        const updated = exists
          ? g.selectedValues.filter((id) => id !== valueId)
          : [...g.selectedValues, valueId];
        return { ...g, selectedValues: updated };
      })
    );
  };

  const handleSelectAllValues = (attrId: number) => {
    const matched = availableAttributes.find((a) => a.id === attrId);
    if (!matched) return;
    setSelectedAttributeGroups((prev) =>
      prev.map((g) =>
        g.attributeId === attrId ? { ...g, selectedValues: matched.values.map((v) => v.id) } : g
      )
    );
  };

  const handleClearAllValues = (attrId: number) => {
    setSelectedAttributeGroups((prev) =>
      prev.map((g) => (g.attributeId === attrId ? { ...g, selectedValues: [] } : g))
    );
  };

  // ==========================================
  // 5. Variant Combinations Generator ("Generate" Button!)
  // ==========================================
  const handleGenerateVariants = async () => {
    const validGroups = selectedAttributeGroups.filter((g) => g.selectedValues.length > 0);
    if (validGroups.length === 0) {
      toast.error("Please select at least one attribute with values before generating variants.");
      return;
    }

    try {
      const res = await generateCombinations({
        attributes: validGroups.map((g) => ({
          attributeId: g.attributeId,
          valueIds: g.selectedValues,
        })),
      }).unwrap();

      // Calculate master SKU base
      const skuBase = sku.trim() || name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "PRD");

      // Map generated combinations into variant rows
      const rows: IProductVariantInput[] = res.variants.map((v, i) => {
        // If an existing row had the same title, preserve price & stock
        const existingRow = variantRows.find((r) => r.title === v.title);

        return {
          id: existingRow?.id,
          title: v.title,
          sku: existingRow?.sku || `${skuBase}-${v.suggestedSkuSuffix || `VAR${i + 1}`}`,
          price: existingRow?.price || (typeof basePrice === "number" ? basePrice : 0),
          comparePrice: existingRow?.comparePrice || (typeof comparePrice === "number" ? comparePrice : null),
          costPrice: existingRow?.costPrice || (typeof costPrice === "number" ? costPrice : null),
          stock: existingRow?.stock || 0,
          lowStockThreshold: existingRow?.lowStockThreshold || 5,
          image: existingRow?.image || null,
          useMediaId: existingRow?.useMediaId || null,
          barcode: existingRow?.barcode || null,
          isDefault: i === 0,
          isActive: true,
          attributeValueIds: v.attributeValueIds,
          attributes: v.attributes,
        };
      });

      setVariantRows(rows);
      toast.success(
        `Generated ${rows.length} product variants across ${validGroups.length} attributes!`
      );
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Bulk Apply Price
  const handleApplyBulkPrice = () => {
    const num = parseFloat(bulkPrice);
    if (isNaN(num) || num < 0) {
      toast.error("Please enter a valid price amount");
      return;
    }
    setVariantRows((prev) => prev.map((r) => ({ ...r, price: num })));
    toast.success(`Updated price to ৳${num} on all ${variantRows.length} variants.`);
    setBulkPrice("");
  };

  // Bulk Apply Stock
  const handleApplyBulkStock = () => {
    const num = parseInt(bulkStock, 10);
    if (isNaN(num) || num < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    setVariantRows((prev) => prev.map((r) => ({ ...r, stock: num })));
    toast.success(`Updated stock to ${num} units on all ${variantRows.length} variants.`);
    setBulkStock("");
  };

  // Delete Individual Variant Row
  const handleRemoveVariantRow = (index: number) => {
    setVariantRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Set Default Variant
  const handleSetDefaultVariant = (index: number) => {
    setVariantRows((prev) =>
      prev.map((r, i) => ({
        ...r,
        isDefault: i === index,
      }))
    );
  };

  // ==========================================
  // 6. Submit Master Product Form
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Product title is required.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a primary category.");
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error("Full product description must be at least 10 characters long.");
      return;
    }

    if (!mainImageUrl && !mainImageUseMediaId) {
      toast.error("Please upload or select a main product image.");
      return;
    }

    if (productType === "SIMPLE") {
      if (typeof basePrice !== "number" || basePrice <= 0) {
        toast.error("Please provide a valid regular base price greater than 0.");
        return;
      }
    } else {
      if (variantRows.length === 0) {
        toast.error("Variable products must have at least one generated variant row.");
        return;
      }
      for (let i = 0; i < variantRows.length; i++) {
        const v = variantRows[i];
        if (typeof v.price !== "number" || v.price <= 0) {
          toast.error(`Variant row #${i + 1} ("${v.title}") requires a valid price greater than 0.`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      // Parse tags
      const parsedTags = tagsInput
        ? tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      // Calculate total stock if variable
      const finalStock =
        productType === "VARIABLE"
          ? variantRows.reduce((sum, v) => sum + (v.stock || 0), 0)
          : typeof stock === "number"
          ? stock
          : 0;

      // Base price for variable product (take lowest variant price if not set)
      const finalBasePrice =
        productType === "VARIABLE"
          ? typeof basePrice === "number" && basePrice > 0
            ? basePrice
            : Math.min(...variantRows.map((v) => v.price))
          : Number(basePrice);

      // Build Selected Attributes Input Payload
      const selectedAttributesPayload: IProductSelectedAttributeInput[] =
        productType === "VARIABLE"
          ? selectedAttributeGroups.map((g) => ({
              attributeId: g.attributeId,
              isVariation: true,
              values: g.selectedValues,
            }))
          : [];

      // Build Gallery Images Payload
      const imagesPayload: IProductImageInput[] = galleryImages.map((img, idx) => ({
        url: img.url,
        useMediaId: img.useMediaId,
        altText: img.altText || name,
        displayOrder: idx,
        isPrimary: idx === 0,
      }));

      // Assemble Master Payload
      const payload: ICreateProductPayload = {
        name: name.trim(),
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim(),
        categoryId: Number(categoryId),
        brandId: brandId ? Number(brandId) : null,
        sku: sku.trim() || undefined,
        productType,
        basePrice: finalBasePrice,
        comparePrice: typeof comparePrice === "number" ? comparePrice : null,
        costPrice: typeof costPrice === "number" ? costPrice : null,
        stock: finalStock,
        lowStockThreshold: typeof lowStockThreshold === "number" ? lowStockThreshold : 5,
        mainImage: mainImageUrl,
        mainImageUseMediaId,
        images: imagesPayload,
        selectedAttributes: selectedAttributesPayload,
        variants: productType === "VARIABLE" ? variantRows : [],
        tags: parsedTags,
        warranty: warranty.trim() || undefined,
        weightKg: typeof weightKg === "number" ? weightKg : undefined,
        dimensions:
          typeof lengthCm === "number" || typeof widthCm === "number" || typeof heightCm === "number"
            ? {
                length: typeof lengthCm === "number" ? lengthCm : undefined,
                width: typeof widthCm === "number" ? widthCm : undefined,
                height: typeof heightCm === "number" ? heightCm : undefined,
              }
            : undefined,
        videoUrl: videoUrl.trim() || undefined,
        trackStock,
        isFreeShipping,
        metaTitle: metaTitle.trim() || `${name.trim()} | Shopora Bangladesh`,
        metaDescription: metaDescription.trim() || shortDescription.trim() || undefined,
        metaKeywords: metaKeywords.trim() || undefined,
        isFeatured,
        isTrending,
      };

      if (isEdit && initialData) {
        await updateProduct({
          id: initialData.id,
          body: {
            ...payload,
            status,
          },
        }).unwrap();
        toast.success(`Product "${name}" updated successfully!`);
      } else {
        const created = await createProduct(payload).unwrap();
        toast.success(`Product "${created.name}" created and published successfully!`);
      }

      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Live SEO Snippet Computations
  const seoPreviewUrl = `https://shopora.com/products/${slug || "product-slug"}`;
  const seoPreviewTitle = metaTitle || `${name || "Product Name"} | Shopora Bangladesh`;
  const seoPreviewDesc =
    metaDescription ||
    shortDescription ||
    "Discover authentic premium products with fast nationwide shipping, warranty, and cash on delivery at Shopora Bangladesh.";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button size="sm" variant="outline" type="button" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isEdit ? `Edit Product: ${initialData?.name}` : "Create New Product"}
              </h1>
              <Badge variant={productType === "VARIABLE" ? "purple" : "brand"} className="text-[10px] uppercase font-bold">
                {productType === "VARIABLE" ? "Variable Product" : "Simple Product"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in product specifications, dynamic variants, media, and SEO attributes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="brand"
            size="sm"
            disabled={submitting || isCreating || isUpdating}
            className="text-xs gap-1.5 font-bold shadow-md shadow-brand/20 px-4"
          >
            {submitting || isCreating || isUpdating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isEdit ? "Update Product" : "Publish Product"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 1: Product Type Toggle (Simple vs Variable)               */}
      {/* ================================================================= */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-950/40 p-4 border-b border-slate-800">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand" />
            <span>Select Product Architecture</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Simple Product Card */}
            <div
              onClick={() => setProductType("SIMPLE")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                productType === "SIMPLE"
                  ? "bg-brand/10 border-brand text-white shadow-md shadow-brand/10"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  productType === "SIMPLE" ? "bg-brand text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Package className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Simple Product</h4>
                  {productType === "SIMPLE" && (
                    <span className="h-2 w-2 rounded-full bg-brand" />
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Single SKU item with a single set price, weight, and inventory level (e.g. books, single-size tech accessories).
                </p>
              </div>
            </div>

            {/* Variable Product Card */}
            <div
              onClick={() => setProductType("VARIABLE")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                productType === "VARIABLE"
                  ? "bg-purple-600/10 border-purple-500 text-white shadow-md shadow-purple-600/10"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  productType === "VARIABLE"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Variable Product (Dynamic Variants)</h4>
                  {productType === "VARIABLE" && (
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generates multi-attribute variations (e.g. Color × Size, RAM × Storage) with custom pricing, SKU, and stock per row.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* SECTION 2: General Information                                    */}
      {/* ================================================================= */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-950/40 p-4 border-b border-slate-800">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Info className="h-4 w-4 text-sky-400" />
            <span>General Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Product Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Swift Pro Ultra Wireless Gaming Mouse"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-800 bg-slate-950 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand font-medium"
            />
          </div>

          {/* Slug (URL Identifier) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                SEO Permalinks / Slug
              </label>
              <button
                type="button"
                onClick={() => setIsSlugCustomized(!isSlugCustomized)}
                className="text-[11px] text-brand hover:underline font-semibold"
              >
                {isSlugCustomized ? "Lock (Auto-generate)" : "Customize Slug"}
              </button>
            </div>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 px-3 text-xs text-slate-400 font-mono">
              <span className="text-slate-500 select-none">shopora.com/products/</span>
              <input
                type="text"
                value={slug}
                readOnly={!isSlugCustomized}
                onChange={(e) => setSlug(e.target.value)}
                className={`flex-1 h-9 bg-transparent px-1 text-white font-mono text-xs focus:outline-none ${
                  isSlugCustomized ? "border-b border-brand" : "text-slate-300"
                }`}
              />
            </div>
          </div>

          {/* Category & Brand Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Primary Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand font-medium"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent ? `— ${c.name} (${c.parent.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Brand / Manufacturer (Optional)
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand font-medium"
              >
                <option value="">-- Select Brand (No Brand) --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Short Description / Key Highlights
            </label>
            <input
              type="text"
              placeholder="e.g. PixArt 3395 Sensor, 26,000 DPI, 54g Ultra-lightweight, 80-Hour Battery"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Detailed Description & Specifications <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Provide a comprehensive product overview, in-depth technical specifications, box contents, and customer benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand leading-relaxed"
            />
          </div>

          {/* Warranty, Tags & Video URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Official Warranty
              </label>
              <input
                type="text"
                placeholder="e.g. 1 Year Official Brand Warranty"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Search Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. gaming, wireless, rgb, lightweight"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Product Video Embed / URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* SECTION 3: Media & Gallery                                        */}
      {/* ================================================================= */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-950/40 p-4 border-b border-slate-800">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-emerald-400" />
            <span>Product Imagery &amp; Media Assets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Main Product Thumbnail */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Primary Product Thumbnail <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                onClick={() => {
                  setMediaTarget("main");
                  setIsMediaModalOpen(true);
                }}
                className="h-28 w-28 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 hover:border-brand transition flex flex-col items-center justify-center p-2 text-center cursor-pointer group relative overflow-hidden"
              >
                {mainImageUrl ? (
                  <>
                    <img
                      src={mainImageUrl}
                      alt="Product main thumbnail"
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white font-medium">
                      Change
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-500 group-hover:text-brand transition mb-1" />
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-200">
                      Select Main Image
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-400">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMediaTarget("main");
                    setIsMediaModalOpen(true);
                  }}
                  className="text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-brand" />
                  <span>Choose from Cloudinary Media Library</span>
                </Button>
                <p className="text-[11px] text-slate-500">
                  Recommended size: 1000 × 1000 px. Transparent PNG or clean white background.
                </p>
              </div>
            </div>
          </div>

          {/* Product Gallery Images */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Product Image Gallery ({galleryImages.length})
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setMediaTarget("gallery");
                  setIsMediaModalOpen(true);
                }}
                className="text-xs gap-1.5 h-8"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Add Gallery Image</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="h-20 w-20 rounded-xl border border-slate-800 bg-slate-950 p-1 relative group overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={`Gallery ${idx}`}
                    className="h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                    title="Remove Image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <div
                onClick={() => {
                  setMediaTarget("gallery");
                  setIsMediaModalOpen(true);
                }}
                className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-800 hover:border-slate-600 bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer transition text-slate-500 hover:text-white"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[9px] mt-0.5">Add More</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* SECTION 4: SIMPLE PRODUCT PRICING & INVENTORY                     */}
      {/* ================================================================= */}
      {productType === "SIMPLE" && (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
          <CardHeader className="bg-slate-950/40 p-4 border-b border-slate-800">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Simple Product Pricing &amp; Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Base Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Regular / Selling Price (BDT) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    placeholder="2500"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              {/* Compare Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Original / Strikethrough Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="2990"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                {typeof basePrice === "number" &&
                  typeof comparePrice === "number" &&
                  comparePrice > basePrice && (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {Math.round(((comparePrice - basePrice) / comparePrice) * 100)}% Discount Displayed
                    </span>
                  )}
              </div>

              {/* Cost Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Cost Price (For Merchant Profit Calculation)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="1800"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                {typeof basePrice === "number" &&
                  typeof costPrice === "number" &&
                  basePrice > costPrice && (
                    <span className="text-[10px] text-purple-400 font-bold">
                      Gross Profit: ৳{basePrice - costPrice} (
                      {Math.round(((basePrice - costPrice) / basePrice) * 100)}% Margin)
                    </span>
                  )}
              </div>
            </div>

            {/* Inventory Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Master SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SHO-APX-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono uppercase text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Stock Units Available
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : 0)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  value={lowStockThreshold}
                  onChange={(e) =>
                    setLowStockThreshold(e.target.value ? Number(e.target.value) : 5)
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-800/60 mt-3">
              <input
                type="checkbox"
                id="trackStockCheckbox"
                checked={trackStock}
                onChange={(e) => setTrackStock(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand"
              />
              <label
                htmlFor="trackStockCheckbox"
                className="text-xs text-slate-300 font-medium cursor-pointer select-none"
              >
                Track inventory stock count automatically
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================================================= */}
      {/* SECTION 5: VARIABLE PRODUCT (Attributes Selection & Matrix Table)  */}
      {/* ================================================================= */}
      {productType === "VARIABLE" && (
        <Card className="bg-slate-900 border-purple-900/60 overflow-hidden shadow-lg shadow-purple-950/20">
          <CardHeader className="bg-purple-950/40 p-4 border-b border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-purple-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Variable Attributes &amp; Variant Generation</span>
              </CardTitle>
              <CardDescription className="text-xs text-purple-300/70 mt-1">
                Select specification attributes, check the values for this product, then click &quot;Generate Variants&quot;.
              </CardDescription>
            </div>

            {/* Global Attributes Selector Dropdown */}
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddAttributeGroup(Number(e.target.value));
                    e.target.value = "";
                  }
                }}
                className="h-9 px-3 rounded-xl border border-purple-800 bg-slate-950 text-xs text-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-400 font-semibold"
              >
                <option value="">+ Add Attribute (e.g. Color, Size)...</option>
                {availableAttributes
                  .filter((a) => !selectedAttributeGroups.some((g) => g.attributeId === a.id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.values?.length || 0} values)
                    </option>
                  ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Step 1: Selected Attributes Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Step 1: Choose Attribute Values for this Product
                </h4>
                <span className="text-[11px] text-slate-400">
                  {selectedAttributeGroups.length} attributes active
                </span>
              </div>

              {selectedAttributeGroups.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-2 bg-slate-950/40">
                  <SlidersHorizontal className="h-7 w-7 text-purple-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">No attributes added yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Choose attributes (such as Color and Size) from the dropdown above to define variations for this product.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAttributeGroups.map((group) => {
                    const fullAttr = availableAttributes.find((a) => a.id === group.attributeId);
                    const valuesList = fullAttr?.values || [];

                    return (
                      <div
                        key={group.attributeId}
                        className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{group.attributeName}</span>
                            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                              {group.type}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              ({group.selectedValues.length} of {valuesList.length} selected)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectAllValues(group.attributeId)}
                              className="text-[11px] text-brand hover:underline font-medium"
                            >
                              Select All
                            </button>
                            <span className="text-slate-700">•</span>
                            <button
                              type="button"
                              onClick={() => handleClearAllValues(group.attributeId)}
                              className="text-[11px] text-slate-400 hover:text-white font-medium"
                            >
                              Clear
                            </button>
                            <span className="text-slate-700">•</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttributeGroup(group.attributeId)}
                              className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Values Pill Checklist */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {valuesList.map((val) => {
                            const isChecked = group.selectedValues.includes(val.id);
                            return (
                              <button
                                key={val.id}
                                type="button"
                                onClick={() => handleToggleAttributeValue(group.attributeId, val.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                  isChecked
                                    ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                                }`}
                              >
                                {group.type === "COLOR" && val.colorCode && (
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-white/30 shrink-0"
                                    style={{ backgroundColor: val.colorCode }}
                                  />
                                )}
                                <span>{val.value}</span>
                                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: "Generate Variants" Action Button */}
            {selectedAttributeGroups.length > 0 && (
              <div className="pt-2 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-800/40">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Variant Multiplier Ready</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Click the button to automatically compute combinations and generate individual variation rows.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="default"
                  onClick={handleGenerateVariants}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 shadow-lg shadow-purple-600/30 px-5 h-10 shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Combinations...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Variants</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Variants Matrix Table */}
            {variantRows.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Step 3: Variant Inventory Matrix ({variantRows.length} Rows)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Configure individual price, stock, and thumbnail per variation.
                    </p>
                  </div>

                  {/* Bulk Action Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                      <input
                        type="number"
                        placeholder="Price ৳"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        className="w-20 h-7 bg-transparent px-2 text-xs text-white focus:outline-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleApplyBulkPrice}
                        className="h-7 text-[10px] px-2"
                      >
                        Set All
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                      <input
                        type="number"
                        placeholder="Stock"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                        className="w-16 h-7 bg-transparent px-2 text-xs text-white focus:outline-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleApplyBulkStock}
                        className="h-7 text-[10px] px-2"
                      >
                        Set All
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Image</th>
                        <th className="py-2.5 px-3">Variant Combination</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Price (৳)</th>
                        <th className="py-2.5 px-3">Compare (৳)</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3 text-center">Default</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                      {variantRows.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition">
                          {/* Image */}
                          <td className="py-2 px-3">
                            <div
                              onClick={() => {
                                setMediaTarget({ variantIndex: idx });
                                setIsMediaModalOpen(true);
                              }}
                              className="h-10 w-10 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center cursor-pointer hover:border-brand overflow-hidden shrink-0 group relative"
                              title="Click to select image for this variant"
                            >
                              {v.image ? (
                                <img
                                  src={v.image}
                                  alt={v.title}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <Upload className="h-3.5 w-3.5 text-slate-500 group-hover:text-brand" />
                              )}
                            </div>
                          </td>

                          {/* Variant Title */}
                          <td className="py-2 px-3 font-semibold text-white">
                            <span>{v.title}</span>
                          </td>

                          {/* SKU */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={v.sku || ""}
                              onChange={(e) =>
                                setVariantRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx ? { ...r, sku: e.target.value } : r
                                  )
                                )
                              }
                              className="w-32 h-8 px-2 rounded-lg border border-slate-800 bg-slate-950 text-[11px] font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </td>

                          {/* Price */}
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              required
                              value={v.price}
                              onChange={(e) =>
                                setVariantRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, price: Number(e.target.value) || 0 }
                                      : r
                                  )
                                )
                              }
                              className="w-24 h-8 px-2 rounded-lg border border-slate-800 bg-slate-950 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </td>

                          {/* Compare Price */}
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              placeholder="Optional"
                              value={v.comparePrice ?? ""}
                              onChange={(e) =>
                                setVariantRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? {
                                          ...r,
                                          comparePrice: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                        }
                                      : r
                                  )
                                )
                              }
                              className="w-24 h-8 px-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </td>

                          {/* Stock */}
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={v.stock}
                              onChange={(e) =>
                                setVariantRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, stock: Number(e.target.value) || 0 }
                                      : r
                                  )
                                )
                              }
                              className="w-20 h-8 px-2 rounded-lg border border-slate-800 bg-slate-950 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </td>

                          {/* Is Default */}
                          <td className="py-2 px-3 text-center">
                            <input
                              type="radio"
                              name="defaultVariantRadio"
                              checked={v.isDefault}
                              onChange={() => handleSetDefaultVariant(idx)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                              title="Set as default storefront variant"
                            />
                          </td>

                          {/* Delete Action */}
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                              title="Remove Variant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================= */}
      {/* SECTION 6: Shipping & Logistics                                   */}
      {/* ================================================================= */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-950/40 p-4 border-b border-slate-800">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Truck className="h-4 w-4 text-sky-400" />
            <span>Shipping &amp; Physical Dimensions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Weight (KG)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                placeholder="0.25"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Length (CM)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                placeholder="12.5"
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Width (CM)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                placeholder="6.5"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Height (CM)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                placeholder="4.0"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="freeShippingCheck"
              checked={isFreeShipping}
              onChange={(e) => setFreeShipping(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand"
            />
            <label htmlFor="freeShippingCheck" className="text-xs text-slate-300 cursor-pointer select-none">
              Free Shipping for this Product across Bangladesh
            </label>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* SECTION 7: SEO Friendly Metadata & Live Google Preview            */}
      {/* ================================================================= */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-950/40 p-4 border-b border-slate-800">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            <span>Search Engine Optimization (SEO Friendly)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Live Google Search Snippet Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Google SERP Search Preview
            </span>
            <div className="space-y-0.5">
              <p className="text-xs text-emerald-400 font-mono truncate">{seoPreviewUrl}</p>
              <h4 className="text-base text-sky-400 font-medium hover:underline cursor-pointer truncate">
                {seoPreviewTitle}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {seoPreviewDesc}
              </p>
            </div>
          </div>

          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">Meta Title</label>
              <span className="text-[11px] text-slate-500">{metaTitle.length} / 60 characters</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Apex Swift Pro Ultra Gaming Mouse | Shopora Bangladesh"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand font-medium"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Meta Description
              </label>
              <span className="text-[11px] text-slate-500">
                {metaDescription.length} / 160 characters
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Provide a concise summary for search engine bots (aim for 120-160 characters)..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand leading-relaxed"
            />
          </div>

          {/* Meta Focus Keywords */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Meta Keywords (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. gaming mouse, wireless mouse, apex swift pro, buy mouse bangladesh"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* SECTION 8: Visibility & Flags                                     */}
      {/* ================================================================= */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-950/40 p-4 border-b border-slate-800">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand" />
            <span>Publishing Status &amp; Storefront Flags</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Publishing Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED")
                }
                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="PUBLISHED">Published (Visible on storefront)</option>
                <option value="UNPUBLISHED">Unpublished (Hidden from search)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeaturedCheck"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand"
              />
              <label htmlFor="isFeaturedCheck" className="text-xs text-slate-300 cursor-pointer select-none">
                Featured Deal / Homepage Spotlight
              </label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isTrendingCheck"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand"
              />
              <label htmlFor="isTrendingCheck" className="text-xs text-slate-300 cursor-pointer select-none">
                Trending / Best Seller Badge
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* Bottom Sticky Action Bar                                          */}
      {/* ================================================================= */}
      <div className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ready to save changes</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Discard Changes
            </Button>
          </Link>
          <Button
            type="submit"
            variant="brand"
            size="sm"
            disabled={submitting || isCreating || isUpdating}
            className="text-xs gap-1.5 font-bold shadow-lg shadow-brand/20 px-6 h-10"
          >
            {submitting || isCreating || isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{isEdit ? "Update Product" : "Publish Product"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Media Library Modal Integration */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelected}
        title={
          mediaTarget === "main"
            ? "Select Primary Product Image"
            : mediaTarget === "gallery"
            ? "Add to Product Gallery"
            : "Select Variant Thumbnail"
        }
      />
    </form>
  );
}
