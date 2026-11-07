"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback fired when a page is selected */
  onPageChange: (page: number) => void;
  /** Optional total count of items across all pages */
  totalItems?: number;
  /** Number of items displayed per page */
  pageSize?: number;
  /** Callback fired when page size is changed */
  onPageSizeChange?: (pageSize: number) => void;
  /** Page size options in the selector dropdown (defaults to [10, 20, 50, 100]) */
  pageSizeOptions?: number[];
  /** Shows a subtle loading spinner next to pagination controls */
  isLoading?: boolean;
  /** Noun used when showing total counts (e.g. "products", "orders", "users") */
  itemLabel?: string;
  /** Visual theme variant */
  variant?: "dark" | "light" | "default";
  /** Whether to show numeric page pills (default: true) */
  showPageNumbers?: boolean;
  /** Whether to show First and Last page jump buttons (default: true when totalPages > 5) */
  showFirstLast?: boolean;
  /** Whether to show the items summary text (default: true) */
  showItemCount?: boolean;
  /** Extra container CSS class names */
  className?: string;
}

function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | "...")[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSibling > 2;
  const shouldShowRightDots = rightSibling < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i
    );
    return [1, "...", ...middleRange, "...", totalPages];
  }

  return [];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  itemLabel = "items",
  variant = "dark",
  showPageNumbers = true,
  showFirstLast = true,
  showItemCount = true,
  className,
}: PaginationProps) {
  // If there are no pages and no items, don't render anything
  if (totalPages <= 0 && (!totalItems || totalItems <= 0)) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const pageRange = generatePageRange(safeCurrentPage, safeTotalPages);

  // Compute item range display
  const startItem = totalItems !== undefined ? (totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1) : null;
  const endItem = totalItems !== undefined ? Math.min(safeCurrentPage * pageSize, totalItems) : null;

  const isDark = variant === "dark";

  // Shared button style
  const btnBase =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors duration-150 cursor-pointer select-none disabled:pointer-events-none disabled:opacity-35";

  const btnNormal = isDark
    ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300";

  const btnActive = isDark
    ? "border-brand bg-brand text-white font-bold shadow-sm shadow-brand/20"
    : "border-brand-deep bg-brand-deep text-white font-bold shadow-sm";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 text-xs select-none",
        isDark ? "text-slate-400 border-t border-slate-800/80 bg-slate-900/40" : "text-slate-600 border-t border-slate-200 bg-slate-50/50",
        className
      )}
    >
      {/* Left side: Item summary & Rows per page */}
      <div className="flex flex-wrap items-center gap-4">
        {showItemCount && (
          <div className="flex items-center gap-1.5 font-medium">
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />}
            {totalItems !== undefined && startItem !== null && endItem !== null ? (
              <span>
                Showing <strong className={isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"}>{startItem}</strong>
                {totalItems > 0 && <>–<strong className={isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"}>{endItem}</strong></>} of{" "}
                <strong className={isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"}>{totalItems.toLocaleString()}</strong> {itemLabel}
              </span>
            ) : (
              <span>
                Page <strong className={isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"}>{safeCurrentPage}</strong> of{" "}
                <strong className={isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"}>{safeTotalPages}</strong>
              </span>
            )}
          </div>
        )}

        {/* Page size dropdown if onPageSizeChange is passed */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={cn(
                "h-7 rounded-md border text-xs px-2 py-0 font-medium focus:outline-none cursor-pointer",
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-brand"
                  : "bg-white border-slate-200 text-slate-700 focus:border-brand"
              )}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Navigation Controls */}
      <nav aria-label="Table Pagination" className="flex items-center gap-1 self-end sm:self-auto">
        {/* First page button */}
        {showFirstLast && safeTotalPages > 4 && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage <= 1 || isLoading}
            className={cn(btnBase, btnNormal, "px-2")}
            title="First page"
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1 || isLoading}
          className={cn(btnBase, btnNormal, "px-2")}
          title="Previous page"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Numeric page pills */}
        {showPageNumbers &&
          pageRange.map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className={cn("px-1 text-center font-bold tracking-widest", isDark ? "text-slate-600" : "text-slate-400")}
              >
                …
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                aria-current={p === safeCurrentPage ? "page" : undefined}
                className={cn(btnBase, p === safeCurrentPage ? btnActive : btnNormal, "px-2.5")}
              >
                {p}
              </button>
            )
          )}

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          className={cn(btnBase, btnNormal, "px-2")}
          title="Next page"
          aria-label="Go to next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Last page button */}
        {showFirstLast && safeTotalPages > 4 && (
          <button
            type="button"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={safeCurrentPage >= safeTotalPages || isLoading}
            className={cn(btnBase, btnNormal, "px-2")}
            title="Last page"
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        )}
      </nav>
    </div>
  );
}

export default Pagination;
