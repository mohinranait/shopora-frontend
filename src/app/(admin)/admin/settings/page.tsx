"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  Percent,
  Phone,
  RefreshCw,
  Save,
  Search,
  Share2,
  Sliders,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
} from "@/redux";
import type { IWebsiteSettings } from "@/types";

type SettingTab =
  | "general"
  | "shipping"
  | "payment"
  | "vendors"
  | "seo"
  | "social"
  | "notifications";

interface TabItem {
  id: SettingTab;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: "general",
    label: "General & Brand",
    description: "Store name, branding, contact details & maintenance",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: "shipping",
    label: "Shipping & Delivery",
    description: "Delivery fees, free delivery threshold & estimates",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    id: "payment",
    label: "Payment & Checkout",
    description: "bKash, Nagad, COD, tax rates & guest checkout",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: "vendors",
    label: "Vendors & Commission",
    description: "Commission rates, payout threshold & approvals",
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: "seo",
    label: "SEO & Analytics",
    description: "Google tags, Meta Pixel, search engine metadata",
    icon: <Search className="h-4 w-4" />,
  },
  {
    id: "social",
    label: "Social Networks",
    description: "Social media profiles and customer touchpoints",
    icon: <Share2 className="h-4 w-4" />,
  },
  {
    id: "notifications",
    label: "Alerts & Inventory",
    description: "Low-stock trigger and system administrator notices",
    icon: <Bell className="h-4 w-4" />,
  },
];

function SettingToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-slate-700">
      <div className="pr-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
          checked ? "bg-brand" : "bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsFormContent({
  initialSettings,
  onSaved,
}: {
  initialSettings: IWebsiteSettings;
  onSaved: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SettingTab>("general");
  const [formData, setFormData] = useState<IWebsiteSettings>(initialSettings);
  const [updateSettings, { isLoading: isSaving }] = useUpdateWebsiteSettingsMutation();

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialSettings);
  }, [formData, initialSettings]);

  const handleChange = (
    key: keyof IWebsiteSettings,
    val: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleReset = () => {
    setFormData(initialSettings);
    toast.info("Settings reverted to saved values");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success("Website settings updated successfully");
      onSaved();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to save settings";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Action & Status Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-brand ring-1 ring-brand/30">
            <Sliders className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">System Configuration</h2>
              {formData.is_maintenance_mode ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20">
                  <Wrench className="h-3 w-3" />
                  Maintenance Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Live Store
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isDirty ? (
                <span className="text-amber-400 font-medium">● Unsaved changes detected</span>
              ) : (
                "All settings are synchronized with database"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Reset
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2 text-xs font-bold text-white transition hover:bg-brand shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tabs / Right Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navigation Tabs (Sidebar style on lg screens) */}
        <div className="lg:col-span-1 space-y-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-sm">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                    isActive
                      ? "bg-brand/15 text-white ring-1 ring-brand/40 shadow-xs"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <span
                    className={`mt-0.5 rounded-lg p-1.5 transition ${
                      isActive ? "bg-brand text-white shadow-xs" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <div>
                    <p className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                      {tab.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 leading-tight">
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick info card */}
          <div className="hidden lg:block rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">💡 Quick Tip</p>
            <p className="mt-1 leading-relaxed">
              Changes applied here immediately impact storefront checkout calculations, commission earnings, and meta tags.
            </p>
          </div>
        </div>

        {/* Tab Content Panels (Right 3 Columns) */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            {/* 1. GENERAL & BRAND TAB */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">General Store Information</h3>
                  <p className="text-xs text-slate-400">
                    Basic identity, logos, support contact channels, and maintenance mode status.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Store Brand Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.site_name || ""}
                      onChange={(e) => handleChange("site_name", e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="e.g. Shopora"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Store Slogan / Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.site_tagline || ""}
                      onChange={(e) => handleChange("site_tagline", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="e.g. Premier Hybrid Multi-Vendor E-Commerce Platform"
                    />
                  </div>
                </div>

                {/* Logo & Favicon URLs with preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Main Logo URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.site_logo || ""}
                        onChange={(e) => handleChange("site_logo", e.target.value)}
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                        placeholder="/logo.png or https://..."
                      />
                      {formData.site_logo && (
                        <div className="flex h-10 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1">
                          <img
                            src={formData.site_logo}
                            alt="Logo preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Favicon URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.site_favicon || ""}
                        onChange={(e) => handleChange("site_favicon", e.target.value)}
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                        placeholder="/favicon.ico"
                      />
                      {formData.site_favicon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1">
                          <img
                            src={formData.site_favicon}
                            alt="Favicon"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Support Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="email"
                        value={formData.contact_email || ""}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                        placeholder="support@shopora.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Support Hotline Number
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={formData.contact_phone || ""}
                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                        placeholder="+880 9612-345678"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Physical Office Address
                  </label>
                  <input
                    type="text"
                    value={formData.contact_address || ""}
                    onChange={(e) => handleChange("contact_address", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="House 42, Road 11, Banani, Dhaka-1213, Bangladesh"
                  />
                </div>

                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <SettingToggle
                    label="Enable Maintenance Mode"
                    description="When activated, public customers will see a temporary maintenance notice banner while admins retain full access."
                    checked={Boolean(formData.is_maintenance_mode)}
                    onChange={(val) => handleChange("is_maintenance_mode", val)}
                  />

                  {formData.is_maintenance_mode && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-amber-400">
                        Maintenance Banner Message
                      </label>
                      <textarea
                        rows={2}
                        value={formData.maintenance_message || ""}
                        onChange={(e) => handleChange("maintenance_message", e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-slate-800/80 p-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-400"
                        placeholder="Maintenance notification announcement..."
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. SHIPPING & LOGISTICS TAB */}
            {activeTab === "shipping" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Shipping &amp; Delivery Logistics</h3>
                  <p className="text-xs text-slate-400">
                    Set delivery charges for inside/outside Dhaka, free shipping qualification thresholds, and transit times.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Standard Delivery Fee (Inside Metro)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.shipping_fee_standard ?? 70}
                        onChange={(e) => handleChange("shipping_fee_standard", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Charged on regular deliveries in Dhaka</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Nationwide Delivery Fee (Outside Metro)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.shipping_fee_express ?? 130}
                        onChange={(e) => handleChange("shipping_fee_express", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Applicable for inter-district couriers</p>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Free Shipping Cart Subtotal Threshold
                  </label>
                  <div className="relative max-w-sm">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                      ৳
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={formData.free_shipping_threshold ?? 1500}
                      onChange={(e) => handleChange("free_shipping_threshold", Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-8 pr-3 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Orders with subtotal equal or exceeding this amount automatically receive 100% free delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Estimated Delivery (Metro)
                    </label>
                    <input
                      type="text"
                      value={formData.estimated_delivery_metro || ""}
                      onChange={(e) => handleChange("estimated_delivery_metro", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="e.g. 2-3 Business Days"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Estimated Delivery (Nationwide)
                    </label>
                    <input
                      type="text"
                      value={formData.estimated_delivery_national || ""}
                      onChange={(e) => handleChange("estimated_delivery_national", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="e.g. 4-6 Business Days"
                    />
                  </div>
                </div>

                <SettingToggle
                  label="Display Free Delivery Promotion in Cart"
                  description="Shows a dynamic progress bar in the shopping cart and checkout indicating how much more to spend for free shipping."
                  checked={Boolean(formData.enable_free_shipping_promo)}
                  onChange={(val) => handleChange("enable_free_shipping_promo", val)}
                />
              </div>
            )}

            {/* 3. PAYMENT & CHECKOUT TAB */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Payment Options &amp; Checkout Rules</h3>
                  <p className="text-xs text-slate-400">
                    Configure payment methods, mobile financial services (MFS) merchant details, and guest checkout options.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Store Currency Code
                    </label>
                    <input
                      type="text"
                      value={formData.currency || "BDT"}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.currency_symbol || "৳"}
                      onChange={(e) => handleChange("currency_symbol", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Checkout VAT / Tax Rate (%)
                    </label>
                    <div className="relative">
                      <Percent className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.vat_percentage ?? 0}
                        onChange={(e) => handleChange("vat_percentage", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-3 pr-8 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>
                </div>

                <SettingToggle
                  label="Allow Guest Checkout without Registration"
                  description="Permits customers to place orders using their phone number without mandating an account password upfront."
                  checked={Boolean(formData.allow_guest_checkout)}
                  onChange={(val) => handleChange("allow_guest_checkout", val)}
                />

                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment Gateway Channels
                  </h4>

                  <SettingToggle
                    label="Cash on Delivery (COD)"
                    description="Customers pay in cash when the delivery agent delivers the parcel."
                    checked={Boolean(formData.enable_cod)}
                    onChange={(val) => handleChange("enable_cod", val)}
                  />

                  {/* bKash */}
                  <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-pink-400">bKash Payment</p>
                        <p className="text-xs text-slate-400">Accept direct bKash mobile payments</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChange("enable_bkash", !formData.enable_bkash)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          formData.enable_bkash ? "bg-pink-600" : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            formData.enable_bkash ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {formData.enable_bkash && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-300">
                          bKash Merchant / Agent Number
                        </label>
                        <input
                          type="text"
                          value={formData.bkash_merchant_number || ""}
                          onChange={(e) => handleChange("bkash_merchant_number", e.target.value)}
                          className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-pink-500"
                          placeholder="017XXXXXXXX"
                        />
                      </div>
                    )}
                  </div>

                  {/* Nagad */}
                  <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-orange-400">Nagad Payment</p>
                        <p className="text-xs text-slate-400">Accept direct Nagad mobile payments</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChange("enable_nagad", !formData.enable_nagad)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          formData.enable_nagad ? "bg-orange-600" : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            formData.enable_nagad ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {formData.enable_nagad && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-300">
                          Nagad Merchant / Agent Number
                        </label>
                        <input
                          type="text"
                          value={formData.nagad_merchant_number || ""}
                          onChange={(e) => handleChange("nagad_merchant_number", e.target.value)}
                          className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-orange-500"
                          placeholder="018XXXXXXXX"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. VENDORS & COMMISSION TAB */}
            {activeTab === "vendors" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Vendor Marketplace &amp; Commission</h3>
                  <p className="text-xs text-slate-400">
                    Platform commission percentages, seller payout limits, and product publishing moderation rules.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Default Platform Commission (%)
                    </label>
                    <div className="relative">
                      <Percent className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={formData.default_commission_rate ?? 10}
                        onChange={(e) => handleChange("default_commission_rate", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Percentage retained by the platform on third-party vendor orders.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Minimum Payout / Withdrawal Threshold
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="100"
                        value={formData.min_payout_threshold ?? 1000}
                        onChange={(e) => handleChange("min_payout_threshold", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 pl-8 pr-3 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Minimum wallet balance a vendor must hold before requesting a disbursement.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-5">
                  <SettingToggle
                    label="Automatically Approve New Vendor Registrations"
                    description="If disabled, new vendor accounts remain in pending state until reviewed and approved by administrators."
                    checked={Boolean(formData.auto_approve_sellers)}
                    onChange={(val) => handleChange("auto_approve_sellers", val)}
                  />

                  <SettingToggle
                    label="Automatically Publish Vendor Products"
                    description="If disabled, new products submitted by marketplace vendors require approval before appearing on the public catalog."
                    checked={Boolean(formData.auto_approve_products)}
                    onChange={(val) => handleChange("auto_approve_products", val)}
                  />
                </div>
              </div>
            )}

            {/* 5. SEO & ANALYTICS TAB */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Search Engine Optimization &amp; Tracking</h3>
                  <p className="text-xs text-slate-400">
                    Google search preview titles, meta descriptions, Google Analytics 4, and Meta Pixel tags.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Default Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title || ""}
                    onChange={(e) => handleChange("meta_title", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="Shopora - Online Shopping in Bangladesh"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.meta_description || ""}
                    onChange={(e) => handleChange("meta_description", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-800/80 p-3 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="Brief description for search engines..."
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Meta Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords || ""}
                    onChange={(e) => handleChange("meta_keywords", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="ecommerce, online shopping, bangladesh, gadgets"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Google Analytics 4 Measurement ID
                    </label>
                    <input
                      type="text"
                      value={formData.google_analytics_id || ""}
                      onChange={(e) => handleChange("google_analytics_id", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand font-mono"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Meta (Facebook) Pixel ID
                    </label>
                    <input
                      type="text"
                      value={formData.facebook_pixel_id || ""}
                      onChange={(e) => handleChange("facebook_pixel_id", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand font-mono"
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. SOCIAL NETWORKS TAB */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Social Media Profile Links</h3>
                  <p className="text-xs text-slate-400">
                    Connect official social channels displayed on the website footer and customer communications.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={formData.social_facebook || ""}
                      onChange={(e) => handleChange("social_facebook", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="https://facebook.com/shopora.bd"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.social_instagram || ""}
                      onChange={(e) => handleChange("social_instagram", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="https://instagram.com/shopora.bd"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      value={formData.social_youtube || ""}
                      onChange={(e) => handleChange("social_youtube", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="https://youtube.com/@shopora"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      X (Twitter) Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.social_twitter || ""}
                      onChange={(e) => handleChange("social_twitter", e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="https://x.com/shoporabd"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. ALERTS & INVENTORY TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Inventory Warnings &amp; Administrator Alerts</h3>
                  <p className="text-xs text-slate-400">
                    Automated warnings when stock dips below critical levels and order notification preferences.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Low Stock Alert Threshold (Units)
                  </label>
                  <div className="max-w-xs">
                    <input
                      type="number"
                      min="1"
                      value={formData.low_stock_threshold ?? 5}
                      onChange={(e) => handleChange("low_stock_threshold", Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Products with stock equal to or less than this value will be highlighted with a low stock badge in the admin panel.
                  </p>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-5">
                  <SettingToggle
                    label="Send Notification on New Customer Orders"
                    description="Broadcast an instant notification to store administrators whenever an order is placed."
                    checked={Boolean(formData.notify_admin_on_order)}
                    onChange={(val) => handleChange("notify_admin_on_order", val)}
                  />

                  <SettingToggle
                    label="Send Notification on New Merchant Applications"
                    description="Alert administrative team when a business applies for a vendor account."
                    checked={Boolean(formData.notify_admin_on_seller_signup)}
                    onChange={(val) => handleChange("notify_admin_on_seller_signup", val)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

export default function AdminSettingsPage() {
  const { data, isLoading, isError, refetch } = useGetWebsiteSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Store Settings
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Control brand identity, delivery rules, payment accounts, commission rates, and SEO tags.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Settings</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading website configurations…</p>
        </div>
      ) : isError || !data ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <h2 className="text-base font-bold text-white">Failed to Load Settings</h2>
          <p className="mt-1 text-xs text-slate-400">
            Could not retrieve settings from the database. Please verify your connection.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      ) : (
        /* Form component keyed by stringified data to initialize state purely without set-state-in-effect */
        <SettingsFormContent
          key={JSON.stringify(data)}
          initialSettings={data}
          onSaved={() => void refetch()}
        />
      )}
    </div>
  );
}
