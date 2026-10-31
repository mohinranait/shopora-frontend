"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Palmtree,
  Store,
  Upload,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaLibraryModal } from "@/components/media/MediaLibraryModal";
import {
  useGetSellerDashboardStatsQuery,
  useUpdateSellerProfileMutation,
} from "@/redux";
import { SelectedMediaPayload } from "@/types";
import { getApiErrorMessage } from "@/services/api";
import { toast } from "sonner";

export default function SellerSettingsPage() {
  const { data: dashboard, isLoading, refetch } = useGetSellerDashboardStatsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateSellerProfileMutation();

  const profile = dashboard?.profile;

  // Form states
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [bankAccountDetails, setBankAccountDetails] = useState("");
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [storeBanner, setStoreBanner] = useState<string | null>(null);

  // Vacation / Holiday Mode
  const [isHolidayMode, setIsHolidayMode] = useState(false);
  const [holidayMessage, setHolidayMessage] = useState("");

  // Media Library Modal states
  const [mediaTarget, setMediaTarget] = useState<"logo" | "banner" | null>(null);

  useEffect(() => {
    if (profile) {
      setStoreName(profile.storeName || "");
      setStoreSlug(profile.storeSlug || "");
      setPhone(profile.phone || "");
      setBusinessAddress(profile.businessAddress || "");
      setBankAccountDetails(profile.bankAccountDetails || "");
      setStoreLogo(profile.storeLogo || null);
      setStoreBanner(profile.storeBanner || null);
      setIsHolidayMode(Boolean(profile.isHolidayMode));
      setHolidayMessage(profile.holidayMessage || "");
    }
  }, [profile]);

  const handleMediaSelect = (item: SelectedMediaPayload) => {
    if (!item) return;

    if (mediaTarget === "logo") {
      setStoreLogo(item.url);
    } else if (mediaTarget === "banner") {
      setStoreBanner(item.url);
    }
    setMediaTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return;
    }

    try {
      await updateProfile({
        storeName: storeName.trim(),
        storeSlug: storeSlug.trim() || undefined,
        phone: phone.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
        bankAccountDetails: bankAccountDetails.trim() || undefined,
        storeLogo,
        storeBanner,
        isHolidayMode,
        holidayMessage: isHolidayMode ? holidayMessage.trim() || null : null,
      }).unwrap();

      toast.success("Store settings updated successfully!");
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Title & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-brand-500" />
            Store Settings & Autonomy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your storefront branding, vacation / holiday mode, contact info, and payout credentials.
          </p>
        </div>

        <Button
          type="submit"
          variant="brand"
          disabled={isUpdating}
          className="gap-1.5 text-xs font-bold h-9 px-6 shrink-0"
        >
          <Save className="h-4 w-4" />
          {isUpdating ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>

      {/* Vacation / Holiday Mode Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Palmtree className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Store Vacation / Holiday Mode</h3>
                {isHolidayMode ? (
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px]">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                When activated, your catalog items will be temporarily hidden from storefront searches and new orders will be paused. Existing pending orders must still be fulfilled.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isHolidayMode}
              onChange={(e) => setIsHolidayMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {isHolidayMode && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <label className="block text-xs font-semibold text-amber-300">
              Vacation Announcement Notice for Customers
            </label>
            <input
              type="text"
              value={holidayMessage}
              onChange={(e) => setHolidayMessage(e.target.value)}
              placeholder="e.g. We are on holiday for Eid until May 5. All new orders will be dispatched immediately upon reopening."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
      </div>

      {/* Store Profile & Branding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Store Info */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Store className="h-4 w-4 text-brand-500" />
            <span>Store Profile & Identification</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Store URL Slug (shopora.com/stores/slug)
              </label>
              <input
                type="text"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Store Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Business / Warehouse Address
              </label>
              <textarea
                rows={2}
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Warehouse pickup address for couriers"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Branding & Media */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <ImageIcon className="h-4 w-4 text-brand-500" />
            <span>Store Logo & Banner</span>
          </div>

          <div className="space-y-4">
            {/* Logo Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Store Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center shrink-0">
                  {storeLogo ? (
                    <Image
                      src={storeLogo}
                      alt="Store Logo"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <Store className="h-8 w-8 text-slate-700" />
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setMediaTarget("logo")}
                  className="text-xs border-slate-700 gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {storeLogo ? "Change Logo" : "Upload Logo"}
                </Button>
              </div>
            </div>

            {/* Banner Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Store Banner
              </label>
              <div className="h-28 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center">
                {storeBanner ? (
                  <Image
                    src={storeBanner}
                    alt="Store Banner"
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-600 text-xs">
                    <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                    No banner set
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setMediaTarget("banner")}
                  className="text-xs border-slate-700 gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {storeBanner ? "Change Banner" : "Upload Banner"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout & Financial Account Details */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
          <Building2 className="h-4 w-4 text-emerald-400" />
          <span>Default Payout Account Information</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Bank Account or Mobile Financial Service (bKash/Nagad) Details
          </label>
          <textarea
            rows={3}
            value={bankAccountDetails}
            onChange={(e) => setBankAccountDetails(e.target.value)}
            placeholder="e.g. Dutch-Bangla Bank Ltd, Account Name: John Doe, Account: 123.456.789, Branch: Gulshan OR bKash Personal: 017XXXXXXXX"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            These payout details will be pre-filled when you request wallet withdrawals.
          </p>
        </div>
      </div>

      {/* Media Library Picker Modal */}
      {mediaTarget && (
        <MediaLibraryModal
          isOpen={true}
          onClose={() => setMediaTarget(null)}
          onSelect={handleMediaSelect}
          title={mediaTarget === "logo" ? "Select Store Logo" : "Select Store Banner"}
        />
      )}
    </form>
  );
}
