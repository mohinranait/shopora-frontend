"use client";

import React from "react";
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
  Bell,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
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
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
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
      },
      {
        label: "Pending Review",
        href: "/admin/products?filter=pending",
        icon: Clock,
        badge: "Review",
        badgeVariant: "warning",
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

export interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({  onMobileClose }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const { toggleSidebar,  isMobile, setOpenMobile } = useSidebar();
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

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
      onMobileClose?.();
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="admin-sidebar border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none"
    >
      {/* Brand Header */}
      <SidebarHeader className="p-0 border-b border-sidebar-border">
        <div className="h-15.75 flex items-center justify-between px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 transition-all duration-200">
          {/* Expanded Brand View */}
          <Link
            href="/admin/dashboard"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 overflow-hidden min-w-0 group-data-[collapsible=icon]:hidden"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-linear-to-br from-brand to-brand-deep flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-sidebar-foreground truncate">
                  Shopora
                </span>
                <span className="rounded bg-sky-500/15 text-sky-500 dark:text-sky-400 text-[10px] font-bold px-1.5 py-0.2 border border-sky-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground truncate">
                Admin Command Center
              </span>
            </div>
          </Link>

          {/* Desktop Collapse Trigger (Expanded state) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex h-7 w-7 rounded-lg items-center justify-center text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition border border-sidebar-border shrink-0 cursor-pointer group-data-[collapsible=icon]:hidden"
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
                  className="hidden group-data-[collapsible=icon]:flex items-center justify-center h-10 w-10 rounded-xl bg-linear-to-br from-brand to-brand-deep text-white hover:ring-2 hover:ring-brand/50 transition cursor-pointer relative group/collapse-btn"
                />
              }
            >
              <Sparkles className="h-5 w-5 transition group-hover/collapse-btn:scale-110" />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-muted-foreground group-hover/collapse-btn:text-sidebar-foreground">
                <ChevronRight className="h-2.5 w-2.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right">
              Expand Sidebar
            </TooltipContent>
          </Tooltip>
        </div>
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
                  item.href === "/admin/dashboard"
                    ? pathname === "/admin/dashboard" || pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={`${section.title}-${item.label}`}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                        />
                      }
                      isActive={isActive}
                      tooltip={`${item.label}${item.badge !== undefined ? ` (${item.badge})` : ""}`}
                      className={cn(
                        "h-9 px-3 text-xs font-semibold rounded-lg transition-all relative group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto",
                        isActive
                          ? "bg-linear-to-r from-brand to-brand-deep text-white font-bold "
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
                      {item.badge !== undefined && (
                        <Badge
                          variant={item.badgeVariant || "secondary"}
                          className="ml-auto text-[10px] px-1.5 py-0 h-4 font-bold shrink-0 group-data-[collapsible=icon]:hidden"
                        >
                          {item.badge}
                        </Badge>
                      )}

                      {/* Collapsed Mode Dot Badge */}
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "hidden group-data-[collapsible=icon]:block absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-sidebar",
                            item.badgeVariant === "destructive"
                              ? "bg-rose-500 animate-pulse"
                              : item.badgeVariant === "success"
                              ? "bg-emerald-400"
                              : "bg-sky-400 animate-pulse"
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
      </SidebarContent>

      {/* Footer Actions */}
      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:space-y-2">
        {/* Quick link to live storefront */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-xs font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground hover:border-brand/50 hover:bg-sidebar-accent transition group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto"
              />
            }
          >
            <ExternalLink className="h-3.5 w-3.5 text-brand shrink-0" />
            <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">
              View Storefront
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">
            View Live Storefront
          </TooltipContent>
        </Tooltip>

        {/* Dynamic Authenticated User Status Bar */}
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
                  <div className="h-8 w-8 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-sidebar-border">
                    {getInitials(user?.name)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-bold text-sidebar-foreground truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email || "admin@shopora.com"}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="font-semibold text-xs">{user?.name || "Administrator"}</div>
              <div className="text-[10px] text-muted-foreground">{user?.email || "admin@shopora.com"}</div>
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
