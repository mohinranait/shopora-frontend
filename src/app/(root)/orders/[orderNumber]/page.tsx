import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CustomerOrderClient } from "@/components/orders/CustomerOrderClient";
import { OrderDetailSkeleton } from "@/components/orders/OrderDetailView";

export const metadata: Metadata = {
  title: "Order details | Shopora",
  robots: { index: false },
};

type Params = Promise<{ orderNumber: string }>;

async function OrderLoader({ params }: { params: Params }) {
  const { orderNumber } = await params;
  return <CustomerOrderClient orderNumber={decodeURIComponent(orderNumber)} />;
}

export default function OrderDetailPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-16 sm:px-6 lg:px-8">
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderLoader params={params} />
      </Suspense>
    </div>
  );
}
