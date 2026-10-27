import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { OrderConfirmation } from "@/components/cart/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order confirmed | Shopora",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Confirmation({ searchParams }: { searchParams: SearchParams }) {
  const { order } = await searchParams;
  const orderNumber = (Array.isArray(order) ? order[0] : order) ?? "";
  return <OrderConfirmation orderNumber={orderNumber.slice(0, 64)} />;
}

export default function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-brand" />
        </div>
      }
    >
      <Confirmation searchParams={searchParams} />
    </Suspense>
  );
}
