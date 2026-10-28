"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  Tag,
  SlidersHorizontal,
  AlertTriangle,
  ShoppingCart,
  Truck,
  RotateCcw,
  Store,
  ShieldCheck,
  CreditCard,
  Users,
  Star,
  TicketPercent,
  Image as ImageIcon,
  Settings,
  ShieldAlert,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "brand" | "warning" | "destructive" | "success";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/dashboard?tab=analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Catalog & Products",
    items: [
      {
        label: "All Products",
        href: "/admin/products",
        icon: Package,
        badge: 12,
        badgeVariant: "brand",
      },
      { label: "Categories", href: "/admin/categories", icon: Layers },
      { label: "Brands", href: "/admin/brands", icon: Tag },
      {
        label: "Attributes & Variants",
        href: "/admin/attributes",
        icon: SlidersHorizontal,
      },
      {
        label: "Low Stock Alert",
        href: "/admin/products?filter=low_stock",
        icon: AlertTriangle,
        badge: 5,
        badgeVariant: "warning",
      },
    ],
  },
  {
    title: "Sales & Orders",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        badge: "New",
        badgeVariant: "success",
      },
      { label: "Shipments & Delivery", href: "/admin/orders?status=SHIPPED", icon: Truck },
      {
        label: "Returns & Refunds",
        href: "/admin/orders?status=RETURNED",
        icon: RotateCcw,
        badge: 2,
        badgeVariant: "destructive",
      },
    ],
  },
  {
    title: "Multi-Vendor Ecosystem",
    items: [
      { label: "Vendors / Stores", href: "/admin/sellers", icon: Store },
      {
        label: "KYC Verification",
        href: "/admin/sellers/kyc",
        icon: ShieldCheck,
        badge: 3,
        badgeVariant: "warning",
      },
      {
        label: "Payouts & Wallets",
        href: "/admin/payouts",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Customers & Reviews",
    items: [
      { label: "Customer List", href: "/admin/customers", icon: Users },
      { label: "Reviews & Ratings", href: "/admin/products?tab=reviews", icon: Star },
    ],
  },
  {
    title: "Promotions & Marketing",
    items: [
      { label: "Hero Sliders", href: "/admin/sliders", icon: ImageIcon },
      { label: "Coupons & Discounts", href: "/admin/settings?tab=coupons", icon: TicketPercent },
    ],
  },
  {
    title: "System & Governance",
    items: [
      { label: "Store Settings", href: "/admin/settings", icon: Settings },
      { label: "Staff & Permissions", href: "/admin/settings?tab=staff", icon: ShieldAlert },
    ],
  },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    toast.success("Signed out successfully.");
    logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "admin-sidebar fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 text-slate-300 transition-all duration-300 select-none",
          // Mobile state
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop collapsed vs expanded
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-72" // Default width for mobile drawer
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-brand to-brand-deep flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    Shopora
                  </span>
                  <span className="rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold px-1.5 py-0.2 border border-sky-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">
                  Admin Command Center
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 rounded-lg items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition border border-slate-800"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed ? (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {section.title}
                </p>
              ) : (
                <div className="my-2 border-t border-slate-800/60" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin/dashboard"
                    ? pathname === "/admin/dashboard" || pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={`${section.title}-${item.label}`}
                    href={item.href}
                    onClick={() => {
                      if (isMobileOpen) onMobileClose();
                    }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group relative",
                      isActive
                        ? "bg-gradient-to-r from-brand to-brand-deep text-white font-bold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-sky-400"
                      )}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!collapsed && item.badge !== undefined && (
                      <Badge
                        variant={item.badgeVariant || "secondary"}
                        className="text-[10px] px-1.5 py-0 h-4 font-bold shrink-0"
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {/* Collapsed Tooltip / Dot Badge */}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          {/* Quick link to live storefront */}
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-sky-500/50 hover:bg-slate-800 transition group",
              collapsed && "justify-center px-0"
            )}
            title="View Live Storefront"
          >
            <ExternalLink className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            {!collapsed && (
              <span className="truncate flex-1">View Storefront</span>
            )}
          </Link>

          {/* Dynamic Authenticated User Status Bar */}
          <div
            className={cn(
              "flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800",
              collapsed && "justify-center"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-800"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800">
                    {getInitials(user?.name)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email || "admin@shopora.com"}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
