"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex antialiased">
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
