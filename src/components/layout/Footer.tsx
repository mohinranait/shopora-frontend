"use client";

import React from "react";
import { useGetWebsiteSettingsQuery } from "@/redux";
import { useIsClient } from "@/hooks/useIsClient";
import Link from "next/link";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from "lucide-react";

export const Footer: React.FC = () => {
  const isClient = useIsClient();
  const { data: settings } = useGetWebsiteSettingsQuery(undefined, { skip: !isClient });
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Trust Badges Bar */}
      <div className="border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-brand">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Nationwide Delivery</h4>
                <p className="text-xs text-slate-400">Fast 48h shipping across 64 districts</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">100% Genuine</h4>
                <p className="text-xs text-slate-400">Direct from certified sellers</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <RotateCcw className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">7 Days Return</h4>
                <p className="text-xs text-slate-400">Hassle-free replacement policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Headphones className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Dedicated Support</h4>
                <p className="text-xs text-slate-400">Help available 7 days a week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              {settings?.site_logo && settings.site_logo !== "/logo.png" ? (
                <img
                  src={settings.site_logo}
                  alt={settings?.site_name || "Shopora"}
                  className="h-9 max-w-[140px] object-contain"
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-brand-deep flex items-center justify-center text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              )}
              <span className="text-2xl font-black text-white tracking-tight">
                {settings?.site_name || "Shopora"}<span className="text-brand">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Bangladesh&#39;s premier Hybrid Multi-Vendor E-Commerce platform. Connecting customers
              with top brands and verified independent merchants with guaranteed quality and swift delivery.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand" />
                <span>Helpline: <strong className="text-white" suppressHydrationWarning>{settings?.contact_phone || "09648-500500"}</strong> (9 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand" />
                <span>Email: {settings?.contact_email || "support@shopora.com.bd"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand" />
                <span>{settings?.contact_address || "Gulshan-1, Dhaka-1212, Bangladesh"}</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/products?category=smartwatches" className="hover:text-brand transition">
                  Smartwatches & Straps
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio" className="hover:text-brand transition">
                  TWS Earbuds & Speakers
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion" className="hover:text-brand transition">
                  Men & Women Fashion
                </Link>
              </li>
              <li>
                <Link href="/products?category=computer" className="hover:text-brand transition">
                  Computer & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/products?category=powerbank" className="hover:text-brand transition">
                  Power Banks & Chargers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/track-order" className="hover:text-brand transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-brand transition">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-info" className="hover:text-brand transition">
                  Delivery & Shipping Rates
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand transition">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand transition">
                  Privacy & Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers & Vendors */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Seller & Business
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/seller/register" className="text-brand hover:underline font-semibold">
                  Be a Vendor on Shopora
                </Link>
              </li>
              <li>
                <Link href="/seller/login" className="hover:text-brand transition">
                  Seller Portal Login
                </Link>
              </li>
              <li>
                <Link href="/vendor-rules" className="hover:text-brand transition">
                  Commission & Payout Policy
                </Link>
              </li>
              <li>
                <Link href="/seller/fulfillment" className="hover:text-brand transition">
                  Fulfillment by Shopora
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p suppressHydrationWarning>© 2026 {settings?.site_name || "Shopora"} Multi-Vendor Platform. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-400">Secured Payments:</span>
            <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">bKash</span>
            <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">Nagad</span>
            <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">Visa / Master</span>
            <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
