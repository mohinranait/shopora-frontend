"use client";

import React, { useEffect } from "react";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { SellerHeader } from "@/components/seller/SellerHeader";
import { SellerRouteGuard } from "@/components/seller/SellerRouteGuard";
import { SellerThemeProvider, useSellerTheme } from "@/context/SellerThemeContext";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function SellerLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useSellerTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    return () => {
      root.classList.remove("dark");
    };
  }, [theme]);

  return (
    <SellerRouteGuard>
      <div
        data-seller-theme={theme}
        className={cn(
          "min-h-screen flex w-full antialiased transition-colors duration-200",
          theme === "dark"
            ? "dark bg-background text-foreground"
            : "bg-slate-100/90 text-foreground"
        )}
      >
        <TooltipProvider delay={150}>
          <SidebarProvider defaultOpen={true} className="min-h-screen w-full flex">
            {/* Desktop Collapsible & Mobile Slide-over Sidebar */}
            <SellerSidebar />

            {/* Main Seller Central Work Area */}
            <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent transition-all duration-200">
              {/* Header Bar */}
              <SellerHeader />

              {/* Dynamic Route Content */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </div>
    </SellerRouteGuard>
  );
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerThemeProvider>
      <SellerLayoutContent>{children}</SellerLayoutContent>
    </SellerThemeProvider>
  );
}
