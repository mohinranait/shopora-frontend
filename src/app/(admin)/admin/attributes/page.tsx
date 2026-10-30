"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  RefreshCw,
  Tag,
  Palette,
  CheckCircle2,
  X,
  Layers,
  ChevronRight,
  Loader2,
  Search,
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
import {
  useGetAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { IAttribute, IAttributeValue, AttributeDisplayType } from "@/types";
import { toast } from "sonner";

export default function AdminAttributesPage() {
  const { data: attributes = [], isLoading: loading, isFetching, refetch } = useGetAttributesQuery(true);
  const [createAttribute] = useCreateAttributeMutation();
  const [updateAttribute] = useUpdateAttributeMutation();
  const [deleteAttribute] = useDeleteAttributeMutation();
  const [createAttributeValue] = useCreateAttributeValueMutation();
  const [updateAttributeValue] = useUpdateAttributeValueMutation();
  const [deleteAttributeValue] = useDeleteAttributeValueMutation();

  const [search, setSearch] = useState("");
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | number | null>(null);

  // Modal State for Create / Edit Attribute
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [attrModalMode, setAttrModalMode] = useState<"create" | "edit">("create");
  const [editingAttr, setEditingAttr] = useState<IAttribute | null>(null);
  const [attrFormName, setAttrFormName] = useState("");
  const [attrFormType, setAttrFormType] = useState<AttributeDisplayType>("SELECT");
  const [attrFormDescription, setAttrFormDescription] = useState("");
  const [attrFormDisplayOrder, setAttrFormDisplayOrder] = useState<number>(0);
  const [attrFormIsActive, setAttrFormIsActive] = useState<boolean>(true);
  const [attrFormInitialValues, setAttrFormInitialValues] = useState<string>("");
  const [attrSubmitting, setAttrSubmitting] = useState(false);

  // State for Add / Edit Attribute Value
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [valueModalMode, setValueModalMode] = useState<"create" | "edit">("create");
  const [editingValue, setEditingValue] = useState<IAttributeValue | null>(null);
  const [valueFormText, setValueFormText] = useState("");
  const [valueFormColor, setValueFormColor] = useState("#000000");
  const [valueFormDisplayOrder, setValueFormDisplayOrder] = useState<number>(0);
  const [valueSubmitting, setValueSubmitting] = useState(false);

  // Selected Attribute
  const selectedAttribute = attributes.find((a) => String(a.id) === String(selectedAttributeId)) || attributes[0] || null;

  // Total Counts
  const totalAttributes = attributes.length;
  const totalValues = attributes.reduce((sum, a) => sum + (a.values?.length || 0), 0);
  const activeCount = attributes.filter((a) => a.isActive).length;

  // Filtered Attributes
  const filteredAttributes = attributes.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q)
    );
  });

  // Open Create Attribute Modal
  const handleOpenCreateAttr = () => {
    setAttrModalMode("create");
    setEditingAttr(null);
    setAttrFormName("");
    setAttrFormType("SELECT");
    setAttrFormDescription("");
    setAttrFormDisplayOrder(attributes.length);
    setAttrFormIsActive(true);
    setAttrFormInitialValues("");
    setIsAttrModalOpen(true);
  };

  // Open Edit Attribute Modal
  const handleOpenEditAttr = (attr: IAttribute, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAttrModalMode("edit");
    setEditingAttr(attr);
    setAttrFormName(attr.name);
    setAttrFormType(attr.type);
    setAttrFormDescription(attr.description || "");
    setAttrFormDisplayOrder(attr.displayOrder);
    setAttrFormIsActive(attr.isActive);
    setAttrFormInitialValues("");
    setIsAttrModalOpen(true);
  };

  // Submit Attribute Form
  const handleSaveAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrFormName.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    try {
      setAttrSubmitting(true);

      if (attrModalMode === "create") {
        // Parse initial comma-separated values
        const parsedValues = attrFormInitialValues
          ? attrFormInitialValues
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
              .map((val, idx) => ({
                value: val,
                displayOrder: idx,
                colorCode: attrFormType === "COLOR" ? "#111827" : undefined,
              }))
          : [];

        const created = await createAttribute({
          name: attrFormName.trim(),
          type: attrFormType,
          description: attrFormDescription.trim() || undefined,
          displayOrder: attrFormDisplayOrder,
          isActive: attrFormIsActive,
          values: parsedValues.length > 0 ? parsedValues : undefined,
        }).unwrap();

        toast.success(`Attribute "${created.name}" created successfully!`);
        setIsAttrModalOpen(false);
        setSelectedAttributeId(created.id);
      } else if (editingAttr) {
        await updateAttribute({
          id: editingAttr.id,
          body: {
            name: attrFormName.trim(),
            type: attrFormType,
            description: attrFormDescription.trim() || undefined,
            displayOrder: attrFormDisplayOrder,
            isActive: attrFormIsActive,
          },
        }).unwrap();

        toast.success(`Attribute "${attrFormName}" updated successfully!`);
        setIsAttrModalOpen(false);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setAttrSubmitting(false);
    }
  };

  // Delete Attribute
  const handleDeleteAttribute = async (attr: IAttribute, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete attribute "${attr.name}" and all its values?`)) {
      return;
    }

    try {
      await deleteAttribute(attr.id).unwrap();
      toast.success(`Attribute "${attr.name}" removed.`);
      if (String(selectedAttributeId) === String(attr.id)) {
        const remaining = attributes.filter((a) => a.id !== attr.id);
        setSelectedAttributeId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Open Create Value Modal
  const handleOpenCreateValue = () => {
    if (!selectedAttribute) return;
    setValueModalMode("create");
    setEditingValue(null);
    setValueFormText("");
    setValueFormColor(selectedAttribute.type === "COLOR" ? "#2563EB" : "");
    setValueFormDisplayOrder(selectedAttribute.values?.length || 0);
    setIsValueModalOpen(true);
  };

  // Open Edit Value Modal
  const handleOpenEditValue = (val: IAttributeValue) => {
    setValueModalMode("edit");
    setEditingValue(val);
    setValueFormText(val.value);
    setValueFormColor(val.colorCode || "#000000");
    setValueFormDisplayOrder(val.displayOrder);
    setIsValueModalOpen(true);
  };

  // Save Attribute Value
  const handleSaveValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttribute) return;
    if (!valueFormText.trim()) {
      toast.error("Value name is required (e.g. 'Red', 'XL', '256GB')");
      return;
    }

    try {
      setValueSubmitting(true);

      if (valueModalMode === "create") {
        const newVal = await createAttributeValue({
          attributeId: selectedAttribute.id,
          body: {
            value: valueFormText.trim(),
            colorCode: selectedAttribute.type === "COLOR" ? valueFormColor : undefined,
            displayOrder: valueFormDisplayOrder,
          },
        }).unwrap();

        toast.success(`Value "${newVal.value}" added to ${selectedAttribute.name}!`);
        setIsValueModalOpen(false);
      } else if (editingValue) {
        await updateAttributeValue({
          valueId: editingValue.id,
          body: {
            value: valueFormText.trim(),
            colorCode: selectedAttribute.type === "COLOR" ? valueFormColor : undefined,
            displayOrder: valueFormDisplayOrder,
          },
        }).unwrap();

        toast.success(`Value "${valueFormText}" updated!`);
        setIsValueModalOpen(false);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setValueSubmitting(false);
    }
  };

  // Delete Attribute Value
  const handleDeleteValue = async (val: IAttributeValue) => {
    if (!confirm(`Are you sure you want to delete value "${val.value}"?`)) return;

    try {
      await deleteAttributeValue(val.id).unwrap();
      toast.success(`Value "${val.value}" deleted.`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Badge for Type
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "COLOR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Palette className="h-3 w-3" />
            <span>Color Swatch</span>
          </span>
        );
      case "BUTTON":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Tag className="h-3 w-3" />
            <span>Button Pill</span>
          </span>
        );
      case "RADIO":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CheckCircle2 className="h-3 w-3" />
            <span>Radio Select</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Dropdown Select</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Attributes & Specifications
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Global Catalog
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure reusable specifications (Color, Size, Storage, RAM) and manage predefined values for variable products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={loading || isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-sky-400" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="brand"
            onClick={handleOpenCreateAttr}
            className="text-xs gap-1.5 font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Attribute</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total Attributes
              </p>
              <p className="text-2xl font-black text-white mt-1">{totalAttributes}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total Attribute Values
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{totalValues}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Active in Catalog
              </p>
              <p className="text-2xl font-black text-purple-400 mt-1">{activeCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Attribute List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Attribute Groups ({filteredAttributes.length})
            </h3>
            <span className="text-[11px] text-slate-500">Click to view values</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search attributes by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
            />
          </div>

          {/* Attributes Scrollable Stack */}
          {loading ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <Loader2 className="h-6 w-6 text-sky-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Loading attributes...</p>
            </div>
          ) : filteredAttributes.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
              <Layers className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-slate-300">No attributes found</p>
              <p className="text-[11px] text-slate-500">
                Click &quot;New Attribute&quot; above to create your first specification attribute.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {filteredAttributes.map((attr) => {
                const isSelected = selectedAttribute?.id === attr.id;
                return (
                  <div
                    key={attr.id}
                    onClick={() => setSelectedAttributeId(attr.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group ${
                      isSelected
                        ? "bg-slate-900 border-brand ring-1 ring-brand/40"
                        : "bg-slate-900/50 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{attr.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">({attr.slug})</span>
                          {!attr.isActive && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-rose-500/40 text-rose-400">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          {renderTypeBadge(attr.type)}
                          <span className="text-[11px] text-slate-400">
                            {attr.values?.length || 0} values defined
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditAttr(attr, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Attribute"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAttribute(attr, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Attribute"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            isSelected ? "text-brand translate-x-0.5" : "text-slate-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Value Preview Pills */}
                    {attr.values && attr.values.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                        {attr.values.slice(0, 5).map((val) => (
                          <span
                            key={val.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono"
                          >
                            {attr.type === "COLOR" && val.colorCode && (
                              <span
                                className="h-2 w-2 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: val.colorCode }}
                              />
                            )}
                            <span>{val.value}</span>
                          </span>
                        ))}
                        {attr.values.length > 5 && (
                          <span className="text-[10px] text-slate-500 self-center pl-1 font-medium">
                            +{attr.values.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Values Workspace for Selected Attribute (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedAttribute ? (
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
              <CardHeader className="bg-slate-950/40 border-b border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-black text-white">
                      {selectedAttribute.name} Values
                    </CardTitle>
                    {renderTypeBadge(selectedAttribute.type)}
                  </div>
                  <CardDescription className="text-xs text-slate-400 mt-1">
                    Manage the selectable options for this attribute used when generating product variants.
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  variant="brand"
                  onClick={handleOpenCreateValue}
                  className="text-xs gap-1.5 font-bold shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Value</span>
                </Button>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Values Table / Grid */}
                {!selectedAttribute.values || selectedAttribute.values.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
                    <Tag className="h-8 w-8 text-slate-600 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        No values configured for &quot;{selectedAttribute.name}&quot;
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Add options such as sizes (e.g. S, M, L), colors (e.g. Red, Black), or specifications.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenCreateValue}
                      className="text-xs gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5 text-brand" />
                      <span>Add First Value</span>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Order</th>
                          <th className="py-2.5 px-3">Value Name</th>
                          {selectedAttribute.type === "COLOR" && (
                            <th className="py-2.5 px-3">Swatch / Code</th>
                          )}
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                        {selectedAttribute.values.map((val, idx) => (
                          <tr key={val.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                              #{val.displayOrder !== undefined ? val.displayOrder : idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-200">
                              <span className="font-semibold text-white">{val.value}</span>
                            </td>
                            {selectedAttribute.type === "COLOR" && (
                              <td className="py-2.5 px-3">
                                {val.colorCode ? (
                                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-950/60 border border-slate-800 font-mono text-[11px] text-slate-300">
                                    <span
                                      className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0"
                                      style={{ backgroundColor: val.colorCode }}
                                    />
                                    <span>{val.colorCode}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-500 italic">None</span>
                                )}
                              </td>
                            )}
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditValue(val)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Edit Value"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteValue(val)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                  title="Delete Value"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Info Card on Variable Generation */}
                <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-start gap-3 text-xs text-sky-200">
                  <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sky-300">How attributes work in Product Creation:</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      When adding a <strong className="text-slate-200">Variable Product</strong>, select this attribute, check the values you want, and click &quot;Generate Variants&quot;. The system will automatically calculate the multiplication matrix of SKUs and rows for you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center border border-slate-800 bg-slate-900/40 rounded-2xl space-y-2">
              <Layers className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Select an attribute to manage its values</p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: Create / Edit Attribute                                 */}
      {/* ================================================================= */}
      {isAttrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-white">
                  {attrModalMode === "create" ? "Add New Specification Attribute" : "Edit Attribute"}
                </h3>
              </div>
              <button
                onClick={() => setIsAttrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttribute} className="p-4 sm:p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Attribute Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Color, Size, Storage, RAM, Switch Type"
                  value={attrFormName}
                  onChange={(e) => setAttrFormName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Display / Input Type
                </label>
                <select
                  value={attrFormType}
                  onChange={(e) =>
                    setAttrFormType(e.target.value as AttributeDisplayType)
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="SELECT">Dropdown Select (Standard)</option>
                  <option value="BUTTON">Button Pills (Great for Sizes, RAM, Storage)</option>
                  <option value="COLOR">Color Swatch (Visual Color Circles)</option>
                  <option value="RADIO">Radio List</option>
                  <option value="TEXT">Text Field (Custom Spec)</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apparel sizes according to international chart"
                  value={attrFormDescription}
                  onChange={(e) => setAttrFormDescription(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Initial Values (Only in create mode) */}
              {attrModalMode === "create" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Initial Values (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Small, Medium, Large, Extra Large"
                    value={attrFormInitialValues}
                    onChange={(e) => setAttrFormInitialValues(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <p className="text-[11px] text-slate-500">
                    You can also add or customize individual values after creating the attribute.
                  </p>
                </div>
              )}

              {/* Display Order & Active */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={attrFormDisplayOrder}
                    onChange={(e) => setAttrFormDisplayOrder(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="attrActiveCheckbox"
                    checked={attrFormIsActive}
                    onChange={(e) => setAttrFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand"
                  />
                  <label htmlFor="attrActiveCheckbox" className="text-xs text-slate-300 cursor-pointer select-none">
                    Active in Storefront
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAttrModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={attrSubmitting}
                  className="text-xs gap-1.5 font-bold"
                >
                  {attrSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{attrModalMode === "create" ? "Create Attribute" : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: Create / Edit Attribute Value                           */}
      {/* ================================================================= */}
      {isValueModalOpen && selectedAttribute && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {valueModalMode === "create"
                    ? `Add Value to "${selectedAttribute.name}"`
                    : "Edit Attribute Value"}
                </h3>
              </div>
              <button
                onClick={() => setIsValueModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveValue} className="p-4 space-y-4">
              {/* Value Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Value Label / Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedAttribute.type === "COLOR"
                      ? "e.g. Midnight Blue, Crimson Red"
                      : "e.g. XL, 256GB, Silicone"
                  }
                  value={valueFormText}
                  onChange={(e) => setValueFormText(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Color Code Picker (if COLOR type) */}
              {selectedAttribute.type === "COLOR" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Hex Color Code Swatch
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={valueFormColor}
                      onChange={(e) => setValueFormColor(e.target.value)}
                      className="h-9 w-12 rounded border border-slate-800 bg-slate-950 p-1 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      value={valueFormColor}
                      onChange={(e) => setValueFormColor(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>
              )}

              {/* Display Order */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Sort / Display Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={valueFormDisplayOrder}
                  onChange={(e) => setValueFormDisplayOrder(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsValueModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={valueSubmitting}
                  className="text-xs gap-1.5 font-bold"
                >
                  {valueSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{valueModalMode === "create" ? "Add Value" : "Update Value"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
