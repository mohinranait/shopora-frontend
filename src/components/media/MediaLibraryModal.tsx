"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  Info,
  Sparkles,
  FileImage,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetMediaLibraryQuery,
  useUploadFileMutation,
  useCreateUseMediaMutation,
  useDeleteMediaMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IMediaItem, SelectedMediaPayload } from "@/types";
import { toast } from "sonner";

export type { SelectedMediaPayload };

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (payload: SelectedMediaPayload) => void;
  title?: string;
  initialAlt?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select or Upload Media",
  initialAlt = "",
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [search, setSearch] = useState("");

  const {
    data: mediaData,
    isLoading: loading,
    isFetching,
    refetch,
  } = useGetMediaLibraryQuery({ limit: 100 }, { skip: !isOpen });

  const [uploadFileMutation, { isLoading: uploading }] = useUploadFileMutation();
  const [createUseMediaMutation, { isLoading: submitting }] = useCreateUseMediaMutation();
  const [deleteMediaMutation] = useDeleteMediaMutation();

  const mediaList = mediaData?.items || [];

  // Selected Media in Library (derived or user selected)
  const [userSelectedMedia, setUserSelectedMedia] = useState<IMediaItem | null>(null);
  const [customAltText, setCustomAltText] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedMedia = userSelectedMedia || (mediaList.length > 0 ? mediaList[0] : null);
  const altText =
    customAltText !== null
      ? customAltText
      : selectedMedia?.originalFilename
      ? selectedMedia.originalFilename.replace(/-/g, " ")
      : initialAlt;

  // Handle Image Selection in Grid
  const handleSelectMedia = (item: IMediaItem) => {
    setUserSelectedMedia(item);
    setCustomAltText(item.originalFilename ? item.originalFilename.replace(/-/g, " ") : initialAlt);
    setDescription("");
  };

  // Handle File Upload to Cloudinary & Media Model
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("file", file);
      const uploaded = await uploadFileMutation(formData).unwrap();
      setUserSelectedMedia(uploaded);
      setCustomAltText(uploaded.originalFilename || file.name.replace(/\.[^/.]+$/, ""));
      setActiveTab("library");
      toast.success("File uploaded to Cloudinary & Media model successfully!");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Handle Confirm / Insert Media (Creates UseMedia record)
  const handleConfirmSelection = async () => {
    if (!selectedMedia) return;

    try {
      const useMedia = await createUseMediaMutation({
        mediaId: selectedMedia.id,
        alt: altText.trim() || selectedMedia.originalFilename || "Shopora media",
        description: description.trim(),
      }).unwrap();

      onSelect({
        useMediaId: useMedia.id,
        url: selectedMedia.url,
        alt: useMedia.alt || "",
        description: useMedia.description || "",
        mediaId: selectedMedia.id,
      });

      toast.success("Asset linked to entity successfully.");
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Handle Delete Raw Media
  const handleDeleteMedia = async (id: string | number) => {
    if (!confirm("Are you sure you want to permanently delete this media asset?")) return;
    try {
      await deleteMediaMutation(id).unwrap();
      if (String(userSelectedMedia?.id) === String(id)) {
        setUserSelectedMedia(null);
        setCustomAltText(null);
      }
      toast.success("Media asset deleted.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.originalFilename && m.originalFilename.toLowerCase().includes(q)) ||
      m.url.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Dialog Window */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Top Header (WordPress Style) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <Badge variant="brand" className="text-[10px] py-0 font-mono">
                  Media Library
                </Badge>
              </h2>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("library")}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === "library"
                  ? "border-sky-500 text-sky-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Media Library ({mediaList.length})
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === "upload"
                  ? "border-sky-500 text-sky-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload New Files
            </button>
          </div>

          {activeTab === "library" && (
            <div className="flex items-center gap-2 py-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <button
                onClick={() => refetch()}
                disabled={loading || isFetching}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Refresh media list"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-sky-400" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {activeTab === "upload" ? (
            /* ===================================== */
            /* UPLOAD NEW IMAGE VIEW                 */
            /* ===================================== */
            <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-950/20">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="w-full max-w-xl border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 text-sky-400 animate-spin" />
                    <p className="text-sm font-bold text-white">Uploading image to Cloudinary...</p>
                    <p className="text-xs text-slate-400">Recording asset into Media model</p>
                  </div>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                      <Upload className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      Drop files to upload, or <span className="text-sky-400 underline">browse</span>
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Supported formats: JPG, PNG, WEBP, SVG. Files are automatically uploaded to your Cloudinary storage folder.
                    </p>
                    <div className="mt-5">
                      <Button size="sm" variant="brand" className="text-xs font-semibold">
                        Select File from Computer
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* ===================================== */
            /* MEDIA LIBRARY GRID + DETAILS SIDEBAR   */
            /* ===================================== */
            <>
              {/* Left / Center Grid View (65%) */}
              <div className="flex-1 p-5 overflow-y-auto border-r border-slate-800 bg-slate-950/30">
                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 text-sky-400 animate-spin" />
                    <span className="text-xs">Loading media assets...</span>
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <FileImage className="h-10 w-10 text-slate-700" />
                    <p className="text-xs">No media assets found matching search.</p>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setActiveTab("upload")}
                      className="text-xs"
                    >
                      Upload First Image
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                    {filteredMedia.map((item) => {
                      const isSelected = selectedMedia?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectMedia(item)}
                          className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                            isSelected
                              ? "border-sky-500 ring-2 ring-sky-500/40"
                              : "border-slate-800 hover:border-slate-600 bg-slate-900"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.originalFilename || "Media"}
                            className="w-full h-full object-cover"
                          />

                          {/* Selected Checkmark Badge (WordPress style) */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-sky-500 text-white flex items-center justify-center">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          )}

                          {/* Hover Filename Strip */}
                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.originalFilename || `Image #${item.id}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Attachment Details Inspector (35%) */}
              <div className="w-full md:w-80 lg:w-96 p-5 overflow-y-auto bg-slate-950/70 space-y-5 flex flex-col justify-between">
                {selectedMedia ? (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="border-b border-slate-800 pb-3">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Attachment Details
                      </p>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">
                        {selectedMedia.originalFilename || `media-asset-${selectedMedia.id}`}
                      </h4>
                    </div>

                    {/* Preview Image Card */}
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedMedia.url}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <a
                        href={selectedMedia.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 rounded bg-black/70 text-slate-300 hover:text-white transition"
                        title="View Full Size Image"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Meta info tags */}
                    <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-850 font-mono">
                      <p>
                        <span className="text-slate-500">ID:</span> #{selectedMedia.id}
                      </p>
                      <p>
                        <span className="text-slate-500">Dimensions:</span>{" "}
                        {selectedMedia.width || 800} × {selectedMedia.height || 800} px
                      </p>
                      <p>
                        <span className="text-slate-500">Format:</span>{" "}
                        <span className="uppercase text-sky-400 font-bold">
                          {selectedMedia.format || "jpg"}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Folder:</span> {selectedMedia.folder || "shopora"}
                      </p>
                    </div>

                    {/* SEO Metadata Inputs (Crucial for UseMedia Model!) */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-200">
                            Alt Text (Alternative Text) <span className="text-sky-400">*</span>
                          </label>
                          <span className="text-[10px] text-slate-500">Google SEO</span>
                        </div>
                        <input
                          type="text"
                          value={altText}
                          onChange={(e) => setCustomAltText(e.target.value)}
                          placeholder="e.g. Anker Soundcore Life P2i Earbuds Black"
                          className="mt-1 w-full h-8 px-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Crucial for search engines and screen readers.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-200">
                          Image Description / Caption
                        </label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g. Front showcase showing charging case and ergonomic ear tips"
                          className="mt-1 w-full p-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                        />
                      </div>
                    </div>

                    {/* Delete Action */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleDeleteMedia(selectedMedia.id)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete permanently from library
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                    <Info className="h-8 w-8 text-slate-700" />
                    <p className="text-xs font-semibold text-slate-400">No Image Selected</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click any asset in the media grid to inspect metadata, set SEO alt text, and link it.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Footer Action Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {selectedMedia ? (
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Selected: <strong className="text-white truncate max-w-xs">{selectedMedia.originalFilename || `Image #${selectedMedia.id}`}</strong>
              </span>
            ) : (
              <span>Select an image to continue</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              variant="brand"
              onClick={handleConfirmSelection}
              disabled={!selectedMedia || submitting}
              className="text-xs font-bold gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Linking UseMedia...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Select & Link Media
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
