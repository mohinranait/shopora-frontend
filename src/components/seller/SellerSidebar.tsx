"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  Settings,
  ExternalLink,
  LogOut,
  Palmtree,
  ShieldCheck,
  PlusCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Store,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useGetSellerDashboardStatsQuery, useGetUnreadNotificationCountQuery } from "@/redux";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeVariant?: "brand" | "warning" | "destructive" | "success" | "secondary";
  target?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function SellerSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();

  const { data: dashboardData } = useGetSellerDashboardStatsQuery();
  const { data: unreadData } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 30000,
  });

  const unreadCount = unreadData?.unreadCount ?? 0;
  const profile = dashboardData?.profile;
  const metrics = dashboardData?.metrics;

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = () => {
    toast.success("Signed out successfully.");
    logout();
  };

  const getInitials = (name?: string) => {
    if (!name) return "SC";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navSections: NavSection[] = [
    {
      title: "Store Operations",
      items: [
        {
          label: "Dashboard",
          href: "/seller/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "My Products",
          href: "/seller/products",
          icon: Package,
          badge: metrics?.totalProducts ?? null,
          badgeVariant: "secondary",
        },
        {
          label: "Orders & Shipping",
          href: "/seller/orders",
          icon: ShoppingBag,
          badge: metrics?.pendingOrders ? `${metrics.pendingOrders} pending` : null,
          badgeVariant: metrics?.pendingOrders ? "warning" : "secondary",
        },
        {
          label: "Wallet & Escrow",
          href: "/seller/wallet",
          icon: Wallet,
        },
        {
          label: "Notifications",
          href: "/seller/notifications",
          icon: Bell,
          badge: unreadCount > 0 ? `${unreadCount} new` : null,
          badgeVariant: "destructive",
        },
      ],
    },
    {
      title: "Store Management",
      items: [
        {
          label: "Store Settings",
          href: "/seller/settings",
          icon: Settings,
          badge: profile?.isHolidayMode ? "Vacation" : null,
          badgeVariant: "warning",
        },
        ...(profile?.storeSlug
          ? [
              {
                label: "View Public Store",
                href: `/stores/${profile.storeSlug}`,
                icon: ExternalLink,
                target: "_blank",
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200"
    >
      {/* Sidebar Header with Store Identity */}
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2 min-h-11">
          {/* Expanded Store Identity */}
          <Link
            href="/seller/dashboard"
            onClick={handleNavClick}
            className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:hidden select-none"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 ring-2 ring-brand/20">
              {profile?.storeName ? profile.storeName[0].toUpperCase() : "S"}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-sidebar-foreground truncate leading-tight">
                {profile?.storeName || user?.name || "Seller Central"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                  {profile?.status === "APPROVED"
                    ? "Verified Partner"
                    : profile?.status === "PENDING"
                    ? "Pending Review"
                    : "Merchant"}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Collapse Trigger */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition group-data-[collapsible=icon]:hidden cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Collapsed Brand Icon & Trigger (Centered, with hover tooltip) */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="hidden group-data-[collapsible=icon]:flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-brand-deep text-white shadow-md hover:ring-2 hover:ring-brand/50 transition cursor-pointer relative group/collapse-btn mx-auto"
                />
              }
            >
              <Store className="h-5 w-5 transition group-hover/collapse-btn:scale-110" />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-muted-foreground group-hover/collapse-btn:text-sidebar-foreground shadow-xs">
                <ChevronRight className="h-2.5 w-2.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right">
              Expand Sidebar
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Holiday Mode Alert in Expanded Header */}
        {profile?.isHolidayMode && (
          <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Palmtree className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate font-medium">Store is in Vacation Mode</span>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation Sections */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <SidebarGroup key={section.title} className="p-0">
            {/* Expanded Section Title */}
            <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 group-data-[collapsible=icon]:hidden">
              {section.title}
            </SidebarGroupLabel>

            {/* Collapsed Section Divider */}
            {idx > 0 && (
              <div className="hidden group-data-[collapsible=icon]:block my-2 border-t border-sidebar-border mx-2" />
            )}

            <SidebarMenu className="gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/seller/dashboard"
                    ? pathname === "/seller/dashboard" || pathname === "/seller"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={`${section.title}-${item.label}`}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          target={item.target}
                          onClick={handleNavClick}
                        />
                      }
                      isActive={isActive}
                      tooltip={`${item.label}${item.badge !== null && item.badge !== undefined ? ` (${item.badge})` : ""}`}
                      className={cn(
                        "h-9 px-3 text-xs font-semibold rounded-lg transition-all relative group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto",
                        isActive
                          ? "bg-gradient-to-r from-brand to-brand-deep text-white font-bold shadow-xs"
                          : "text-sidebar-foreground/75 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-sidebar-foreground/70 group-hover/menu-button:text-brand"
                        )}
                      />
                      <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>

                      {/* Expanded Mode Badge */}
                      {item.badge !== null && item.badge !== undefined && (
                        <Badge
                          variant={item.badgeVariant || "secondary"}
                          className="ml-auto text-[10px] px-1.5 py-0 h-4 font-bold shrink-0 group-data-[collapsible=icon]:hidden"
                        >
                          {item.badge}
                        </Badge>
                      )}

                      {/* Collapsed Mode Dot Badge */}
                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          className={cn(
                            "hidden group-data-[collapsible=icon]:block absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-sidebar",
                            item.badgeVariant === "destructive"
                              ? "bg-rose-500 animate-pulse"
                              : item.badgeVariant === "warning"
                              ? "bg-amber-400"
                              : "bg-sky-400"
                          )}
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        {/* Quick Add Product Button */}
        <div className="pt-2 px-1 group-data-[collapsible=icon]:px-0">
          <Link
            href="/seller/products/new"
            onClick={handleNavClick}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto"
            title="Add New Product"
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            <span className="truncate group-data-[collapsible=icon]:hidden">Add New Product</span>
          </Link>
        </div>
      </SidebarContent>

      {/* Footer Actions */}
      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:space-y-2">
        {/* Quick link to live storefront */}
        {profile?.storeSlug && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={`/stores/${profile.storeSlug}`}
                  target="_blank"
                  className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-xs font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground hover:border-brand/50 hover:bg-sidebar-accent transition group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto"
                />
              }
            >
              <ExternalLink className="h-3.5 w-3.5 text-brand shrink-0" />
              <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">
                View Public Store
              </span>
            </TooltipTrigger>
            <TooltipContent side="right">
              View Public Storefront
            </TooltipContent>
          </Tooltip>
        )}

        {/* Dynamic Authenticated Seller Status Bar */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-sidebar-accent/40 border border-sidebar-border group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:justify-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" />
              }
            >
              <div className="relative shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-sidebar-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-sidebar-border">
                    {getInitials(user?.name || profile?.storeName)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-bold text-sidebar-foreground truncate">
                  {user?.name || profile?.storeName || "Seller Partner"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email || "seller@shopora.com"}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="font-semibold text-xs">{user?.name || profile?.storeName || "Seller"}</div>
              <div className="text-[10px] text-muted-foreground">{user?.email || "seller@shopora.com"}</div>
            </TooltipContent>
          </Tooltip>

          {/* Logout action */}
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-md hover:bg-sidebar-accent transition group-data-[collapsible=icon]:hidden cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
