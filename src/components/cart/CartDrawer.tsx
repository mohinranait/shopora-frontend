"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  // Sample static cart items
  const [items, setItems] = React.useState([
    {
      id: 1,
      name: "Kieslect Kr Pro Amoled Calling Smartwatch",
      price: 5499,
      quantity: 1,
      variant: "Black / Silicone Strap",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      name: "Anker Soundcore Life P2i TWS Earbuds",
      price: 2299,
      quantity: 1,
      variant: "Matte Black",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80",
    },
  ]);

  // Lock body scroll when cart drawer is open without layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const isScrollbarGutterSupported =
        typeof window !== "undefined" &&
        window.CSS &&
        CSS.supports("scrollbar-gutter", "stable");

      document.body.style.overflow = "hidden";

      // If browser does not support scrollbar-gutter, apply exact pixel compensation
      if (!isScrollbarGutterSupported && scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof items
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "visible" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop with Blur */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel: Smooth slide-in from right */}
      <div
        className={`fixed inset-y-0 right-0 z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand" />
            <h2 className="text-base font-bold text-slate-900">
              Shopping Cart ({items.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping alert */}
        <div className="bg-sky-50 border-b border-sky-100 px-5 py-2.5 text-xs text-brand-deep flex items-center justify-between">
          <span>🎉 You qualify for <strong>FREE Nationwide Delivery</strong>!</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-300 mb-3" />
              <p className="text-base font-semibold text-slate-800">Your cart is empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explore our catalog to find hot deals and trending products.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-deep px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand transition cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 py-4 first:pt-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-50"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.variant}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:text-brand text-slate-600 transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:text-brand text-slate-600 transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-brand-deep">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span className="text-sm font-bold text-slate-900">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Estimated Delivery</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-base text-brand-deep">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:border-brand hover:text-brand-deep transition shadow-2xs"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-deep py-2.5 text-xs font-semibold text-white hover:bg-brand transition shadow-xs"
              >
                Checkout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
