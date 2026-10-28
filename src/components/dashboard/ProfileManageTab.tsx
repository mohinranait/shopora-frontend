"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Loader2,
  Image,
  Shield,
  Building,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useUpdateUserProfileMutation,
  useGetUserAddressesQuery,
  useAddUserAddressMutation,
  useDeleteUserAddressMutation,
} from "@/redux";
import type { IAuthUser } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  streetAddress: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
  type: z.enum(["SHIPPING", "BILLING"]).optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
];

export function ProfileManageTab({ user }: { user: IAuthUser }) {
  const { updateUser } = useAuth();
  const [updateProfileMutation, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();

  const { data: addresses = [], isLoading: isLoadingAddresses } =
    useGetUserAddressesQuery();
  const [addAddressMutation, { isLoading: isAddingAddress }] =
    useAddUserAddressMutation();
  const [deleteAddressMutation] = useDeleteUserAddressMutation();

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    },
  });

  const selectedAvatar = watchProfile("avatar");

  // Address Form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { errors: addressErrors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user.name || "",
      phone: user.phone || "",
      streetAddress: "",
      city: "Dhaka",
      state: "",
      postalCode: "",
      country: "Bangladesh",
      isDefault: addresses.length === 0,
      type: "SHIPPING",
    },
  });

  const onSaveProfile = async (values: ProfileFormValues) => {
    try {
      const res = await updateProfileMutation({
        name: values.name.trim(),
        phone: values.phone?.trim() || undefined,
        avatar: values.avatar?.trim() || undefined,
      }).unwrap();

      updateUser({
        name: res.name,
        phone: res.phone,
        avatar: res.avatar,
      });

      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    }
  };

  const onAddAddress = async (values: AddressFormValues) => {
    try {
      await addAddressMutation({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        streetAddress: values.streetAddress.trim(),
        city: values.city.trim(),
        state: values.state?.trim() || undefined,
        postalCode: values.postalCode?.trim() || undefined,
        country: values.country || "Bangladesh",
        isDefault: values.isDefault,
        type: values.type,
      }).unwrap();

      toast.success("Address added successfully!");
      resetAddressForm();
      setShowAddAddressModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      toast.error(msg);
    }
  };

  const onDeleteAddress = async (id: number) => {
    try {
      setDeletingAddressId(id);
      await deleteAddressMutation(id).unwrap();
      toast.success("Address removed!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete address";
      toast.error(msg);
    } finally {
      setDeletingAddressId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Personal Information Form */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500">
              Manage your display name, contact phone, and avatar photo.
            </p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-brand">
            <User className="h-4 w-4" />
          </span>
        </div>

        <form onSubmit={handleProfileSubmit(onSaveProfile)} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Your full name"
                  {...registerProfile("name")}
                  className={`w-full h-10 rounded-md border pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand ${
                    profileErrors.name
                      ? "border-rose-300 bg-rose-50/20"
                      : "border-slate-200 bg-white"
                  }`}
                />
              </div>
              {profileErrors.name && (
                <p className="text-[11px] font-medium text-rose-500">
                  {profileErrors.name.message}
                </p>
              )}
            </div>

            {/* Email Address (Read-only) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-500 cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+880 1XXXXXXXXX"
                  {...registerProfile("phone")}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            {/* Custom Avatar URL */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Avatar Image URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  {...registerProfile("avatar")}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
          </div>

          {/* Avatar Presets Selection */}
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
            <span className="text-xs font-semibold text-slate-700">
              Quick Avatar Presets:
            </span>
            <div className="mt-2 flex items-center gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProfileValue("avatar", preset, { shouldValidate: true })}
                  className={`relative h-10 w-10 overflow-hidden rounded-md border transition cursor-pointer ${
                    selectedAvatar === preset
                      ? "border-brand ring-2 ring-brand/30"
                      : "border-slate-200"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preset}
                    alt={`Preset ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {selectedAvatar === preset && (
                    <span className="absolute inset-0 bg-brand/30 flex items-center justify-center text-white">
                      <CheckCircle2 className="h-4 w-4 fill-brand text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Profile */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 rounded-md bg-brand-deep px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Delivery Address Book */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Saved Delivery Addresses
            </h2>
            <p className="text-xs text-slate-500">
              Manage shipping and billing addresses for fast checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddAddressModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {/* Address Cards List */}
        <div className="mt-4">
          {isLoadingAddresses ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="h-28 animate-pulse rounded-md bg-slate-100" />
              <div className="h-28 animate-pulse rounded-md bg-slate-100" />
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`relative rounded-md border p-4 transition ${
                    addr.isDefault
                      ? "border-brand bg-sky-50/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-brand-deep">
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {addr.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {addr.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {addr.isDefault && (
                        <span className="rounded-md bg-brand-deep px-2 py-0.5 text-[10px] font-bold text-white">
                          Default
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteAddress(addr.id)}
                        disabled={deletingAddressId === addr.id}
                        className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Address"
                      >
                        {deletingAddressId === addr.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 text-xs text-slate-600 space-y-0.5">
                    <p className="font-medium text-slate-800">
                      {addr.streetAddress}
                    </p>
                    <p>
                      {addr.city}
                      {addr.postalCode ? `, ${addr.postalCode}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-400">{addr.country}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 py-8 text-center">
              <MapPin className="h-6 w-6 text-slate-400" />
              <p className="mt-2 text-xs font-bold text-slate-800">
                No delivery addresses saved yet
              </p>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Account Security Info */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Account Security & Data Protection
            </p>
            <p className="text-[11px] text-slate-500">
              Your session is encrypted and protected with verified credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Add Address */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-slate-900">
                  Add Delivery Address
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAddressSubmit(onAddAddress)}
              className="mt-3.5 space-y-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...registerAddress("fullName")}
                    className="w-full h-9 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-brand"
                  />
                  {addressErrors.fullName && (
                    <p className="text-[10px] text-rose-500">
                      {addressErrors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    {...registerAddress("phone")}
                    className="w-full h-9 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-brand"
                  />
                  {addressErrors.phone && (
                    <p className="text-[10px] text-rose-500">
                      {addressErrors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Street Address & House *
                </label>
                <input
                  type="text"
                  placeholder="House, Road, Area..."
                  {...registerAddress("streetAddress")}
                  className="w-full h-9 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-brand"
                />
                {addressErrors.streetAddress && (
                  <p className="text-[10px] text-rose-500">
                    {addressErrors.streetAddress.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    City / Division *
                  </label>
                  <input
                    type="text"
                    placeholder="Dhaka..."
                    {...registerAddress("city")}
                    className="w-full h-9 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="1230"
                    {...registerAddress("postalCode")}
                    className="w-full h-9 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="isDefault"
                  {...registerAddress("isDefault")}
                  className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                <label htmlFor="isDefault" className="text-xs text-slate-700 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingAddress}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand transition cursor-pointer disabled:opacity-50"
                >
                  {isAddingAddress ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
