"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Store,
  Tag,
  AlertTriangle,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "platform" | "vendor" | "pending" | "low_stock"
  >("all");
  const [search, setSearch] = useState("");

  const products = [
    {
      id: "prod-1",
      name: "Kieslect Ks Pro Calling Smartwatch",
      slug: "kieslect-ks-pro",
      sku: "KIES-KS-PRO-BLK",
      category: "Smartwatches",
      brand: "Kieslect",
      seller: "Shopora Direct (Self)",
      isPlatform: true,
      price: 4699,
      discountPrice: 4299,
      stock: 45,
      status: "active",
      approvalStatus: "approved",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "prod-2",
      name: "Anker Soundcore Life Q30 Hybrid ANC",
      slug: "anker-soundcore-life-q30",
      sku: "ANK-Q30-BLK",
      category: "Headphones",
      brand: "Anker",
      seller: "Apex Tech & Gadgets",
      isPlatform: false,
      price: 7499,
      discountPrice: 6899,
      stock: 4, // low stock!
      status: "active",
      approvalStatus: "approved",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "prod-3",
      name: "Baseus 65W GaN5 Pro Fast Charger",
      slug: "baseus-65w-gan5-pro",
      sku: "BAS-65W-GAN",
      category: "Mobile Accessories",
      brand: "Baseus",
      seller: "Apex Tech & Gadgets",
      isPlatform: false,
      price: 2850,
      discountPrice: 2550,
      stock: 30,
      status: "pending_review",
      approvalStatus: "pending",
      image:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "prod-4",
      name: "Logitech MX Master 3S Wireless Mouse",
      slug: "logitech-mx-master-3s",
      sku: "LOGI-MX-3S-GRY",
      category: "Computer Accessories",
      brand: "Logitech",
      seller: "ByteTech Official",
      isPlatform: false,
      price: 11500,
      discountPrice: 10800,
      stock: 18,
      status: "active",
      approvalStatus: "approved",
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "prod-5",
      name: "Premium Linen Long Sleeve Casual Shirt",
      slug: "premium-linen-long-sleeve-shirt",
      sku: "APP-LINEN-WHT-L",
      category: "Men's Fashion",
      brand: "Urban Weave",
      seller: "Apparel Studio BD",
      isPlatform: false,
      price: 1850,
      discountPrice: 1550,
      stock: 50,
      status: "active",
      approvalStatus: "approved",
      image:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "prod-6",
      name: "Redragon K552 Kumara RGB Mechanical Keyboard",
      slug: "redragon-k552-kumara",
      sku: "RED-K552-RGB",
      category: "Gaming Gear",
      brand: "Redragon",
      seller: "ByteTech Official",
      isPlatform: false,
      price: 3650,
      discountPrice: 3250,
      stock: 2, // low stock!
      status: "active",
      approvalStatus: "approved",
      image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const filteredProducts = products.filter((prod) => {
    if (activeTab === "platform" && !prod.isPlatform) return false;
    if (activeTab === "vendor" && prod.isPlatform) return false;
    if (activeTab === "pending" && prod.approvalStatus !== "pending") return false;
    if (activeTab === "low_stock" && prod.stock > 5) return false;
    if (
      search &&
      !prod.name.toLowerCase().includes(search.toLowerCase()) &&
      !prod.sku.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Products & Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your retail inventory, multi-vendor submissions, attributes, and stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products/new">
            <Button size="sm" variant="brand" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Pills */}
        <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "all"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("platform")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "platform"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Shopora Direct (1)
          </button>
          <button
            onClick={() => setActiveTab("vendor")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "vendor"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vendor Products (5)
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <span>Pending Review</span>
            <span className="h-4 px-1 rounded-full bg-amber-400/20 text-[10px] font-bold">
              1
            </span>
          </button>
          <button
            onClick={() => setActiveTab("low_stock")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === "low_stock"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <span>Low Stock</span>
            <span className="h-4 px-1 rounded-full bg-rose-500/20 text-[10px] font-bold">
              2
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Products Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU / Brand</th>
                  <th className="py-3 px-4">Source / Seller</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-700 bg-slate-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-xs">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {prod.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono text-slate-300 font-semibold">
                        {prod.sku}
                      </p>
                      <p className="text-[11px] text-slate-400">{prod.brand}</p>
                    </td>
                    <td className="py-3 px-4">
                      {prod.isPlatform ? (
                        <Badge variant="brand" className="text-[10px]">
                          Shopora Direct
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1 font-semibold text-slate-200">
                          <Store className="h-3 w-3 text-purple-400" />
                          <span>{prod.seller}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white font-mono">
                        ৳ {prod.discountPrice.toLocaleString()}
                      </p>
                      {prod.price > prod.discountPrice && (
                        <p className="text-[10px] text-slate-400 line-through">
                          ৳ {prod.price.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {prod.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                          <AlertTriangle className="h-3 w-3" />
                          {prod.stock} units
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-200">
                          {prod.stock} units
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {prod.approvalStatus === "pending" ? (
                        <Badge variant="warning">Pending Review</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Preview on Storefront"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
