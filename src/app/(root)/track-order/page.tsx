import React, { Suspense } from "react";
import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/orders/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track your order | Shopora",
  description: "Check the status of your Shopora order with your order number and phone.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Tracker({ searchParams }: { searchParams: SearchParams }) {
  const { order } = await searchParams;
  const initial = (Array.isArray(order) ? order[0] : order) ?? "";
  return <TrackOrderClient initialOrderNumber={initial.slice(0, 64)} />;
}

export default function TrackOrderPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-16 sm:px-6 lg:px-8">
      <Suspense fallback={<TrackOrderClient />}>
        <Tracker searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
