"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  X,
  Edit2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { ImageValue, SelectedMediaPayload } from "@/types";

export type { ImageValue };

interface ImageUploadFieldProps {
  label?: string;
  value?: ImageValue | null;
  onChange: (val: ImageValue | null) => void;
  helperText?: string;
  modalTitle?: string;
  required?: boolean;
}

export function ImageUploadField({
  label = "Upload Image",
  value,
  onChange,
  helperText = "Select an image from the WordPress-style Media Library or upload a new one.",
  modalTitle = "Select Image Asset",
  required = false,
}: ImageUploadFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectMedia = (payload: SelectedMediaPayload) => {
    onChange({
      url: payload.url,
      useMediaId: payload.useMediaId,
      alt: payload.alt,
      description: payload.description,
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="space-y-1.5 select-none">
      {label && (
        <label className="block text-xs font-semibold text-foreground">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Main Field Card */}
      {value && value.url ? (
        /* Selected Image State */
        <div className="relative rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-4 group">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail Preview */}
            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.url}
                alt={value.alt || "Uploaded Image"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {value.alt && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-xs font-medium">
                  Alt: &quot;{value.alt}&quot;
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="text-xs gap-1"
            >
              <Edit2 className="h-3 w-3" />
              <span>Change</span>
            </Button>
            <Button
              type="button"
              size="xs"
              variant="destructive"
              onClick={handleClear}
              className="text-xs"
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Empty / Placeholder State */
        <div
          onClick={() => setModalOpen(true)}
          className="border-2 border-dashed border-border hover:border-brand rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left cursor-pointer transition-all bg-muted/20 hover:bg-muted/50 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-brand transition-colors flex items-center gap-1.5">
                <span>Select from Media Library</span>
                <Sparkles className="h-3 w-3 text-brand" />
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {helperText}
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="xs"
            variant="brand"
            className="text-xs shrink-0 font-semibold"
          >
            <Upload className="h-3 w-3 mr-1" />
            Browse Assets
          </Button>
        </div>
      )}

      {/* Modal Dialog */}
      <MediaLibraryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectMedia}
        title={modalTitle}
        initialAlt={value?.alt || ""}
      />
    </div>
  );
}
