"use client";

import React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl font-sans text-xs",
          description: "group-[.toast]:text-slate-400 text-[11px]",
          actionButton:
            "group-[.toast]:bg-sky-600 group-[.toast]:text-white font-semibold text-xs",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300 text-xs",
          success: "group-[.toaster]:border-emerald-500/40 group-[.toaster]:bg-slate-900",
          error: "group-[.toaster]:border-rose-500/40 group-[.toaster]:bg-slate-900",
          warning: "group-[.toaster]:border-amber-500/40 group-[.toaster]:bg-slate-900",
          info: "group-[.toaster]:border-sky-500/40 group-[.toaster]:bg-slate-900",
        },
      }}
      {...props}
    />
  );
}
