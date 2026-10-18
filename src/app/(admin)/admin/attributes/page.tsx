"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Sparkles,
  Check,
  RefreshCw,
  Layers,
  Tag,
  DollarSign,
  Package,
  Boxes,
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

interface SelectedAttribute {
  name: string;
  values: string[];
}

interface GeneratedVariantRow {
  name: string;
  combination: Record<string, string>;
  sku: string;
  price: number;
  offerPrice: number;
  stock: number;
}

export default function AdminAttributesPage() {
  // Available Attributes in System
  const availableAttributes = [
    {
      name: "Color",
      options: ["Matte Black", "Silver Grey", "Navy Blue", "Crimson Red", "White"],
    },
    {
      name: "Size",
      options: ["S", "M", "L", "XL", "XXL"],
    },
    {
      name: "Internal Storage",
      options: ["64GB", "128GB", "256GB", "512GB"],
    },
    {
      name: "Mechanical Switch",
      options: ["Outemu Red", "Outemu Blue", "Outemu Brown"],
    },
    {
      name: "Strap Material",
      options: ["Silicone Sport", "Magnetic Stainless Steel", "Leather"],
    },
  ];

  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([
    { name: "Color", values: ["Matte Black", "Silver Grey"] },
    { name: "Size", values: ["M", "L", "XL"] },
  ]);

  const [basePrice, setBasePrice] = useState(2500);
  const [baseSku, setBaseSku] = useState("SHP-MOD-01");
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariantRow[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  // Toggle value in selected attribute
  const toggleAttributeValue = (attrName: string, val: string) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) => {
        if (attr.name !== attrName) return attr;
        const exists = attr.values.includes(val);
        const newValues = exists
          ? attr.values.filter((v) => v !== val)
          : [...attr.values, val];
        return { ...attr, values: newValues };
      })
    );
  };

  // Add a new attribute group
  const addAttributeGroup = (name: string) => {
    if (selectedAttributes.some((a) => a.name === name)) return;
    const found = availableAttributes.find((a) => a.name === name);
    if (!found) return;
    setSelectedAttributes([
      ...selectedAttributes,
      { name, values: [found.options[0]] },
    ]);
  };

  const removeAttributeGroup = (name: string) => {
    setSelectedAttributes(selectedAttributes.filter((a) => a.name !== name));
  };

  // CARTESIAN PRODUCT GENERATOR ("GENERATE" BUTTON LOGIC)
  const handleGenerateCombinations = () => {
    const validAttributes = selectedAttributes.filter((a) => a.values.length > 0);
    if (validAttributes.length === 0) {
      alert("Please select at least one attribute and value.");
      return;
    }

    // Cartesian product algorithm
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((x) => curr.map((y) => [...x, y])),
        [[]]
      );
    };

    const valueArrays = validAttributes.map((a) => a.values);
    const combinations = cartesian(valueArrays);

    const rows: GeneratedVariantRow[] = combinations.map((combo) => {
      const combinationMap: Record<string, string> = {};
      validAttributes.forEach((attr, idx) => {
        combinationMap[attr.name] = combo[idx];
      });

      const variantName = combo.join(" / ");
      const skuSuffix = combo
        .map((c) =>
          c
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase()
            .slice(0, 4)
        )
        .join("-");

      return {
        name: variantName,
        combination: combinationMap,
        sku: `${baseSku}-${skuSuffix}`,
        price: basePrice,
        offerPrice: Math.round(basePrice * 0.9),
        stock: 20,
      };
    });

    setGeneratedVariants(rows);
    setIsGenerated(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dynamic Attribute & Variant Engine
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold">
              Cartesian Matrix
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic relational attributes, swatches, and instantly generate variable product matrix rows.
          </p>
        </div>
      </div>

      {/* Generator Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Attribute & Values Selector (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-sky-400" />
                  Select Attributes & Value Combinations
                </CardTitle>
                <CardDescription>
                  Choose which attributes define this product&apos;s variants (Color, Size, Storage, etc.)
                </CardDescription>
              </div>

              {/* Add Attribute Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) addAttributeGroup(e.target.value);
                  e.target.value = "";
                }}
                className="h-8 px-2.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">+ Add Attribute</option>
                {availableAttributes
                  .filter((a) => !selectedAttributes.some((s) => s.name === a.name))
                  .map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {selectedAttributes.map((attr) => {
              const master = availableAttributes.find((a) => a.name === attr.name);
              return (
                <div
                  key={attr.name}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-brand" />
                      {attr.name}
                    </span>
                    <button
                      onClick={() => removeAttributeGroup(attr.name)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Remove attribute"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Value Pills */}
                  <div className="flex flex-wrap gap-2">
                    {master?.options.map((val) => {
                      const isSelected = attr.values.includes(val);
                      return (
                        <button
                          key={val}
                          onClick={() => toggleAttributeValue(attr.name, val)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-brand/20 border-brand text-sky-300 shadow-sm shadow-brand/10"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-sky-400" />}
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Base Product Fallbacks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Base Model SKU Prefix
                </label>
                <input
                  type="text"
                  value={baseSku}
                  onChange={(e) => setBaseSku(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Base Regular Price (৳)
                </label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="mt-1 w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* THE "GENERATE" BUTTON */}
            <div className="pt-2">
              <Button
                onClick={handleGenerateCombinations}
                variant="brand"
                size="lg"
                className="w-full gap-2 text-sm font-bold shadow-lg shadow-brand/25"
              >
                <Sparkles className="h-4 w-4" />
                Generate Variant Matrix Rows
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Combinations Summary Sidebar (1 Col) */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">
              Combinations Summary
            </CardTitle>
            <CardDescription>
              Calculation of Cartesian product mathematical combinations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {selectedAttributes.map((attr) => (
                <div
                  key={attr.name}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-800"
                >
                  <span className="text-slate-400">{attr.name}:</span>
                  <span className="font-bold text-sky-400">
                    {attr.values.length} selected
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-center">
              <p className="text-xs text-slate-400 font-semibold uppercase">
                Expected Total Variants
              </p>
              <p className="text-4xl font-black text-white mt-1 font-mono">
                {selectedAttributes.reduce((acc, curr) => acc * Math.max(curr.values.length, 1), 1)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Combinations generated via relational join
              </p>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-300">Prisma 8 Relational Models:</p>
              <p>• `ProductVariant`</p>
              <p>• `ProductVariantAttributeValue`</p>
              <p>• `Attribute` & `AttributeValue`</p>
            </div>
          </CardContent>
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
            Backed by PostgreSQL normalized schema
          </div>
        </Card>
      </div>

      {/* GENERATED ROWS TABLE (Appears when user clicks Generate) */}
      {isGenerated && generatedVariants.length > 0 && (
        <Card className="border-sky-500/30">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-white">
                  Generated Variable Rows ({generatedVariants.length})
                </CardTitle>
                <Badge variant="success" className="text-[10px]">
                  Ready to Save
                </Badge>
              </div>
              <CardDescription>
                Customize individual pricing, stock thresholds, and SKUs per variant combination.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Variant Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Regular Price (৳)</th>
                    <th className="py-3 px-4">Offer Price (৳)</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {generatedVariants.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">{row.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          defaultValue={row.sku}
                          className="h-8 w-44 rounded border border-slate-700 bg-slate-900 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          defaultValue={row.price}
                          className="h-8 w-24 rounded border border-slate-700 bg-slate-900 px-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          defaultValue={row.offerPrice}
                          className="h-8 w-24 rounded border border-slate-700 bg-slate-900 px-2 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          defaultValue={row.stock}
                          className="h-8 w-20 rounded border border-slate-700 bg-slate-900 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setGeneratedVariants(
                              generatedVariants.filter((_, i) => i !== idx)
                            );
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                          title="Delete variant row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                All {generatedVariants.length} rows will be committed to `ProductVariant` in DB.
              </span>
              <Button size="sm" variant="brand" className="text-xs">
                Save & Link to Product
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
