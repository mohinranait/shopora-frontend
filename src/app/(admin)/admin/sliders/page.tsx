"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Sparkles,
  Loader2,
  X,
  Image as ImageIcon,
  Flame,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetSlidersQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { ISliderItem, SliderType, ImageValue } from "@/types";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/media/ImageUploadField";

const GRADIENT_PRESETS = [
  { label: "Indigo & Purple", value: "from-blue-600 via-indigo-700 to-purple-800" },
  { label: "Emerald & Teal", value: "from-emerald-600 via-teal-700 to-cyan-900" },
  { label: "Crimson & Rose", value: "from-rose-600 via-pink-700 to-purple-900" },
  { label: "Sunset Amber", value: "from-amber-600 via-orange-600 to-red-800" },
  { label: "Midnight Dark", value: "from-slate-900 via-indigo-950 to-slate-950" },
];

export default function AdminSlidersPage() {
  const { data: sliders = [], isLoading: loading, isFetching, refetch } = useGetSlidersQuery(true);
  const [createSlider, { isLoading: isCreating }] = useCreateSliderMutation();
  const [updateSlider, { isLoading: isUpdating }] = useUpdateSliderMutation();
  const [deleteSlider] = useDeleteSliderMutation();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | SliderType>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingSlider, setEditingSlider] = useState<ISliderItem | null>(null);

  // Form State
  const [formType, setFormType] = useState<SliderType>("IMAGE_BG_CONTENT");
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBadgeText, setFormBadgeText] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formButtonText, setFormButtonText] = useState("Shop Now");
  const [formBgGradient, setFormBgGradient] = useState(GRADIENT_PRESETS[0].value);
  const [formBgColor, setFormBgColor] = useState("#1e1b4b");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImage, setFormImage] = useState<ImageValue | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingSlider(null);
    setFormType("IMAGE_BG_CONTENT");
    setFormTitle("");
    setFormSubtitle("");
    setFormDescription("");
    setFormBadgeText("");
    setFormLinkUrl("/products");
    setFormButtonText("Shop Now");
    setFormBgGradient(GRADIENT_PRESETS[0].value);
    setFormBgColor("#1e1b4b");
    setFormDisplayOrder(sliders.length + 1);
    setFormIsActive(true);
    setFormImage(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (slider: ISliderItem) => {
    setModalMode("edit");
    setEditingSlider(slider);
    setFormType(slider.type);
    setFormTitle(slider.title || "");
    setFormSubtitle(slider.subtitle || "");
    setFormDescription(slider.description || "");
    setFormBadgeText(slider.badgeText || "");
    setFormLinkUrl(slider.linkUrl || "/products");
    setFormButtonText(slider.buttonText || "Shop Now");
    setFormBgGradient(slider.bgGradient || GRADIENT_PRESETS[0].value);
    setFormBgColor(slider.bgColor || "#1e1b4b");
    setFormDisplayOrder(slider.displayOrder);
    setFormIsActive(slider.isActive);

    const imageUrl = slider.useMedia?.media?.url || slider.imageUrl;
    if (imageUrl) {
      setFormImage({
        url: imageUrl,
        useMediaId: slider.useMediaId || null,
        alt: slider.useMedia?.alt || slider.title || "Slider Image",
        description: slider.useMedia?.description || "",
      });
    } else {
      setFormImage(null);
    }

    setIsModalOpen(true);
  };

  // Submit Slider Form
  const handleSaveSlider = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formType !== "IMAGE_ONLY" && !formTitle.trim()) {
      toast.error("Slider Title is required for this type");
      return;
    }

    if (formType === "IMAGE_ONLY" && !formImage?.url) {
      toast.error("Please upload or select an image for Image-Only slider");
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        type: formType,
        title: formTitle.trim() || undefined,
        subtitle: formSubtitle.trim() || undefined,
        description: formDescription.trim() || undefined,
        badgeText: formBadgeText.trim() || undefined,
        imageUrl: formImage?.url || undefined,
        useMediaId: formImage?.useMediaId ?? null,
        linkUrl: formLinkUrl.trim() || "/products",
        buttonText: formButtonText.trim() || "Shop Now",
        bgGradient: formType === "CONTENT_ONLY" ? formBgGradient : undefined,
        bgColor: formType === "CONTENT_ONLY" ? formBgColor : undefined,
        displayOrder: Number(formDisplayOrder) || 0,
        isActive: formIsActive,
      };

      if (modalMode === "create") {
        await createSlider(payload).unwrap();
        toast.success("Hero slider created successfully!");
      } else if (editingSlider) {
        await updateSlider({ id: editingSlider.id, body: payload }).unwrap();
        toast.success("Hero slider updated successfully!");
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Slider
  const handleDeleteSlider = async (slider: ISliderItem) => {
    if (!confirm(`Are you sure you want to delete this slider?`)) return;

    try {
      await deleteSlider(slider.id).unwrap();
      toast.success("Slider removed successfully.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Counts
  const imageOnlyCount = sliders.filter((s) => s.type === "IMAGE_ONLY").length;
  const imageBgCount = sliders.filter((s) => s.type === "IMAGE_BG_CONTENT").length;
  const contentOnlyCount = sliders.filter((s) => s.type === "CONTENT_ONLY").length;

  // Filtered List
  const filteredSliders = sliders.filter((s) => {
    if (typeFilter !== "ALL" && s.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = s.title?.toLowerCase().includes(q);
      const matchSubtitle = s.subtitle?.toLowerCase().includes(q);
      const matchBadge = s.badgeText?.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchBadge;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Hero Slider &amp; Carousel Management
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Storefront Hero
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure homepage hero carousel slides across 3 distinct variants: Image Only, Background Image with Content, and Content Only.
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
            className="gap-1.5 text-xs font-bold shadow-md shadow-brand/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Slider</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total Slides
              </p>
              <p className="text-2xl font-black text-white mt-1">{sliders.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-purple-400 uppercase tracking-wider">
                Bg Image + Content
              </p>
              <p className="text-2xl font-black text-purple-400 mt-1">{imageBgCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">
                Image Only Posters
              </p>
              <p className="text-2xl font-black text-sky-400 mt-1">{imageOnlyCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ImageIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
                Content Only Cards
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{contentOnlyCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold gap-1 overflow-x-auto">
          <button
            onClick={() => setTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              typeFilter === "ALL" ? "bg-brand text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All Variants ({sliders.length})
          </button>
          <button
            onClick={() => setTypeFilter("IMAGE_BG_CONTENT")}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              typeFilter === "IMAGE_BG_CONTENT" ? "bg-brand text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Bg Image + Content ({imageBgCount})
          </button>
          <button
            onClick={() => setTypeFilter("IMAGE_ONLY")}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              typeFilter === "IMAGE_ONLY" ? "bg-brand text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Image Only ({imageOnlyCount})
          </button>
          <button
            onClick={() => setTypeFilter("CONTENT_ONLY")}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              typeFilter === "CONTENT_ONLY" ? "bg-brand text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Content Only ({contentOnlyCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search slides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {/* Sliders Grid */}
      {loading ? (
        <Card className="p-12 text-center text-slate-400 bg-slate-900 border-slate-800">
          <Loader2 className="h-6 w-6 text-sky-400 animate-spin mx-auto mb-2" />
          Loading hero sliders...
        </Card>
      ) : filteredSliders.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-slate-900 border-slate-800">
          No hero sliders found. Click &quot;Add Slider&quot; to create your first slide.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSliders.map((slider) => {
            const displayImg = slider.useMedia?.media?.url || slider.imageUrl;

            return (
              <div
                key={slider.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden hover:border-slate-700 transition flex flex-col justify-between"
              >
                {/* Visual Preview Box */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  {slider.type === "IMAGE_ONLY" && displayImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayImg}
                      alt={slider.title || "Slider"}
                      className="w-full h-full object-cover"
                    />
                  ) : slider.type === "IMAGE_BG_CONTENT" && displayImg ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayImg}
                        alt={slider.title || "Slider"}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 flex flex-col justify-end">
                        {slider.badgeText && (
                          <span className="text-[10px] font-bold text-amber-300 mb-1">
                            {slider.badgeText}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {slider.title || "No Title"}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full p-4 flex flex-col justify-center items-center text-center ${
                        slider.bgGradient
                          ? `bg-gradient-to-br ${slider.bgGradient}`
                          : "bg-gradient-to-br from-indigo-900 to-purple-900"
                      }`}
                      style={slider.bgColor ? { backgroundColor: slider.bgColor } : undefined}
                    >
                      {slider.badgeText && (
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider mb-1">
                          {slider.badgeText}
                        </span>
                      )}
                      <h4 className="text-sm font-black text-white line-clamp-2">
                        {slider.title || "Content-Only Banner"}
                      </h4>
                      {slider.subtitle && (
                        <p className="text-[11px] text-slate-200 line-clamp-1 mt-1">
                          {slider.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono bg-black/60 backdrop-blur-md text-white border-white/20">
                      Order #{slider.displayOrder}
                    </Badge>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        slider.type === "IMAGE_BG_CONTENT"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : slider.type === "IMAGE_ONLY"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {slider.type === "IMAGE_BG_CONTENT"
                        ? "Bg Image + Text"
                        : slider.type === "IMAGE_ONLY"
                        ? "Image Only"
                        : "Content Only"}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {slider.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Strip */}
                <div className="p-4 space-y-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {slider.title || `Slide #${slider.id}`}
                    </h3>
                  </div>

                  {slider.subtitle && (
                    <p className="text-xs text-slate-400 line-clamp-2">{slider.subtitle}</p>
                  )}

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
                    <span className="text-slate-500">CTA:</span>
                    <span className="text-sky-400 truncate">{slider.buttonText || "Shop Now"}</span>
                    <span className="text-slate-600">•</span>
                    <span className="truncate">{slider.linkUrl || "/products"}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                  <a
                    href={slider.linkUrl || "/products"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview Target
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(slider)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                      title="Edit slide"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlider(slider)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT MODAL                                          */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand" />
                  <span>{modalMode === "create" ? "Create New Hero Slide" : "Edit Hero Slide"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a variant type and customize visuals, typography, and CTA button.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlider} className="space-y-5">
              {/* Variant Selector (Tabs) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Slider Variant Type <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("IMAGE_BG_CONTENT")}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      formType === "IMAGE_BG_CONTENT"
                        ? "bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-300 uppercase">Hybrid</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-white">Bg Image + Text</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Full background image with floating headline &amp; CTA</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType("IMAGE_ONLY")}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      formType === "IMAGE_ONLY"
                        ? "bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <ImageIcon className="h-4 w-4 text-sky-400" />
                      <span className="text-[10px] font-bold text-sky-300 uppercase">Poster</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-white">Image Only</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">High-impact creative banner or ad poster</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType("CONTENT_ONLY")}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      formType === "CONTENT_ONLY"
                        ? "bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Flame className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-300 uppercase">Gradient</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-white">Content Only</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">CSS gradient card for discount coupons &amp; events</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title Input (Internal name for Image-Only, Main headline for others) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  {formType === "IMAGE_ONLY" ? "Slide Title / Identifier" : "Slide Headline"}{" "}
                  {formType !== "IMAGE_ONLY" && <span className="text-rose-400">*</span>}
                </label>
                <input
                  type="text"
                  required={formType !== "IMAGE_ONLY"}
                  placeholder={
                    formType === "IMAGE_ONLY"
                      ? "e.g. Brand Week Promo Banner"
                      : "e.g. Sony WH-1000XM5 Studio Wireless"
                  }
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                />
              </div>

              {/* Image Upload Field (for IMAGE_BG_CONTENT and IMAGE_ONLY) */}
              {(formType === "IMAGE_BG_CONTENT" || formType === "IMAGE_ONLY") && (
                <div>
                  <ImageUploadField
                    label={formType === "IMAGE_ONLY" ? "Slide Banner Image" : "Background Backdrop Image"}
                    value={formImage}
                    onChange={setFormImage}
                    helperText="Select or upload high-resolution 1800x600 banner from WordPress-style Media Library."
                    modalTitle="Select Hero Slide Image"
                  />
                </div>
              )}

              {/* Specific Content Inputs (Badge, Subtitle, Description) */}
              {formType !== "IMAGE_ONLY" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200">
                        Promo Badge Text (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ✨ New Arrival • 2026 or 🔥 30% OFF"
                        value={formBadgeText}
                        onChange={(e) => setFormBadgeText(e.target.value)}
                        className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200">
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shop Now or Explore"
                        value={formButtonText}
                        onChange={(e) => setFormButtonText(e.target.value)}
                        className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200">
                      Subtitle / Brief Copy
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catchy secondary line that elaborates on the headline..."
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-lg border border-slate-700 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                    />
                  </div>

                  {formType === "CONTENT_ONLY" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-200">
                        Voucher Code / Additional Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Use code 'SHOPORA2026' for instant ৳500 discount"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Gradient Presets for CONTENT_ONLY */}
              {formType === "CONTENT_ONLY" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Background Color Gradient Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFormBgGradient(p.value)}
                        className={`h-11 rounded-lg bg-gradient-to-r ${p.value} p-2 text-left flex items-center justify-between border transition ${
                          formBgGradient === p.value
                            ? "border-white ring-2 ring-white/50"
                            : "border-slate-700/60 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <span className="text-[11px] font-bold text-white">
                          {p.label}
                        </span>
                        {formBgGradient === p.value && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Link URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Target Link URL
                </label>
                <input
                  type="text"
                  placeholder="/products or /products/sony-wh-1000xm5"
                  value={formLinkUrl}
                  onChange={(e) => setFormLinkUrl(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                />
              </div>

              {/* Order & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200">
                    Display Order (Sorting sequence)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
                  <div>
                    <p className="text-xs font-bold text-white">Active in Hero Carousel</p>
                    <p className="text-[10px] text-slate-400">Visible to storefront visitors</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 text-brand focus:ring-brand"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
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
                  disabled={formSubmitting || isCreating || isUpdating}
                  className="text-xs font-bold px-5"
                >
                  {formSubmitting || isCreating || isUpdating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : modalMode === "create" ? (
                    "Create Slider"
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
