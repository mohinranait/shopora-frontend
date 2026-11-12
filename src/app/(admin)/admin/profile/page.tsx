"use client";

import React, { useState, useMemo, useSyncExternalStore, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Key,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Laptop,
  ArrowRight,
  Check,
  UserCheck,
  Server,
  Activity,
  Copy,
  Plus,
  Trash2,
  MapPin,
  ExternalLink,
  Bell,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  useGetMeQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearReadNotificationsMutation,
  useCreateNotificationMutation,
  useGetUserAddressesQuery,
  useAddUserAddressMutation,
  useDeleteUserAddressMutation,
} from "@/redux";
import { ImageUploadField, ImageValue } from "@/components/media/ImageUploadField";
import type { IAuthUser, ICustomerAddress, INotification } from "@/types";
import { toast } from "sonner";

type AdminTab = "profile" | "security" | "activity";
type ActivityFilter = "ALL" | "UNREAD" | "KYC" | "ORDER" | "SYSTEM";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces",
];

interface ClientInfo {
  os: string;
  browser: string;
  screen: string;
  timezone: string;
}

const SERVER_CLIENT_INFO: ClientInfo = {
  os: "Linux",
  browser: "Chrome",
  screen: "1920x1080",
  timezone: "UTC",
};

let cachedClientInfo: ClientInfo | null = null;

function getClientSnapshot(): ClientInfo {
  if (cachedClientInfo) return cachedClientInfo;
  if (typeof window === "undefined") return SERVER_CLIENT_INFO;

  const ua = navigator.userAgent;
  let os = "Linux";
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let browser = "Chrome";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka";
  const scr = `${window.screen?.width || 1920}x${window.screen?.height || 1080}`;

  cachedClientInfo = { os, browser, screen: scr, timezone: tz };
  return cachedClientInfo;
}

function getServerSnapshot(): ClientInfo {
  return SERVER_CLIENT_INFO;
}

const emptySubscribe = () => () => {};

function useClientInfo(): ClientInfo {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
}

// ----------------------------------------------------------------------
// IDENTITY EDIT FORM SUB-COMPONENT (Self-contained state with key reset)
// ----------------------------------------------------------------------
interface IdentityFormProps {
  currentUser: IAuthUser | null;
  onProfileUpdated: (updatedUser: Partial<IAuthUser>) => void;
}

