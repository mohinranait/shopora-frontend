import React, { Suspense } from "react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";

export default function RootStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Suspense fallback={<header className="h-23.5 bg-white border-b border-slate-200" />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
