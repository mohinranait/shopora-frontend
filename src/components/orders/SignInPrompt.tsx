import React from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

export function SignInPrompt({ redirect }: { redirect: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-brand-light">
        <PackageSearch className="h-6 w-6 text-brand-deep" />
      </div>
      <h1 className="text-base font-bold text-slate-900">Sign in to see your orders</h1>
      <p className="mt-1 text-xs text-slate-500">Checked out as a guest? Track your order with its number and phone.</p>
      <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row">
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="flex-1 rounded-md bg-brand-deep py-2.5 text-xs font-semibold text-white transition hover:bg-brand text-center"
        >
          Sign in
        </Link>
        <Link
          href="/track-order"
          className="flex-1 rounded-md border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 text-center"
        >
          Track an order
        </Link>
      </div>
    </div>
  );
}