function IdentityForm({ currentUser, onProfileUpdated }: IdentityFormProps) {
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [avatarImageValue, setAvatarImageValue] = useState<ImageValue | null>(
    currentUser?.avatar ? { url: currentUser.avatar } : null
  );

  const [updateProfileMutation, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();

  const isProfileChanged =
    name.trim() !== (currentUser?.name || "") ||
    phone.trim() !== (currentUser?.phone || "") ||
    avatar !== (currentUser?.avatar || "");

  const handleSelectPresetAvatar = (url: string) => {
    setAvatar(url);
    setAvatarImageValue({ url });
  };

  const handleImageUploadChange = (val: ImageValue | null) => {
    setAvatarImageValue(val);
    setAvatar(val?.url || "");
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    setAvatarImageValue(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    try {
      const res = await updateProfileMutation({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
        avatarUseMediaId: avatarImageValue?.useMediaId ?? undefined,
      }).unwrap();

      onProfileUpdated({
        name: res.name,
        phone: res.phone,
        avatar: res.avatar,
      });

      toast.success("Administrator profile updated successfully!");
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        (err instanceof Error ? err.message : "Failed to update profile");
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-brand" />
          <span>Administrative Identity Details</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Update your public administrator display name, contact phone, and avatar portrait.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-full-name" className="text-xs font-semibold text-foreground">
              Administrator Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="admin-full-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. System Administrator"
              className="h-10 text-xs shadow-none"
              required
            />
          </div>

          {/* Phone & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-phone" className="text-xs font-semibold text-foreground">
                Primary Phone Number
              </Label>
              <Input
                id="admin-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +880 1712-345678"
                className="h-10 text-xs shadow-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-foreground">
                Email Address (Read-Only)
              </Label>
              <div className="relative">
                <Input
                  id="admin-email"
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="h-10 pr-24 border-border bg-muted/50 text-xs text-muted-foreground cursor-not-allowed shadow-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Root Verified
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Primary administrator authentication email is locked for account safety.
              </p>
            </div>
          </div>

          {/* Profile Avatar Selection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Profile Avatar Preset
              </Label>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear Avatar</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {AVATAR_PRESETS.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPresetAvatar(presetUrl)}
                  className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                    avatar === presetUrl
                      ? "border-brand ring-2 ring-brand/40 scale-105"
                      : "border-border hover:border-brand/60 opacity-80 hover:opacity-100"
                  }`}
                  title={`Select Preset Avatar ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={presetUrl}
                    alt={`Preset ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Media Library / Custom Upload */}
          <div className="pt-2">
            <ImageUploadField
              label="Upload Custom Administrator Avatar"
              value={avatarImageValue}
              onChange={handleImageUploadChange}
              helperText="Choose an image asset from the Shopora Media Library or upload a high-resolution photo."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-border">
            <span className="text-[11px] text-muted-foreground">
              {isProfileChanged ? "You have unsaved changes" : "All changes up to date"}
            </span>

            <Button
              type="submit"
              disabled={isUpdatingProfile || !isProfileChanged}
              className="bg-brand hover:bg-brand-deep text-white font-semibold text-xs h-9 px-5 gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile Information</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// MAIN ADMIN PROFILE INNER
// ----------------------------------------------------------------------
function AdminProfileInner() {
  const { user: authUser, updateUser, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Queries
  const { data: freshUser, refetch: refetchUser } = useGetMeQuery();
  const { data: notifsData, isLoading: isLoadingNotifs, refetch: refetchNotifs } = useGetNotificationsQuery({ limit: 40 });
  const { data: unreadNotifCount } = useGetUnreadNotificationCountQuery();
  const { data: addresses = [] } = useGetUserAddressesQuery();

  // Mutations
  const [changePasswordMutation, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsRead, { isLoading: isMarkingAllRead }] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearReadNotifications, { isLoading: isClearingRead }] = useClearReadNotificationsMutation();
  const [createNotification, { isLoading: isCreatingNotif }] = useCreateNotificationMutation();
  const [addUserAddress, { isLoading: isAddingAddress }] = useAddUserAddressMutation();
  const [deleteUserAddress] = useDeleteUserAddressMutation();

  // Active user data merged
  const currentUser: IAuthUser | null = freshUser || authUser;

  // Active Tab from URL query
  const tabParam = searchParams.get("tab");
  const activeTab: AdminTab =
    tabParam === "security" || tabParam === "activity"
      ? tabParam
      : "profile";

  const handleTabChange = (tab: AdminTab) => {
    router.replace(`/admin/profile?tab=${tab}`, { scroll: false });
  };

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address Form State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("Dhaka");
  const [addrState, setAddrState] = useState("");
  const [addrPostalCode, setAddrPostalCode] = useState("");
  const [addrType, setAddrType] = useState<"SHIPPING" | "BILLING">("SHIPPING");
  const [addrIsDefault, setAddrIsDefault] = useState(true);

  // Client Session Details
  const clientInfo = useClientInfo();

  // Filters
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("ALL");

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await refetchUser();
      await refetchNotifs();
      if (result.data) {
        updateUser({
          name: result.data.name,
          phone: result.data.phone,
          avatar: result.data.avatar,
          role: result.data.role,
        });
      }
      toast.success("Administrator profile synchronized with live server!");
    } catch {
      toast.error("Failed to sync profile");
    } finally {
      setIsSyncing(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Please enter your current administrator password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation password do not match.");
      return;
    }

    try {
      await changePasswordMutation({
        oldPassword,
        newPassword,
      }).unwrap();

      toast.success("Password changed successfully! Keep your credentials safe.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        (err instanceof Error ? err.message : "Failed to update password");
      toast.error(errorMsg);
    }
  };

  // Password Strength Calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "Not Entered", color: "bg-muted" };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 10) score++;
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-sky-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  }, [newPassword]);

  // Submit Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName.trim() || !addrPhone.trim() || !addrStreet.trim() || !addrCity.trim()) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    try {
      await addUserAddress({
        fullName: addrFullName.trim(),
        phone: addrPhone.trim(),
        streetAddress: addrStreet.trim(),
        city: addrCity.trim(),
        state: addrState.trim() || undefined,
        postalCode: addrPostalCode.trim() || undefined,
        type: addrType,
        isDefault: addrIsDefault,
      }).unwrap();

      toast.success("Administrative address saved successfully!");
      setShowAddAddressModal(false);
      setAddrFullName("");
      setAddrPhone("");
      setAddrStreet("");
      setAddrState("");
      setAddrPostalCode("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        (err instanceof Error ? err.message : "Failed to add address");
      toast.error(errorMsg);
    }
  };

  const handleDeleteAddress = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteUserAddress(id).unwrap();
      toast.success("Address removed successfully!");
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        (err instanceof Error ? err.message : "Failed to delete address");
      toast.error(errorMsg);
    }
  };

  // Quick Test Event in Activity Log
  const handleTriggerTestEvent = async () => {
    try {
      await createNotification({
        title: "Administrative Security Audit",
        message: `Admin session verified from ${clientInfo.browser} on ${clientInfo.os}. Security protocols compliant.`,
        type: "SYSTEM",
        link: "/admin/profile?tab=security",
      }).unwrap();
      toast.success("Test administrative audit event created!");
    } catch {
      toast.error("Could not create test activity");
    }
  };

  // Notifications list with safe memoization
  const notificationsList: INotification[] = useMemo(() => {
    return notifsData?.notifications || [];
  }, [notifsData]);

  const filteredActivities = useMemo(() => {
    return notificationsList.filter((n) => {
      if (activityFilter === "UNREAD") return !n.isRead;
      if (activityFilter === "KYC") return n.type === "KYC";
      if (activityFilter === "ORDER") return n.type === "ORDER" || n.type === "ORDER_STATUS";
      if (activityFilter === "SYSTEM") return n.type === "SYSTEM";
      return true;
    });
  }, [notificationsList, activityFilter]);

  // Initials Fallback
  const initials = String(currentUser?.name || "Super Admin")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Formatted date string
  const formattedJoinedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "System Initialized";

  const unreadCount = unreadNotifCount?.unreadCount ?? notificationsList.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP BREADCRUMB & PAGE HEADER                              */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <Link href="/admin" className="hover:text-foreground transition">Admin</Link>
            <span>/</span>
            <Link href="/admin/settings" className="hover:text-foreground transition">Settings</Link>
            <span>/</span>
            <span className="text-brand font-semibold">Administrator Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <User className="h-6 w-6 text-brand" />
            <span>Administrator Profile</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your administrative credentials, root access security, and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 py-1 px-3 text-xs font-semibold"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Super Admin Active
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="border-border text-foreground hover:bg-muted h-8 gap-1.5 text-xs cursor-pointer"
            title="Synchronize live profile with server"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-brand" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 h-8 gap-1 text-xs cursor-pointer"
            title="Sign out of administrative session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* HERO OVERVIEW PROFILE CARD                                */}
      {/* ========================================================= */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Avatar & Identity */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            {/* Avatar with Status indicator */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full border-2 border-brand/50 bg-muted overflow-hidden flex items-center justify-center text-xl font-bold text-foreground">
                {currentUser?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name || "Admin"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="tracking-wider">{initials}</span>
                )}
              </div>
              <div
                className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center"
                title="Active Super Admin Session"
              >
                <Check className="h-3 w-3 text-white stroke-3" />
              </div>
            </div>

            {/* Profile Core Details */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground tracking-tight truncate max-w-sm">
                  {currentUser?.name || "Super Administrator"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand/15 text-brand border border-brand/30 uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {currentUser?.role || "ADMIN"}
                </span>
                {currentUser?.isVerified !== false && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => handleCopy(currentUser?.email || "", "Email")}
                  className="flex items-center gap-1.5 hover:text-foreground transition group cursor-pointer"
                  title="Click to copy email"
                >
                  <Mail className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
                  <span>{currentUser?.email || "admin@shopora.com"}</span>
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-muted-foreground" />
                </button>

                {currentUser?.phone ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(currentUser.phone || "", "Phone number")}
                    className="flex items-center gap-1.5 hover:text-foreground transition group cursor-pointer"
                    title="Click to copy phone"
                  >
                    <Phone className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
                    <span>{currentUser.phone}</span>
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-muted-foreground" />
                  </button>
                ) : (
                  <span className="italic">No phone added</span>
                )}

                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Joined {formattedJoinedDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Highlights: Admin Role, ID, and Access */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full md:w-auto border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 shrink-0">
            <div className="p-3 rounded-lg bg-muted/40 border border-border text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                System Role
              </span>
              <span className="text-xs font-semibold text-foreground mt-0.5 block">
                Super Admin
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Account ID
              </span>
              <span className="text-xs font-semibold text-foreground mt-0.5 block font-mono">
                #ADM-{String(currentUser?.id ?? "001").slice(0, 8)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border text-center sm:text-left col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Access Level
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                Full Root Access
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 border-t border-border px-6 bg-muted/30 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => handleTabChange("profile")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "profile"
                ? "border-brand text-brand font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Identity & Personal Details</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("security")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "security"
                ? "border-brand text-brand font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Security & Password</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("activity")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "activity"
                ? "border-brand text-brand font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Activity & Audit Trail</span>
            {unreadCount > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* TAB 1: IDENTITY & PERSONAL DETAILS                        */}
      {/* ========================================================= */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form Column */}
          <div className="lg:col-span-2 space-y-6">
            <IdentityForm
              key={String(currentUser?.id ?? "admin")}
              currentUser={currentUser}
              onProfileUpdated={(updated) => updateUser(updated)}
            />

            {/* Administrative Office / Operational Headquarters Address */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand" />
                    <span>Administrative Base / Office Addresses</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Operational headquarters, dispatch origin, and administrative communication contacts.
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAddressModal(!showAddAddressModal)}
                  className="border-border text-foreground hover:bg-muted h-8 text-xs gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-brand" />
                  <span>Add Address</span>
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Collapsible Add Address Form */}
                {showAddAddressModal && (
                  <form onSubmit={handleAddAddress} className="p-4 rounded-xl bg-muted/30 border border-brand/30 space-y-3 mb-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand" />
                        <span>Add New Administrative Address</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className="text-muted-foreground hover:text-foreground transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <Label htmlFor="addr_fullName" className="text-[11px] font-semibold text-foreground">
                          Office / Full Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="addr_fullName"
                          type="text"
                          value={addrFullName}
                          onChange={(e) => setAddrFullName(e.target.value)}
                          placeholder="e.g. Shopora HQ Dispatch"
                          className="h-8 text-xs shadow-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="addr_phone" className="text-[11px] font-semibold text-foreground">
                          Contact Phone <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="addr_phone"
                          type="tel"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          placeholder="+880 1..."
                          className="h-8 text-xs shadow-none"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <Label htmlFor="addr_street" className="text-[11px] font-semibold text-foreground">
                          Street Address <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="addr_street"
                          type="text"
                          value={addrStreet}
                          onChange={(e) => setAddrStreet(e.target.value)}
                          placeholder="House, Road, Area, Floor"
                          className="h-8 text-xs shadow-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="addr_city" className="text-[11px] font-semibold text-foreground">
                          City / District <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="addr_city"
                          type="text"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          placeholder="Dhaka, Chittagong..."
                          className="h-8 text-xs shadow-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="addr_postalCode" className="text-[11px] font-semibold text-foreground">
                          Postal Code
                        </Label>
                        <Input
                          id="addr_postalCode"
                          type="text"
                          value={addrPostalCode}
                          onChange={(e) => setAddrPostalCode(e.target.value)}
                          placeholder="1212"
                          className="h-8 text-xs shadow-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="addr_type" className="text-[11px] font-semibold text-foreground">
                          Address Type
                        </Label>
                        <select
                          id="addr_type"
                          value={addrType}
                          onChange={(e) => setAddrType(e.target.value as "SHIPPING" | "BILLING")}
                          className="w-full h-8 px-2.5 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-none"
                        >
                          <option value="SHIPPING">Shipping Origin / Dispatch</option>
                          <option value="BILLING">Billing & Accounts Base</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="addr_default" className="flex items-center gap-2 text-xs text-foreground cursor-pointer font-normal">
                        <input
                          id="addr_default"
                          type="checkbox"
                          checked={addrIsDefault}
                          onChange={(e) => setAddrIsDefault(e.target.checked)}
                          className="h-4 w-4 rounded border-input text-brand focus:ring-brand accent-brand cursor-pointer"
                        />
                        <span>Set as Primary Administrative Address</span>
                      </Label>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddAddressModal(false)}
                          className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isAddingAddress}
                          className="h-7 text-xs bg-brand hover:bg-brand-deep text-white cursor-pointer"
                        >
                          {isAddingAddress ? "Saving..." : "Save Address"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Address List */}
                {addresses.length === 0 ? (
                  <div className="p-6 text-center rounded-lg border border-dashed border-border bg-muted/20">
                    <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-semibold text-foreground">No administrative addresses registered</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Add your central headquarters or dispatch hub location for operational invoicing.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr: ICustomerAddress) => (
                      <div
                        key={addr.id}
                        className="p-3.5 rounded-lg bg-card border border-border hover:border-brand/40 transition flex flex-col justify-between gap-3 relative group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] py-0 px-1.5">
                                Primary Base
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-foreground/90 font-medium">
                            {addr.streetAddress}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {addr.city} {addr.postalCode ? `- ${addr.postalCode}` : ""}, {addr.country || "Bangladesh"}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{addr.phone}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
                          <span className="uppercase tracking-wider">{addr.type}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
                            title="Delete address"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Information / System Account Details */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Server className="h-4 w-4 text-brand" />
                  <span>Administrative Session Metadata</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-semibold text-foreground">System Super Admin</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Account ID</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(currentUser?.id ?? ""), "Account UUID")}
                    className="font-mono text-[11px] text-muted-foreground hover:text-brand flex items-center gap-1 transition cursor-pointer"
                    title="Click to copy full ID"
                  >
                    <span>#ADM-{String(currentUser?.id ?? "001").slice(0, 8)}</span>
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Database Role</span>
                  <Badge variant="outline" className="border-brand/40 text-brand text-[10px] px-2 py-0">
                    {currentUser?.role || "ADMIN"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Session Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Authenticated
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Auth Token Transport</span>
                  <span className="font-mono text-[11px] text-foreground">HTTP-Only / Bearer JWT</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">Security Audit</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Compliant
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-brand/20 bg-brand/5 dark:bg-brand/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground">
                    Platform Settings & Governance
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Store parameters, shipping rates, bKash credentials, and marketplace policies can be configured in the global settings.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/admin/settings")}
                      className="border-brand/40 text-brand hover:bg-brand hover:text-white h-7 text-[11px] gap-1 cursor-pointer"
                    >
                      <span>Store Settings</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/admin/sellers")}
                      className="text-muted-foreground hover:text-foreground h-7 text-[11px] gap-1 cursor-pointer"
                    >
                      <span>Sellers KYC</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SECURITY & PASSWORD CREDENTIALS                   */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  <span>Change Administrator Password</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Protect your root administrative access by maintaining a strong, unique passkey.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="current_password" className="text-xs font-semibold text-foreground">
                      Current Password <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="h-10 pr-10 text-xs shadow-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="new_password" className="text-xs font-semibold text-foreground">
                        New Password <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="new_password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="h-10 pr-10 text-xs shadow-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirm_password" className="text-xs font-semibold text-foreground">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm_password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="h-10 pr-10 text-xs shadow-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password Strength:</span>
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${passwordStrength.color}`} />
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-muted"}`} />
                        <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-muted"}`} />
                        <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-muted"}`} />
                        <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 4 ? passwordStrength.color : "bg-muted"}`} />
                      </div>
                    </div>
                  )}

                  {/* Password Requirements Checklist */}
                  <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-2">
                    <span className="font-semibold text-foreground block">
                      Security Policy Checklist:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`h-3.5 w-3.5 rounded-full flex items-center justify-center ${
                            newPassword.length >= 6
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Check className="h-2.5 w-2.5 stroke-3" />
                        </div>
                        <span className={newPassword.length >= 6 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}>
                          At least 6 characters long
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div
                          className={`h-3.5 w-3.5 rounded-full flex items-center justify-center ${
                            newPassword && newPassword === confirmPassword
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Check className="h-2.5 w-2.5 stroke-3" />
                        </div>
                        <span
                          className={
                            newPassword && newPassword === confirmPassword
                              ? "text-emerald-600 dark:text-emerald-400 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          Passwords match exactly
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isChangingPassword || !oldPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-9 px-5 gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-3.5 w-3.5" />
                          <span>Update Password</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Active Sessions Card with Client Device Inspection */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-brand" />
                  <span>Active Administrative Sessions</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Client devices and browsers currently authenticated with this administrator account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-muted/40 border border-border gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-brand/10 text-brand">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {clientInfo.os} / {clientInfo.browser}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                          ACTIVE NOW
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Resolution: {clientInfo.screen} • Timezone: {clientInfo.timezone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[10px]">
                      This Device
                    </Badge>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={logout}
                      className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 text-xs h-7 cursor-pointer"
                    >
                      Terminate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Security Notice */}
          <div className="space-y-6">
            <Card className="border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Two-Factor Authentication</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                2FA adds an essential layer of security to your admin account by enforcing token validation on root administrative sessions.
              </p>
              <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">
                    Policy Enforcement
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Enforced by System</span>
                </div>
                <Badge className="bg-emerald-500 text-white text-[10px]">
                  Enabled
                </Badge>
              </div>
            </Card>

            <Card className="border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Administrator Security Protocol
                  </h4>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                    Never share your administrator login credentials or session cookies with anyone. Shopora engineers will never ask for your password.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: RECENT ACTIVITY & AUDIT LOG                        */}
      {/* ========================================================= */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-sky-500" />
                  <span>Administrative Audit Trail & Notifications</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Chronological record of recent administrative system events, merchant applications, and orders.
                </CardDescription>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerTestEvent}
                  disabled={isCreatingNotif}
                  className="border-border text-foreground hover:bg-muted h-8 text-xs gap-1.5 cursor-pointer"
                  title="Generate a test audit log event"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Test Event</span>
                </Button>

                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllNotificationsAsRead()}
                    disabled={isMarkingAllRead}
                    className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark All Read</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearReadNotifications()}
                  disabled={isClearingRead}
                  className="text-muted-foreground hover:text-foreground h-8 text-xs gap-1 cursor-pointer"
                  title="Clear read notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Read</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchNotifs()}
                  className="text-muted-foreground hover:text-foreground h-8 text-xs gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            {/* Filter Pills */}
            <div className="px-6 pb-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-border">
              {[
                { id: "ALL", label: `All (${notificationsList.length})` },
                { id: "UNREAD", label: `Unread (${unreadCount})` },
                { id: "KYC", label: "KYC & Sellers" },
                { id: "ORDER", label: "Orders" },
                { id: "SYSTEM", label: "System Alerts" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActivityFilter(f.id as ActivityFilter)}
                  className={`text-[11px] font-semibold py-1.5 px-3 rounded-full transition whitespace-nowrap cursor-pointer ${
                    activityFilter === f.id
                      ? "bg-brand text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <CardContent className="pt-4">
              {isLoadingNotifs ? (
                <div className="py-12 flex items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-brand" />
                  <span className="text-xs">Loading audit events...</span>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                  <h4 className="text-xs font-bold text-foreground">No activity events found</h4>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    There are no recent audit notifications matching the current filter. New seller applications, orders, and system alerts will automatically appear here.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTriggerTestEvent}
                    className="border-border text-brand text-xs h-8 gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Create Sample Audit Event</span>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredActivities.map((act) => {
                    let formattedTime = "Recently";
                    try {
                      const d = new Date(act.createdAt);
                      formattedTime = d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch {}

                    return (
                      <div
                        key={act.id}
                        className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition rounded-lg px-2 ${
                          !act.isRead ? "bg-brand/5 dark:bg-brand/10 border-l-2 border-brand" : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                !act.isRead ? "bg-brand animate-ping" : "bg-muted-foreground"
                              }`}
                            />
                            <span className="text-xs font-bold text-foreground truncate">
                              {act.title}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] py-0 px-1.5 uppercase font-semibold ${
                                act.type === "KYC"
                                  ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                  : act.type === "ORDER"
                                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                                  : "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10"
                              }`}
                            >
                              {act.type}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground pl-4 leading-relaxed">
                            {act.message}
                          </p>

                          {act.link && (
                            <div className="pl-4 pt-1">
                              <Link
                                href={act.link}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                              >
                                <span>View Target Subsystem</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pl-4 sm:pl-0 text-[11px] text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" />
                            {formattedTime}
                          </span>

                          <div className="flex items-center gap-1">
                            {!act.isRead && (
                              <button
                                type="button"
                                onClick={() => markNotificationAsRead(act.id)}
                                className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition p-1 cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteNotification(act.id)}
                              className="text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition p-1 cursor-pointer"
                              title="Delete notification"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 text-brand animate-spin" />
        </div>
      }
    >
      <AdminProfileInner />
    </Suspense>
  );
}
