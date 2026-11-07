"use client";

import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useAdminTheme();

  React.useEffect(() => {
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
    <AdminRouteGuard>
      <div
        data-admin-theme={theme}
        className={cn(
          "min-h-screen flex w-full antialiased transition-colors duration-200",
          theme === "dark"
            ? "dark bg-background text-foreground"
            : "bg-slate-100/90 text-foreground"
        )}
      >
        <TooltipProvider delay={150}>
          <SidebarProvider defaultOpen={true} className="min-h-screen w-full flex">
            {/* Sidebar (Desktop Collapsible & Mobile Slide-over) */}
            <AdminSidebar />

            {/* Main Administrative Container */}
            <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent transition-all duration-200">
              {/* Header Bar */}
              <AdminHeader />

              {/* Dynamic Route Content */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">{children}</div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </div>
    </AdminRouteGuard>
  );
}

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}
