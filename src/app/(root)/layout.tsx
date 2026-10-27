import React, { Suspense } from "react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";

export default function RootStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Suspense fallback={<header className="h-16 bg-white border-b border-slate-200" />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
