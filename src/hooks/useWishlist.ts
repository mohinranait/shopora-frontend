"use client";

import { useAuth } from "@/context/AuthContext";
import {
  useGetUserWishlistQuery,
  useToggleWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useClearWishlistMutation,
} from "@/redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useWishlist() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: wishlist = [], isLoading, isFetching } = useGetUserWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [toggleMutation, { isLoading: isToggling }] = useToggleWishlistItemMutation();
  const [removeMutation, { isLoading: isRemoving }] = useRemoveWishlistItemMutation();
  const [clearMutation, { isLoading: isClearing }] = useClearWishlistMutation();

  const isWishlisted = (productId: string | number): boolean => {
    if (!isAuthenticated) return false;
    return wishlist.some((item) => String(item.productId) === String(productId));
  };

  const toggleWishlist = async (productId: string | number, productName?: string): Promise<boolean | null> => {
    if (!isAuthenticated) {
      toast.info("Please login to save items to your favorites", {
        action: {
          label: "Login",
          onClick: () => {
            if (typeof window !== "undefined") {
              router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            }
          },
        },
      });
      return null;
    }

    try {
      const res = await toggleMutation({ productId }).unwrap();
      if (res.isWishlisted) {
        toast.success(productName ? `"${productName}" added to favorites!` : "Added to favorites!");
      } else {
        toast.info(productName ? `"${productName}" removed from favorites` : "Removed from favorites");
      }
      return res.isWishlisted;
    } catch {
      toast.error("Failed to update favorites. Please try again.");
      return null;
    }
  };

  const removeFromWishlist = async (productId: string | number, productName?: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      await removeMutation(productId).unwrap();
      toast.success(productName ? `"${productName}" removed from favorites` : "Item removed from favorites");
      return true;
    } catch {
      toast.error("Could not remove item from favorites");
      return false;
    }
  };

  const clearAllWishlist = async (): Promise<boolean> => {
    if (!isAuthenticated || wishlist.length === 0) return false;

    try {
      await clearMutation().unwrap();
      toast.success("Favorites list cleared");
      return true;
    } catch {
      toast.error("Failed to clear favorites");
      return false;
    }
  };

  return {
    wishlist,
    wishlistCount: isAuthenticated ? wishlist.length : 0,
    isLoading,
    isFetching,
    isToggling,
    isRemoving,
    isClearing,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    clearAllWishlist,
  };
}
