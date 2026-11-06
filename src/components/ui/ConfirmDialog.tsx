"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone. Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const iconConfig = {
    danger: {
      icon: Trash2,
      containerClass: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      buttonVariant: "destructive" as const,
      actionClass: "bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-950/40",
    },
    warning: {
      icon: AlertTriangle,
      containerClass: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      buttonVariant: "default" as const,
      actionClass: "bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-950/40",
    },
    info: {
      icon: Info,
      containerClass: "bg-sky-500/15 border-sky-500/30 text-sky-400",
      buttonVariant: "default" as const,
      actionClass: "bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-950/40",
    },
    primary: {
      icon: AlertCircle,
      containerClass: "bg-brand/15 border-brand/30 text-brand",
      buttonVariant: "brand" as const,
      actionClass: "bg-brand hover:bg-brand-deep text-white font-bold shadow-md",
    },
  }[variant];

  const IconComponent = iconConfig.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogContent className="max-w-md border-slate-800 bg-slate-900 rounded-lg gap-0 p-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4">
          <div
            className={cn(
              "h-12 w-12 rounded-lg border flex items-center justify-center shrink-0",
              iconConfig.containerClass
            )}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <AlertDialogHeader className="space-y-1.5 text-center sm:text-left min-w-0">
            <AlertDialogTitle className="text-base font-bold text-white tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="pt-2 border-t border-slate-800/80 p-4">
          <AlertDialogCancel
            disabled={isLoading}
            onClick={onClose}
            size="sm"
            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirm}
            size="sm"
            variant={iconConfig.buttonVariant}
            className={cn(
              "text-xs px-4 py-2  flex items-center gap-1.5 transition",
              iconConfig.actionClass
            )}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
