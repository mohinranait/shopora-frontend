"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Heart,
  MapPin,
  ChevronRight,
  ExternalLink,
  Flame,
  LayoutGrid,
  Truck,
  Sparkles,
} from "lucide-react";
import type { IOrder, IAuthUser } from "@/types";
import { formatTaka } from "@/components/cart/CartParts";
import { OrderStatusBadge } from "@/components/orders/OrderDetailView";
import { formatDate } from "@/components/orders/orderStatus";
import { useGetUserAddressesQuery, useGetUserWishlistQuery } from "@/redux";

interface OverviewTabProps {
  user: IAuthUser;
  orders: IOrder[];
  loadingOrders: boolean;
  setActiveTab: (tab: string) => void;
}

export function OverviewTab({
  user,
  orders,
  loadingOrders,
  setActiveTab,
}: OverviewTabProps) {
  const { data: addresses = [] } = useGetUserAddressesQuery();
  const { data: wishlist = [] } = useGetUserWishlistQuery();

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Quick Welcome Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-deep">
              <Sparkles className="h-4 w-4 text-brand" />
              Welcome back, {user.name.split(" ")[0]}!
            </span>
            <p className="text-xs text-slate-600 max-w-xl">
              Track your deliveries, manage verified addresses, explore your favorite wishlists, and see payment records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand transition cursor-pointer"
            >
              <Package className="h-4 w-4" />
              <span>Orders Tab</span>
            </button>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              title="Open full orders page"
            >
              <span>/orders page</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders + Quick Sidebar Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: Recent Orders (2 cols) */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-brand" />
              <h3 className="text-sm font-bold text-slate-900">
                Recent Orders
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep cursor-pointer"
            >
              <span>View All in Orders</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {loadingOrders ? (
              <div className="space-y-2.5">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-md bg-slate-50 border border-slate-100"
                  />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setActiveTab("orders")}
                  className="group block rounded-md border border-slate-200 p-3.5 transition hover:border-brand/40 hover:bg-sky-50/20 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-slate-900 group-hover:text-brand transition">
                        {order.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(order.createdAt)} · {order.itemCount} items
                      </p>
                    </div>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Payment: <span className="font-semibold text-slate-700">{order.paymentMethod}</span> ({order.paymentStatus})
                    </span>
                    <span className="font-bold tabular-nums text-slate-900">
                      {formatTaka(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs font-semibold text-slate-700">No orders found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Explore our marketplace to place your first order.</p>
                <Link
                  href="/products"
                  className="mt-3 inline-block rounded-md bg-brand-deep px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand transition"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Address & Wishlist & Shortcuts (1 col) */}
        <div className="space-y-4">
          {/* Default Address Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand" /> Default Address
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="mt-2.5 text-xs text-slate-600">
              {defaultAddress ? (
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900">{defaultAddress.fullName}</p>
                  <p className="text-slate-500 text-[11px]">{defaultAddress.phone}</p>
                  <p className="text-slate-700">{defaultAddress.streetAddress}, {defaultAddress.city}</p>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">
                  No delivery address saved yet.
                </p>
              )}
            </div>
          </div>

          {/* Quick Wishlist Preview */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500" /> Wishlist ({wishlist.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("favorite")}
                className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="mt-2.5">
              {wishlist.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {wishlist.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.product?.slug || ""}`}
                      className="h-11 w-11 shrink-0 rounded-md border border-slate-200 bg-slate-50 p-1 overflow-hidden hover:border-brand transition"
                    >
                      {item.product?.mainImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.mainImage}
                          alt={item.product.name}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">
                  Your wishlist is currently empty.
                </p>
              )}
            </div>
          </div>

          {/* Shopping Shortcuts */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <Link
                href="/products"
                className="flex items-center gap-1.5 rounded-md bg-white border border-slate-200 p-2 font-medium text-slate-700 hover:border-brand hover:text-brand transition"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-brand" />
                <span>Catalog</span>
              </Link>
              <Link
                href="/products?sort=hot"
                className="flex items-center gap-1.5 rounded-md bg-white border border-slate-200 p-2 font-medium text-slate-700 hover:border-rose-400 hover:text-rose-600 transition"
              >
                <Flame className="h-3.5 w-3.5 text-rose-500" />
                <span>Hot Deals</span>
              </Link>
              <Link
                href="/track-order"
                className="col-span-2 flex items-center justify-between rounded-md bg-white border border-slate-200 p-2 font-medium text-slate-700 hover:border-sky-400 hover:text-brand-deep transition"
              >
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-sky-500" />
                  <span>Track Guest Order</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
