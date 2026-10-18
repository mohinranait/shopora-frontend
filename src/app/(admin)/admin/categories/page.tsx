"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  FolderTree,
  ChevronRight,
  Package,
  Edit,
  Trash2,
  ExternalLink,
  Tag,
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

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");

  const categories = [
    {
      id: "cat-1",
      name: "Electronics & Gadgets",
      slug: "electronics-gadgets",
      itemCount: 42,
      subcategories: [
        { name: "Smartwatches & Wearables", slug: "smartwatches", items: 14 },
        { name: "Audio & Headphones", slug: "audio-headphones", items: 12 },
        { name: "Computer & PC Accessories", slug: "computer-accessories", items: 9 },
        { name: "Chargers & Power Banks", slug: "chargers-power", items: 7 },
      ],
      status: "active",
      featured: true,
    },
    {
      id: "cat-2",
      name: "Fashion & Lifestyle",
      slug: "fashion-lifestyle",
      itemCount: 38,
      subcategories: [
        { name: "Men's Fashion & Shirts", slug: "mens-fashion", items: 18 },
        { name: "Leather Accessories & Wallets", slug: "leather-accessories", items: 12 },
        { name: "Footwear & Shoes", slug: "footwear", items: 8 },
      ],
      status: "active",
      featured: true,
    },
    {
      id: "cat-3",
      name: "Home & Kitchen",
      slug: "home-kitchen",
      itemCount: 19,
      subcategories: [
        { name: "Kitchen Appliances", slug: "kitchen-appliances", items: 11 },
        { name: "Smart Home Lighting", slug: "smart-lighting", items: 8 },
      ],
      status: "active",
      featured: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Categories & Taxonomy Hierarchy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize multi-level catalog categories, slug structures, and navigational menu ribbons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="brand" className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            <span>Add New Category</span>
          </Button>
        </div>
      </div>

      {/* Categories Tree Grid */}
      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    {cat.name}
                    {cat.featured && (
                      <Badge variant="brand" className="text-[10px]">
                        Featured on Home
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    /{cat.slug} • {cat.itemCount} Total Products
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" className="text-xs">
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="brand"
                  className="text-xs bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Subcategory
                </Button>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Subcategories ({cat.subcategories.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cat.subcategories.map((sub) => (
                  <div
                    key={sub.slug}
                    className="p-3 rounded-lg border border-slate-800/80 bg-slate-950 flex items-center justify-between hover:border-slate-700 transition group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                        {sub.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {sub.items} products
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
