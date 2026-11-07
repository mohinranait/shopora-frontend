"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  className?: string;
  showCloseButton?: boolean;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-[95vw]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  description,
  children,
  maxWidth = "lg",
  className,
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(maxWidthMap[maxWidth] || "max-w-lg", className)}
      >
        {(title || icon || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle className="flex items-center gap-2">
                {icon && <span className="shrink-0">{icon}</span>}
                <span>{title}</span>
              </DialogTitle>
            )}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="pt-1 border-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
