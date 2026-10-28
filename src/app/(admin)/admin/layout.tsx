"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";
import { cn } from "@/lib/utils";
import "@/styles/admin-theme.css";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useAdminTheme();

  return (
    <AdminRouteGuard>
      <div
        data-admin-theme={theme}
        className={cn(
          "min-h-screen flex antialiased transition-colors duration-200",
          theme === "light"
            ? "admin-theme-light bg-slate-100/90 text-slate-900"
            : "admin-theme-dark bg-slate-950 text-slate-100"
        )}
      >
        {/* Sidebar (Desktop Collapsible & Mobile Slide-over) */}
        <AdminSidebar
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Administrative Container */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          {/* Header Bar */}
          <AdminHeader
            onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          {/* Dynamic Route Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
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
