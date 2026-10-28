"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { useUpdateAdminCustomerMutation } from "@/redux";

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

interface EditCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerData | null;
  onSuccess?: () => void;
}

function EditCustomerForm({
  customer,
  onClose,
  onSuccess,
}: {
  customer: CustomerData;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(customer.name || "");
  const [email, setEmail] = useState(customer.email || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [role, setRole] = useState<"CUSTOMER" | "SELLER" | "ADMIN">(
    (customer.role as "CUSTOMER" | "SELLER" | "ADMIN") || "CUSTOMER"
  );
  const [isActive, setIsActive] = useState(customer.isActive ?? true);
  const [isVerified, setIsVerified] = useState(customer.isVerified ?? false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [updateCustomer, { isLoading }] = useUpdateAdminCustomerMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Full name is required");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email address is required");
      return;
    }

    try {
      await updateCustomer({
        id: customer.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        role,
        isActive,
        isVerified,
      }).unwrap();

      toast.success("Customer profile updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update customer";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-400 ring-1 ring-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          placeholder="e.g. Rahim Chowdhury"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="customer@domain.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Mobile Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="01XXXXXXXXX"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
          User Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "CUSTOMER" | "SELLER" | "ADMIN")}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
        >
          <option value="CUSTOMER">Customer (Default)</option>
          <option value="SELLER">Vendor / Seller</option>
          <option value="ADMIN">System Administrator</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3">
          <div>
            <p className="text-xs font-bold text-white">Account Status</p>
            <p className="text-[11px] text-slate-400">
              {isActive ? "Active (Can login & order)" : "Suspended (Blocked)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-emerald-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3">
          <div>
            <p className="text-xs font-bold text-white">Email Verified</p>
            <p className="text-[11px] text-slate-400">
              {isVerified ? "Verified user badge" : "Unverified email"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsVerified(!isVerified)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isVerified ? "bg-sky-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out ${
                isVerified ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

export function EditCustomerDialog({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: EditCustomerDialogProps) {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Panel */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-deep/20 text-brand ring-1 ring-brand/30">
              <UserCog className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Edit Customer Profile</h3>
              <p className="text-xs text-slate-400">ID #{customer.id} &bull; {customer.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body keyed by customer ID to initialize state purely on mount without set-state-in-effect */}
        <EditCustomerForm
          key={customer.id}
          customer={customer}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
