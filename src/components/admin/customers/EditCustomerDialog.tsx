"use client";

import React, { useState } from "react";
import { AlertCircle, Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useUpdateAdminCustomerMutation } from "@/redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface CustomerData {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface EditCustomerDialogProps {
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
    <form onSubmit={handleSubmit} className="space-y-4 py-1">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="cust-name">
          Full Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="cust-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Rahim Chowdhury"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cust-email">
            Email Address <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="cust-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="customer@domain.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cust-phone">Mobile Number</Label>
          <Input
            id="cust-phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cust-role">User Role</Label>
        <Select
          value={role}
          onValueChange={(val) => setRole(val as "CUSTOMER" | "SELLER" | "ADMIN")}
        >
          <SelectTrigger id="cust-role">
            <SelectValue placeholder="Select role">
              {role === "CUSTOMER"
                ? "Customer (Default)"
                : role === "SELLER"
                ? "Vendor / Seller"
                : "System Administrator"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUSTOMER">Customer (Default)</SelectItem>
            <SelectItem value="SELLER">Vendor / Seller</SelectItem>
            <SelectItem value="ADMIN">System Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div>
            <p className="text-xs font-bold text-foreground">Account Status</p>
            <p className="text-[11px] text-muted-foreground">
              {isActive ? "Active (Can login & order)" : "Suspended (Blocked)"}
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div>
            <p className="text-xs font-bold text-foreground">Email Verified</p>
            <p className="text-[11px] text-muted-foreground">
              {isVerified ? "Verified user badge" : "Unverified email"}
            </p>
          </div>
          <Switch checked={isVerified} onCheckedChange={setIsVerified} />
        </div>
      </div>

      {/* Footer Buttons */}
      <DialogFooter className="pt-3 border-t border-border gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="text-xs cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="brand"
          size="sm"
          disabled={isLoading}
          className="text-xs font-bold cursor-pointer"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditCustomerDialog({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: EditCustomerDialogProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <UserCog className="h-4 w-4" />
            </span>
            <span>Edit Customer Profile</span>
          </DialogTitle>
          <DialogDescription>
            ID #{customer.id} &bull; {customer.email}
          </DialogDescription>
        </DialogHeader>

        <EditCustomerForm
          key={customer.id}
          customer={customer}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
