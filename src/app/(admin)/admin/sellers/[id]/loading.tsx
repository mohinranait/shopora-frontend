import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <p className="text-xs">Loading comprehensive vendor profile & performance metrics…</p>
    </div>
  );
}
