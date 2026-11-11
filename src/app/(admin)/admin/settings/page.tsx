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
import { ImageUploadField } from "@/components/media/ImageUploadField";
import {
  useGetWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
} from "@/redux";
import type { IWebsiteSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 transition hover:border-border/80">
      <div className="pr-4 space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
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
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-brand ring-1 ring-brand/30">
              <Sliders className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">System Configuration</h2>
                {formData.is_maintenance_mode ? (
                  <Badge variant="outline" className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-400">
                    <Wrench className="h-3 w-3" />
                    Maintenance Mode
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Live Store
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="border-border bg-card text-foreground hover:bg-muted"
              >
                Reset
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !isDirty}
              className="gap-2 bg-brand-deep font-bold text-white hover:bg-brand"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Left Tabs / Right Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navigation Tabs (Sidebar style on lg screens) */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="border-border bg-card p-2">
            <div className="space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
 isActive
 ? "bg-brand/15 text-white ring-1 ring-brand/40 "
 : "text-muted-foreground hover:bg-muted hover:text-foreground"
 }`}
                  >
                    <span
                      className={`mt-0.5 rounded-lg p-1.5 transition ${
 isActive ? "bg-brand text-white " : "bg-muted text-muted-foreground border border-border"
 }`}
                    >
                      {tab.icon}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${isActive ? "text-white" : "text-foreground"}`}>
                        {tab.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick info card */}
          <Card className="hidden lg:block border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">💡 Quick Tip</p>
            <p className="mt-1 leading-relaxed">
              Changes applied here immediately impact storefront checkout calculations, commission earnings, and meta tags.
            </p>
          </Card>
        </div>

        {/* Tab Content Panels (Right 3 Columns) */}
        <div className="lg:col-span-3">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              {/* 1. GENERAL & BRAND TAB */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">General Store Information</h3>
                    <p className="text-xs text-muted-foreground">
                      Basic identity, logos, support contact channels, and maintenance mode status.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="site_name" className="text-xs font-semibold text-foreground">
                        Store Brand Name <span className="text-rose-400">*</span>
                      </Label>
                      <Input
                        id="site_name"
                        type="text"
                        value={formData.site_name || ""}
                        onChange={(e) => handleChange("site_name", e.target.value)}
                        required
                        placeholder="e.g. Shopora"
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="site_tagline" className="text-xs font-semibold text-foreground">
                        Store Slogan / Tagline
                      </Label>
                      <Input
                        id="site_tagline"
                        type="text"
                        value={formData.site_tagline || ""}
                        onChange={(e) => handleChange("site_tagline", e.target.value)}
                        placeholder="e.g. Premier Hybrid Multi-Vendor E-Commerce Platform"
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>
                  </div>

                  {/* Logo & Favicon Media Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploadField
                      label="Store Brand Logo"
                      value={formData.site_logo ? { url: formData.site_logo } : null}
                      onChange={(val) => handleChange("site_logo", val ? val.url : "")}
                      helperText="Select or upload primary logo from Media Library (PNG/SVG recommended)"
                      modalTitle="Select Brand Logo Asset"
                    />

                    <ImageUploadField
                      label="Browser Favicon"
                      value={formData.site_favicon ? { url: formData.site_favicon } : null}
                      onChange={(val) => handleChange("site_favicon", val ? val.url : "")}
                      helperText="Select or upload 32x32 or 64x64 browser tab icon"
                      modalTitle="Select Favicon Asset"
                    />
                  </div>

                  {/* Contact channels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact_email" className="text-xs font-semibold text-foreground">
                        Support Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email || ""}
                          onChange={(e) => handleChange("contact_email", e.target.value)}
                          placeholder="support@shopora.com"
                          className="border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact_phone" className="text-xs font-semibold text-foreground">
                        Support Hotline Number
                      </Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="contact_phone"
                          type="text"
                          value={formData.contact_phone || ""}
                          onChange={(e) => handleChange("contact_phone", e.target.value)}
                          placeholder="+880 9612-345678"
                          className="border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact_address" className="text-xs font-semibold text-foreground">
                      Physical Office Address
                    </Label>
                    <Input
                      id="contact_address"
                      type="text"
                      value={formData.contact_address || ""}
                      onChange={(e) => handleChange("contact_address", e.target.value)}
                      placeholder="House 42, Road 11, Banani, Dhaka-1213, Bangladesh"
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                    />
                  </div>

                  <div className="border-t border-border pt-5 space-y-4">
                    <SettingToggle
                      label="Enable Maintenance Mode"
                      description="When activated, public customers will see a temporary maintenance notice banner while admins retain full access."
                      checked={Boolean(formData.is_maintenance_mode)}
                      onChange={(val) => handleChange("is_maintenance_mode", val)}
                    />

                    {formData.is_maintenance_mode && (
                      <div className="space-y-1.5">
                        <Label htmlFor="maintenance_message" className="text-xs font-semibold text-amber-400">
                          Maintenance Banner Message
                        </Label>
                        <Textarea
                          id="maintenance_message"
                          rows={2}
                          value={formData.maintenance_message || ""}
                          onChange={(e) => handleChange("maintenance_message", e.target.value)}
                          className="border-amber-500/30 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400"
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
                    <h3 className="text-base font-bold text-foreground">Shipping &amp; Delivery Logistics</h3>
                    <p className="text-xs text-muted-foreground">
                      Set delivery charges for inside/outside Dhaka, free shipping qualification thresholds, and transit times.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="shipping_fee_standard" className="text-xs font-semibold text-foreground">
                        Standard Delivery Fee (Inside Metro)
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ৳
                        </span>
                        <Input
                          id="shipping_fee_standard"
                          type="number"
                          min="0"
                          value={formData.shipping_fee_standard ?? 70}
                          onChange={(e) => handleChange("shipping_fee_standard", Number(e.target.value))}
                          className="pl-8 focus-visible:ring-brand"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Charged on regular deliveries in Dhaka</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="shipping_fee_express" className="text-xs font-semibold text-foreground">
                        Nationwide Delivery Fee (Outside Metro)
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ৳
                        </span>
                        <Input
                          id="shipping_fee_express"
                          type="number"
                          min="0"
                          value={formData.shipping_fee_express ?? 130}
                          onChange={(e) => handleChange("shipping_fee_express", Number(e.target.value))}
                          className="pl-8 focus-visible:ring-brand"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Applicable for inter-district couriers</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="free_shipping_threshold" className="text-xs font-semibold text-foreground">
                      Free Shipping Cart Subtotal Threshold
                    </Label>
                    <div className="relative max-w-sm">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                        ৳
                      </span>
                      <Input
                        id="free_shipping_threshold"
                        type="number"
                        min="0"
                        value={formData.free_shipping_threshold ?? 1500}
                        onChange={(e) => handleChange("free_shipping_threshold", Number(e.target.value))}
                        className="pl-8 focus-visible:ring-brand"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Orders with subtotal equal or exceeding this amount automatically receive 100% free delivery.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="estimated_delivery_metro" className="text-xs font-semibold text-foreground">
                        Estimated Delivery (Metro)
                      </Label>
                      <Input
                        id="estimated_delivery_metro"
                        type="text"
                        value={formData.estimated_delivery_metro || ""}
                        onChange={(e) => handleChange("estimated_delivery_metro", e.target.value)}
                        placeholder="e.g. 2-3 Business Days"
                        className="focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="estimated_delivery_national" className="text-xs font-semibold text-foreground">
                        Estimated Delivery (Nationwide)
                      </Label>
                      <Input
                        id="estimated_delivery_national"
                        type="text"
                        value={formData.estimated_delivery_national || ""}
                        onChange={(e) => handleChange("estimated_delivery_national", e.target.value)}
                        placeholder="e.g. 4-6 Business Days"
                        className="focus-visible:ring-brand"
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
                    <h3 className="text-base font-bold text-foreground">Payment Options &amp; Checkout Rules</h3>
                    <p className="text-xs text-muted-foreground">
                      Configure payment methods, mobile financial services (MFS) merchant details, and guest checkout options.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="currency" className="text-xs font-semibold text-foreground">
                        Store Currency Code
                      </Label>
                      <Input
                        id="currency"
                        type="text"
                        value={formData.currency || "BDT"}
                        onChange={(e) => handleChange("currency", e.target.value)}
                        className="focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="currency_symbol" className="text-xs font-semibold text-foreground">
                        Currency Symbol
                      </Label>
                      <Input
                        id="currency_symbol"
                        type="text"
                        value={formData.currency_symbol || "৳"}
                        onChange={(e) => handleChange("currency_symbol", e.target.value)}
                        className="focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="vat_percentage" className="text-xs font-semibold text-foreground">
                        Checkout VAT / Tax Rate (%)
                      </Label>
                      <div className="relative">
                        <Percent className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="vat_percentage"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.vat_percentage ?? 0}
                          onChange={(e) => handleChange("vat_percentage", Number(e.target.value))}
                          className="pr-8 focus-visible:ring-brand"
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

                  <div className="border-t border-border pt-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Payment Gateway Channels
                    </h4>

                    <SettingToggle
                      label="Cash on Delivery (COD)"
                      description="Customers pay in cash when the delivery agent delivers the parcel."
                      checked={Boolean(formData.enable_cod)}
                      onChange={(val) => handleChange("enable_cod", val)}
                    />

                    {/* bKash */}
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-pink-400">bKash Payment</p>
                          <p className="text-xs text-muted-foreground">Accept direct bKash mobile payments</p>
                        </div>
                        <Switch
                          checked={Boolean(formData.enable_bkash)}
                          onCheckedChange={(checked) => handleChange("enable_bkash", checked)}
                        />
                      </div>

                      {formData.enable_bkash && (
                        <div className="space-y-1.5">
                          <Label htmlFor="bkash_merchant_number" className="text-xs font-semibold text-foreground">
                            bKash Merchant / Agent Number
                          </Label>
                          <Input
                            id="bkash_merchant_number"
                            type="text"
                            value={formData.bkash_merchant_number || ""}
                            onChange={(e) => handleChange("bkash_merchant_number", e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="max-w-sm border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-pink-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Nagad */}
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-orange-400">Nagad Payment</p>
                          <p className="text-xs text-muted-foreground">Accept direct Nagad mobile payments</p>
                        </div>
                        <Switch
                          checked={Boolean(formData.enable_nagad)}
                          onCheckedChange={(checked) => handleChange("enable_nagad", checked)}
                        />
                      </div>

                      {formData.enable_nagad && (
                        <div className="space-y-1.5">
                          <Label htmlFor="nagad_merchant_number" className="text-xs font-semibold text-foreground">
                            Nagad Merchant / Agent Number
                          </Label>
                          <Input
                            id="nagad_merchant_number"
                            type="text"
                            value={formData.nagad_merchant_number || ""}
                            onChange={(e) => handleChange("nagad_merchant_number", e.target.value)}
                            placeholder="018XXXXXXXX"
                            className="max-w-sm border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-orange-500"
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
                    <h3 className="text-base font-bold text-foreground">Vendor Marketplace &amp; Commission</h3>
                    <p className="text-xs text-muted-foreground">
                      Platform commission percentages, seller payout limits, and product publishing moderation rules.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="default_commission_rate" className="text-xs font-semibold text-foreground">
                        Default Platform Commission (%)
                      </Label>
                      <div className="relative">
                        <Percent className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="default_commission_rate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={formData.default_commission_rate ?? 10}
                          onChange={(e) => handleChange("default_commission_rate", Number(e.target.value))}
                          className="pr-8 focus-visible:ring-brand"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Percentage retained by the platform on third-party vendor orders.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="min_payout_threshold" className="text-xs font-semibold text-foreground">
                        Minimum Payout / Withdrawal Threshold
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ৳
                        </span>
                        <Input
                          id="min_payout_threshold"
                          type="number"
                          min="100"
                          value={formData.min_payout_threshold ?? 1000}
                          onChange={(e) => handleChange("min_payout_threshold", Number(e.target.value))}
                          className="pl-8 focus-visible:ring-brand"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Minimum wallet balance a vendor must hold before requesting a disbursement.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-border pt-5">
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
                    <h3 className="text-base font-bold text-foreground">Search Engine Optimization &amp; Tracking</h3>
                    <p className="text-xs text-muted-foreground">
                      Google search preview titles, meta descriptions, Google Analytics 4, and Meta Pixel tags.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="meta_title" className="text-xs font-semibold text-foreground">
                      Default Meta Title
                    </Label>
                    <Input
                      id="meta_title"
                      type="text"
                      value={formData.meta_title || ""}
                      onChange={(e) => handleChange("meta_title", e.target.value)}
                      placeholder="Shopora - Online Shopping in Bangladesh"
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="meta_description" className="text-xs font-semibold text-foreground">
                      Default Meta Description
                    </Label>
                    <Textarea
                      id="meta_description"
                      rows={3}
                      value={formData.meta_description || ""}
                      onChange={(e) => handleChange("meta_description", e.target.value)}
                      placeholder="Brief description for search engines..."
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="meta_keywords" className="text-xs font-semibold text-foreground">
                      Meta Keywords (comma-separated)
                    </Label>
                    <Input
                      id="meta_keywords"
                      type="text"
                      value={formData.meta_keywords || ""}
                      onChange={(e) => handleChange("meta_keywords", e.target.value)}
                      placeholder="ecommerce, online shopping, bangladesh, gadgets"
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="google_analytics_id" className="text-xs font-semibold text-foreground">
                        Google Analytics 4 Measurement ID
                      </Label>
                      <Input
                        id="google_analytics_id"
                        type="text"
                        value={formData.google_analytics_id || ""}
                        onChange={(e) => handleChange("google_analytics_id", e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                        className="border-border bg-background font-mono text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="facebook_pixel_id" className="text-xs font-semibold text-foreground">
                        Meta (Facebook) Pixel ID
                      </Label>
                      <Input
                        id="facebook_pixel_id"
                        type="text"
                        value={formData.facebook_pixel_id || ""}
                        onChange={(e) => handleChange("facebook_pixel_id", e.target.value)}
                        placeholder="123456789012345"
                        className="border-border bg-background font-mono text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. SOCIAL NETWORKS TAB */}
              {activeTab === "social" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Social Media Profile Links</h3>
                    <p className="text-xs text-muted-foreground">
                      Connect official social channels displayed on the website footer and customer communications.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="social_facebook" className="text-xs font-semibold text-foreground">
                        Facebook Page URL
                      </Label>
                      <Input
                        id="social_facebook"
                        type="url"
                        value={formData.social_facebook || ""}
                        onChange={(e) => handleChange("social_facebook", e.target.value)}
                        placeholder="https://facebook.com/shopora.bd"
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="social_instagram" className="text-xs font-semibold text-foreground">
                        Instagram Profile URL
                      </Label>
                      <Input
                        id="social_instagram"
                        type="url"
                        value={formData.social_instagram || ""}
                        onChange={(e) => handleChange("social_instagram", e.target.value)}
                        placeholder="https://instagram.com/shopora.bd"
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="social_youtube" className="text-xs font-semibold text-foreground">
                        YouTube Channel URL
                      </Label>
                      <Input
                        id="social_youtube"
                        type="url"
                        value={formData.social_youtube || ""}
                        onChange={(e) => handleChange("social_youtube", e.target.value)}
                        placeholder="https://youtube.com/@shopora"
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="social_twitter" className="text-xs font-semibold text-foreground">
                        X (Twitter) Profile URL
                      </Label>
                      <Input
                        id="social_twitter"
                        type="url"
                        value={formData.social_twitter || ""}
                        onChange={(e) => handleChange("social_twitter", e.target.value)}
                        placeholder="https://x.com/shoporabd"
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-brand"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. ALERTS & INVENTORY TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Inventory Warnings &amp; Administrator Alerts</h3>
                    <p className="text-xs text-muted-foreground">
                      Automated warnings when stock dips below critical levels and order notification preferences.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="low_stock_threshold" className="text-xs font-semibold text-foreground">
                      Low Stock Alert Threshold (Units)
                    </Label>
                    <div className="max-w-xs">
                      <Input
                        id="low_stock_threshold"
                        type="number"
                        min="1"
                        value={formData.low_stock_threshold ?? 5}
                        onChange={(e) => handleChange("low_stock_threshold", Number(e.target.value))}
                        className="focus-visible:ring-brand"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Products with stock equal to or less than this value will be highlighted with a low stock badge in the admin panel.
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-border pt-5">
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
            </CardContent>
          </Card>
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
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Store Settings
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Control brand identity, delivery rules, payment accounts, commission rates, and SEO tags.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Settings</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading website configurations…</p>
        </div>
      ) : isError || !data ? (
        <Card className="border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <h2 className="text-base font-bold text-foreground">Failed to Load Settings</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Could not retrieve settings from the database. Please verify your connection.
          </p>
          <Button
            onClick={() => refetch()}
            size="sm"
            className="mt-4"
          >
            Retry
          </Button>
        </Card>
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
