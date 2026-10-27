import React from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

export function SignInPrompt({ redirect }: { redirect: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light">
        <PackageSearch className="h-6 w-6 text-brand-deep" />
      </div>
      <h1 className="text-lg font-bold text-slate-900">Sign in to see your orders</h1>
      <p className="mt-1 text-sm text-slate-500">Checked out as a guest? Track your order with its number and phone.</p>
      <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="flex-1 rounded-xl bg-brand-deep py-3 text-sm font-semibold text-white transition hover:bg-brand"
        >
          Sign in
        </Link>
        <Link
          href="/track-order"
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          Track an order
        </Link>
      </div>
    </div>
  );
}
