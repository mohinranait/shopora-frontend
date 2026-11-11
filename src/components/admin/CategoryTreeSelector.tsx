"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Check,
  Search,
  X,
  Layers,
  Tag,
  Sparkles,
  Columns3,
  HelpCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetCategoriesQuery, useGetCategoryTreeQuery } from "@/redux";
import type { ICategory } from "@/types";

interface CategoryTreeSelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CategoryTreeSelector({
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
}: CategoryTreeSelectorProps) {
  const { data: categories = [], isLoading: isCategoriesLoading, refetch: refetchCategories } = useGetCategoriesQuery();
  const { data: treeCategories = [], isLoading: isTreeLoading, refetch: refetchTree } = useGetCategoryTreeQuery();

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cascading" | "tree">("cascading");
  const [searchQuery, setSearchQuery] = useState("");

  // Staged selection before confirming
  const [stagedId, setStagedId] = useState<string>("");

  // Cascading drilldown states
  const [selectedL1, setSelectedL1] = useState<string | null>(null);
  const [selectedL2, setSelectedL2] = useState<string | null>(null);

  // Tree view expanded folder IDs
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  // Category quick lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, ICategory>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Compute full ancestry path (e.g. [Root, Sub, Leaf])
  const getCategoryPath = useCallback(
    (catId?: string | null): ICategory[] => {
      if (!catId) return [];
      const path: ICategory[] = [];
      let current = categoryMap.get(catId);
      const visited = new Set<string>();

      while (current && !visited.has(current.id)) {
        visited.add(current.id);
        path.unshift(current);
        current = current.parentId ? categoryMap.get(current.parentId) : undefined;
      }
      return path;
    },
    [categoryMap]
  );

  // Parent -> Children map
  const childrenMap = useMemo(() => {
    const map = new Map<string, ICategory[]>();
    categories.forEach((cat) => {
      if (cat.parentId) {
        const list = map.get(cat.parentId) || [];
        list.push(cat);
        map.set(cat.parentId, list);
      }
    });
    return map;
  }, [categories]);

  // Root categories (Level 0)
  const rootCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [categories]);

  // Level 2 categories for currently selected L1
  const level2Categories = useMemo(() => {
    if (!selectedL1) return [];
    return (childrenMap.get(selectedL1) || []).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }, [selectedL1, childrenMap]);

  // Level 3 categories for currently selected L2
  const level3Categories = useMemo(() => {
    if (!selectedL2) return [];
    return (childrenMap.get(selectedL2) || []).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }, [selectedL2, childrenMap]);

  // Search Results with full path string
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return categories
      .filter((cat) => cat.name.toLowerCase().includes(q))
      .map((cat) => {
        const path = getCategoryPath(cat.id);
        const level = Math.max(0, path.length - 1);
        return {
          category: cat,
          path,
          level,
          pathString: path.map((p) => p.name).join(" › "),
        };
      })
      .sort((a, b) => {
        // Exact name matches first, then deeper categories
        const aExact = a.category.name.toLowerCase() === q;
        const bExact = b.category.name.toLowerCase() === q;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.pathString.localeCompare(b.pathString);
      });
  }, [categories, searchQuery, getCategoryPath]);

  // Sync internal staged state & cascading drilldown when opening modal
  useEffect(() => {
    if (isOpen) {
      const activeId = value || "";
      setStagedId(activeId);
      setSearchQuery("");

      if (activeId) {
        const path = getCategoryPath(activeId);
        if (path.length >= 1) setSelectedL1(path[0].id);
        if (path.length >= 2) setSelectedL2(path[1].id);

        // Pre-expand path in tree view
        const toExpand = new Set<string>();
        path.forEach((p) => toExpand.add(p.id));
        setExpandedFolderIds(toExpand);
      } else if (rootCategories.length > 0) {
        setSelectedL1(rootCategories[0].id);
        setSelectedL2(null);
      }
    }
  }, [isOpen, value, getCategoryPath, rootCategories]);

  // Toggle tree node expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Selected category info
  const selectedCategory = useMemo(() => {
    return value ? categoryMap.get(value) : null;
  }, [value, categoryMap]);

  const selectedPath = useMemo(() => {
    return value ? getCategoryPath(value) : [];
  }, [value, getCategoryPath]);

  const stagedCategory = useMemo(() => {
    return stagedId ? categoryMap.get(stagedId) : null;
  }, [stagedId, categoryMap]);

  const stagedPath = useMemo(() => {
    return stagedId ? getCategoryPath(stagedId) : [];
  }, [stagedId, getCategoryPath]);

  const handleConfirm = () => {
    if (stagedId) {
      onChange(stagedId);
      setIsOpen(false);
    }
  };

  const handleSelectImmediate = (catId: string) => {
    setStagedId(catId);
    onChange(catId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setStagedId("");
  };

  // Helper badge color based on category depth
  const getLevelBadge = (level: number, hasChildren: boolean) => {
    if (level === 0) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
          Main Category
        </span>
      );
    }
    if (hasChildren) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
          Subcategory
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        Leaf Category
      </span>
    );
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (cat: ICategory, level: number = 0) => {
    const children = childrenMap.get(cat.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolderIds.has(cat.id);
    const isStaged = stagedId === cat.id;

    return (
      <div key={cat.id} className="select-none">
        <div
          onClick={() => setStagedId(cat.id)}
          className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all border ${
            isStaged
              ? "bg-brand-500/15 border-brand-500 text-foreground font-bold shadow-xs"
              : "border-transparent text-foreground/80 hover:bg-muted hover:text-foreground"
          }`}
          style={{ paddingLeft: `${Math.max(12, level * 24 + 12)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(cat.id);
                }}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block -ml-1 text-muted-foreground/60 text-center font-mono text-[10px]">
                •
              </span>
            )}

            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-amber-400/80 shrink-0" />
              )
            ) : (
              <Tag className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            )}

            <span className="truncate">{cat.name}</span>
            {getLevelBadge(level, hasChildren)}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isStaged && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/30">
                <Check className="h-3 w-3" /> Selected
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectImmediate(cat.id);
              }}
              className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-brand-600 text-[10px] font-bold text-white hover:bg-brand-500 transition shadow-xs"
            >
              Choose
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-border ml-6 pl-1 my-0.5 space-y-0.5">
            {children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Trigger & Selected Display Card */}
      {!selectedCategory ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
          className={`w-full p-3.5 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between gap-3 text-left group ${
            required && !value
              ? "border-brand-500/50 bg-brand-500/5 hover:border-brand-500 hover:bg-brand-500/10"
              : "border-border bg-card/60 hover:border-border/80 hover:bg-muted/40"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FolderTree className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>Select Product Category</span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded font-semibold">
                  Required
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                Browse hierarchical categories (Main Category → Subcategory → Leaf)
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground group-hover:bg-muted/80 transition shrink-0 flex items-center gap-1.5">
            <span>Browse Categories</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      ) : (
        <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2.5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-foreground truncate">{selectedCategory.name}</h4>
                  {getLevelBadge(
                    Math.max(0, selectedPath.length - 1),
                    (childrenMap.get(selectedCategory.id) || []).length > 0
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className="text-muted-foreground/70">ID:</span>
                  <span className="font-mono text-muted-foreground text-[10px]">{selectedCategory.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => setIsOpen(true)}
                className="h-8 text-xs border-border hover:bg-muted text-foreground"
              >
                Change Category
              </Button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleClear}
                title="Clear category"
                className="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Full Breadcrumb Path Banner */}
          <div className="p-2 px-3 rounded-xl bg-muted/40 border border-border flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
              <FolderTree className="h-3 w-3 text-brand-600 dark:text-brand-400" /> Category Path:
            </span>
            {selectedPath.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />}
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    idx === selectedPath.length - 1
                      ? "bg-brand-500/15 text-brand-700 dark:text-brand-300 font-bold border border-brand-500/30"
                      : "bg-background text-foreground border border-border"
                  }`}
                >
                  {item.name}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Category Tree Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="bg-card border border-border text-card-foreground rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-4 bg-muted/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Select Product Category
                    <Badge variant="outline" className="border-brand-500/30 text-brand-600 dark:text-brand-400 text-[10px]">
                      Hierarchical Tree
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Navigate from Main Category down to specific Subcategories for optimal search discovery.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    refetchCategories();
                    refetchTree();
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="Refresh categories"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Bar & View Mode Switcher */}
            <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input with live clear */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search category by name (e.g. phones, laptop, t-shirt, accessories)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* View Switcher: Cascading vs Tree (disabled during search) */}
              {!searchQuery && (
                <div className="flex items-center p-1 bg-muted rounded-xl border border-border shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("cascading")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      viewMode === "cascading"
                        ? "bg-brand-600 text-white shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Columns3 className="h-3.5 w-3.5" />
                    <span>Columns</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("tree")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      viewMode === "tree"
                        ? "bg-brand-600 text-white shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FolderTree className="h-3.5 w-3.5" />
                    <span>Tree View</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body Area */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[340px] max-h-[50vh]">
              {isCategoriesLoading || isTreeLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
                  <RefreshCw className="h-6 w-6 animate-spin text-brand-500" />
                  <span>Loading category taxonomy...</span>
                </div>
              ) : searchQuery ? (
                /* Search Results View */
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground px-1 flex items-center justify-between">
                    <span>Search Results ({searchResults.length})</span>
                    <span className="text-[11px] text-muted-foreground">
                      Showing matches for &quot;{searchQuery}&quot;
                    </span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
                      <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No categories found</p>
                      <p className="text-[11px]">
                        Try searching with different keywords or browse via columns.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-2xl bg-card border border-border overflow-hidden">
                      {searchResults.map(({ category, path, level, pathString }) => {
                        const isStaged = stagedId === category.id;
                        const hasChildren = (childrenMap.get(category.id) || []).length > 0;

                        return (
                          <div
                            key={category.id}
                            onClick={() => setStagedId(category.id)}
                            onDoubleClick={() => handleSelectImmediate(category.id)}
                            className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer transition ${
                              isStaged
                                ? "bg-brand-500/15 text-foreground"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-foreground">
                                  {category.name}
                                </span>
                                {getLevelBadge(level, hasChildren)}
                                {isStaged && (
                                  <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.2 rounded font-bold">
                                    Current Choice
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                                <FolderTree className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{pathString}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectImmediate(category.id);
                              }}
                              className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-500 transition shadow-xs shrink-0"
                            >
                              Choose Category
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : viewMode === "cascading" ? (
                /* Cascading Column Drilldown View (Daraz / Amazon style) */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full min-h-[300px]">
                  {/* Column 1: Main / Root Categories */}
                  <div className="rounded-2xl bg-muted/20 border border-border flex flex-col overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Folder className="h-3.5 w-3.5 text-sky-400" />
                        1. Main Categories
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">
                        {rootCategories.length}
                      </span>
                    </div>

                    <div className="p-1.5 space-y-1 overflow-y-auto flex-1 max-h-[380px]">
                      {rootCategories.map((cat) => {
                        const children = childrenMap.get(cat.id) || [];
                        const isSelected = selectedL1 === cat.id;
                        const isStaged = stagedId === cat.id;

                        return (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedL1(cat.id);
                              setSelectedL2(null);
                              setStagedId(cat.id);
                            }}
                            className={`group w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                              isSelected
                                ? "bg-brand-600 text-white font-bold shadow-xs"
                                : isStaged
                                ? "bg-brand-500/20 text-foreground font-semibold border border-brand-500/40"
                                : "text-foreground/80 hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <span className="truncate pr-1">{cat.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {children.length > 0 && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                    isSelected
                                      ? "bg-brand-700/60 text-white"
                                      : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {children.length}
                                </span>
                              )}
                              <ChevronRight
                                className={`h-3.5 w-3.5 ${
                                  isSelected ? "text-white" : "text-muted-foreground"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Subcategories (Level 2) */}
                  <div className="rounded-2xl bg-muted/20 border border-border flex flex-col overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FolderOpen className="h-3.5 w-3.5 text-purple-400" />
                        2. Subcategories
                      </span>
                      {selectedL1 && (
                        <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">
                          {level2Categories.length}
                        </span>
                      )}
                    </div>

                    <div className="p-1.5 space-y-1 overflow-y-auto flex-1 max-h-[380px]">
                      {!selectedL1 ? (
                        <div className="h-full flex items-center justify-center p-6 text-center text-muted-foreground text-xs">
                          Select a Main Category from Column 1
                        </div>
                      ) : level2Categories.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-xs space-y-2">
                          <Tag className="h-6 w-6 text-muted-foreground/60" />
                          <p className="text-foreground font-semibold">No subcategories</p>
                          <p className="text-[11px]">
                            &quot;{categoryMap.get(selectedL1)?.name}&quot; can be selected directly as the primary category.
                          </p>
                        </div>
                      ) : (
                        level2Categories.map((cat) => {
                          const children = childrenMap.get(cat.id) || [];
                          const isSelected = selectedL2 === cat.id;
                          const isStaged = stagedId === cat.id;

                          return (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setSelectedL2(cat.id);
                                setStagedId(cat.id);
                              }}
                              className={`group w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                                isSelected
                                  ? "bg-purple-600 text-white font-bold shadow-xs"
                                  : isStaged
                                  ? "bg-purple-500/20 text-foreground font-semibold border border-purple-500/40"
                                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <span className="truncate pr-1">{cat.name}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {children.length > 0 && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                      isSelected
                                        ? "bg-purple-700/60 text-white"
                                        : "bg-muted text-muted-foreground border border-border"
                                    }`}
                                  >
                                    {children.length}
                                  </span>
                                )}
                                <ChevronRight
                                  className={`h-3.5 w-3.5 ${
                                    isSelected ? "text-white" : "text-muted-foreground"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Column 3: Leaf Categories (Level 3) */}
                  <div className="rounded-2xl bg-muted/20 border border-border flex flex-col overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-emerald-400" />
                        3. Leaf / Specific
                      </span>
                      {selectedL2 && (
                        <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">
                          {level3Categories.length}
                        </span>
                      )}
                    </div>

                    <div className="p-1.5 space-y-1 overflow-y-auto flex-1 max-h-[380px]">
                      {!selectedL2 ? (
                        <div className="h-full flex items-center justify-center p-6 text-center text-muted-foreground text-xs">
                          {selectedL1
                            ? "Select a Subcategory from Column 2"
                            : "Select Main & Subcategories first"}
                        </div>
                      ) : level3Categories.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-xs space-y-2">
                          <Check className="h-6 w-6 text-emerald-400" />
                          <p className="text-emerald-300 font-semibold">Ready to Select</p>
                          <p className="text-[11px] text-muted-foreground">
                            Subcategory &quot;{categoryMap.get(selectedL2)?.name}&quot; has no deeper children. Click &quot;Confirm Selection&quot; below.
                          </p>
                        </div>
                      ) : (
                        level3Categories.map((cat) => {
                          const isStaged = stagedId === cat.id;

                          return (
                            <div
                              key={cat.id}
                              onClick={() => setStagedId(cat.id)}
                              onDoubleClick={() => handleSelectImmediate(cat.id)}
                              className={`group w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                                isStaged
                                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <span className="truncate pr-1">{cat.name}</span>
                              {isStaged && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Nested Tree View (WooCommerce / Folder Explorer style) */
                <div className="p-2 space-y-1 bg-muted/20 rounded-2xl border border-border">
                  {rootCategories.map((root) => renderTreeNode(root, 0))}
                </div>
              )}
            </div>

            {/* Modal Bottom Action & Breadcrumb Preview */}
            <div className="p-4 border-t border-border bg-muted/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Chosen Category Preview:
                </span>
                {stagedCategory ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs mt-0.5">
                    {stagedPath.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />}
                        <span
                          className={`font-semibold ${
                            idx === stagedPath.length - 1
                              ? "text-brand-600 dark:text-brand-400 font-bold"
                              : "text-foreground"
                          }`}
                        >
                          {item.name}
                        </span>
                      </React.Fragment>
                    ))}
                    {getLevelBadge(
                      Math.max(0, stagedPath.length - 1),
                      (childrenMap.get(stagedCategory.id) || []).length > 0
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No category selected yet</span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="text-xs border-border hover:bg-muted text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  disabled={!stagedId}
                  onClick={handleConfirm}
                  className="text-xs font-bold gap-1.5 shadow-md"
                >
                  <Check className="h-3.5 w-3.5" />
                  Confirm Selection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
