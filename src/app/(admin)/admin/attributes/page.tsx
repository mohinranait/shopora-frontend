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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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

  // Delete Confirmation States
  const [attrToDelete, setAttrToDelete] = useState<IAttribute | null>(null);
  const [isDeletingAttr, setIsDeletingAttr] = useState(false);

  const confirmDeleteAttribute = async () => {
    if (!attrToDelete) return;
    try {
      setIsDeletingAttr(true);
      await deleteAttribute(attrToDelete.id).unwrap();
      toast.success(`Attribute "${attrToDelete.name}" removed.`);
      if (String(selectedAttributeId) === String(attrToDelete.id)) {
        const remaining = attributes.filter((a) => a.id !== attrToDelete.id);
        setSelectedAttributeId(remaining.length > 0 ? remaining[0].id : null);
      }
      setAttrToDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeletingAttr(false);
    }
  };

  const [valToDelete, setValToDelete] = useState<IAttributeValue | null>(null);
  const [isDeletingVal, setIsDeletingVal] = useState(false);

  const confirmDeleteValue = async () => {
    if (!valToDelete) return;
    try {
      setIsDeletingVal(true);
      await deleteAttributeValue(valToDelete.id).unwrap();
      toast.success(`Value "${valToDelete.value}" deleted.`);
      setValToDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeletingVal(false);
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Dropdown Select</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Attributes & Specifications
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Global Catalog
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
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
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Attributes
              </p>
              <p className="text-2xl font-black text-foreground mt-1">{totalAttributes}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Attribute Values
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{totalValues}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
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
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Attribute Groups ({filteredAttributes.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">Click to view values</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search attributes by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Attributes Scrollable Stack */}
          {loading ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-border">
              <Loader2 className="h-6 w-6 text-sky-400 animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">Loading attributes...</p>
            </div>
          ) : filteredAttributes.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-2">
              <Layers className="h-8 w-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-medium text-muted-foreground">No attributes found</p>
              <p className="text-[11px] text-muted-foreground">
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
 ? "bg-brand/10 border-brand "
 : "bg-card hover:bg-muted/40 border-border hover:border-border/80 "
 }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground truncate">{attr.name}</p>
                          <span className="text-[10px] font-mono text-muted-foreground">({attr.slug})</span>
                          {!attr.isActive && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-rose-500/40 text-rose-400">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          {renderTypeBadge(attr.type)}
                          <span className="text-[11px] text-muted-foreground">
                            {attr.values?.length || 0} values defined
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditAttr(attr, e)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                          title="Edit Attribute"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttrToDelete(attr);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-muted transition"
                          title="Delete Attribute"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
 isSelected ? "text-brand translate-x-0.5" : "text-muted-foreground/60"
 }`}
                        />
                      </div>
                    </div>

                    {/* Value Preview Pills */}
                    {attr.values && attr.values.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-border flex flex-wrap gap-1">
                        {attr.values.slice(0, 5).map((val) => (
                          <span
                            key={val.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground border border-border font-mono"
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
                          <span className="text-[10px] text-muted-foreground self-center pl-1 font-medium">
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
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-black text-foreground">
                      {selectedAttribute.name} Values
                    </CardTitle>
                    {renderTypeBadge(selectedAttribute.type)}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
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
                  <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl space-y-3">
                    <Tag className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        No values configured for &quot;{selectedAttribute.name}&quot;
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
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
                  <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50 border-b border-border">
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="py-2.5 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Order</TableHead>
                          <TableHead className="py-2.5 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Value Name</TableHead>
                          {selectedAttribute.type === "COLOR" && (
                            <TableHead className="py-2.5 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Swatch / Code</TableHead>
                          )}
                          <TableHead className="py-2.5 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-border bg-card">
                        {selectedAttribute.values.map((val, idx) => (
                          <TableRow key={val.id} className="border-border hover:bg-muted/40 transition">
                            <TableCell className="py-2.5 px-3 font-mono text-muted-foreground text-[11px]">
                              #{val.displayOrder !== undefined ? val.displayOrder : idx + 1}
                            </TableCell>
                            <TableCell className="py-2.5 px-3 font-medium text-foreground">
                              <span className="font-semibold text-foreground">{val.value}</span>
                            </TableCell>
                            {selectedAttribute.type === "COLOR" && (
                              <TableCell className="py-2.5 px-3">
                                {val.colorCode ? (
                                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-muted/60 border border-border font-mono text-[11px] text-foreground">
                                    <span
                                      className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0"
                                      style={{ backgroundColor: val.colorCode }}
                                    />
                                    <span>{val.colorCode}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground italic">None</span>
                                )}
                              </TableCell>
                            )}
                            <TableCell className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditValue(val)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  title="Edit Value"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setValToDelete(val)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-muted"
                                  title="Delete Value"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Info Card on Variable Generation */}
                <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-start gap-3 text-xs text-sky-200">
                  <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sky-300">How attributes work in Product Creation:</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      When adding a <strong className="text-foreground">Variable Product</strong>, select this attribute, check the values you want, and click &quot;Generate Variants&quot;. The system will automatically calculate the multiplication matrix of SKUs and rows for you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center border border-border bg-card rounded-2xl space-y-2">
              <Layers className="h-10 w-10 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-bold text-foreground">Select an attribute to manage its values</p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: Create / Edit Attribute                                 */}
      {/* ================================================================= */}
      <Dialog open={isAttrModalOpen} onOpenChange={setIsAttrModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand" />
              <span>{attrModalMode === "create" ? "Add New Specification Attribute" : "Edit Attribute"}</span>
            </DialogTitle>
            <DialogDescription>
              Configure attribute key, input presentation type, and storefront visibility.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAttribute} className="space-y-4 py-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="attr-name">
                Attribute Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="attr-name"
                type="text"
                required
                placeholder="e.g. Color, Size, Storage, RAM, Switch Type"
                value={attrFormName}
                onChange={(e) => setAttrFormName(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="attr-type">Display / Input Type</Label>
              <Select
                value={attrFormType}
                onValueChange={(val) => setAttrFormType(val as AttributeDisplayType)}
              >
                <SelectTrigger id="attr-type">
                  <SelectValue placeholder="Select Display Type">
                    {attrFormType === "SELECT"
                      ? "Dropdown Select (Standard)"
                      : attrFormType === "BUTTON"
                      ? "Button Pills (Sizes, RAM, Storage)"
                      : attrFormType === "COLOR"
                      ? "Color Swatch (Visual Color Circles)"
                      : attrFormType === "RADIO"
                      ? "Radio List"
                      : "Text Field (Custom Spec)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELECT">Dropdown Select (Standard)</SelectItem>
                  <SelectItem value="BUTTON">Button Pills (Sizes, RAM, Storage)</SelectItem>
                  <SelectItem value="COLOR">Color Swatch (Visual Color Circles)</SelectItem>
                  <SelectItem value="RADIO">Radio List</SelectItem>
                  <SelectItem value="TEXT">Text Field (Custom Spec)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="attr-desc">Description (Optional)</Label>
              <Input
                id="attr-desc"
                type="text"
                placeholder="e.g. Apparel sizes according to international chart"
                value={attrFormDescription}
                onChange={(e) => setAttrFormDescription(e.target.value)}
              />
            </div>

            {/* Initial Values (Only in create mode) */}
            {attrModalMode === "create" && (
              <div className="space-y-1.5">
                <Label htmlFor="attr-init-vals">Initial Values (Comma-separated)</Label>
                <Input
                  id="attr-init-vals"
                  type="text"
                  placeholder="e.g. Small, Medium, Large, Extra Large"
                  value={attrFormInitialValues}
                  onChange={(e) => setAttrFormInitialValues(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  You can also add or customize individual values after creating the attribute.
                </p>
              </div>
            )}

            {/* Display Order & Active */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="attr-order">Display Order</Label>
                <Input
                  id="attr-order"
                  type="number"
                  min={0}
                  value={attrFormDisplayOrder}
                  onChange={(e) => setAttrFormDisplayOrder(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30 h-9">
                <span className="text-xs font-semibold text-foreground">Active in Store</span>
                <Switch
                  checked={attrFormIsActive}
                  onCheckedChange={setAttrFormIsActive}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <DialogFooter className="pt-3 border-t border-border gap-2">
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================================================= */}
      {/* MODAL 2: Create / Edit Attribute Value                           */}
      {/* ================================================================= */}
      <Dialog open={isValueModalOpen && Boolean(selectedAttribute)} onOpenChange={setIsValueModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-emerald-500" />
              <span>
                {valueModalMode === "create"
                  ? `Add Value to "${selectedAttribute?.name}"`
                  : "Edit Attribute Value"}
              </span>
            </DialogTitle>
            <DialogDescription>
              Define item label, sort order, and optional color swatch hex code.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveValue} className="space-y-4 py-1">
            {/* Value Name */}
            <div className="space-y-1.5">
              <Label htmlFor="val-name">
                Value Label / Text <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="val-name"
                type="text"
                required
                placeholder={
                  selectedAttribute?.type === "COLOR"
                    ? "e.g. Midnight Blue, Crimson Red"
                    : "e.g. XL, 256GB, Silicone"
                }
                value={valueFormText}
                onChange={(e) => setValueFormText(e.target.value)}
              />
            </div>

            {/* Color Code Picker (if COLOR type) */}
            {selectedAttribute?.type === "COLOR" && (
              <div className="space-y-1.5">
                <Label htmlFor="val-color">Hex Color Code Swatch</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="val-color"
                    value={valueFormColor}
                    onChange={(e) => setValueFormColor(e.target.value)}
                    className="h-9 w-12 rounded border border-border bg-card p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    placeholder="#000000"
                    value={valueFormColor}
                    onChange={(e) => setValueFormColor(e.target.value)}
                    className="flex-1 font-mono uppercase"
                  />
                </div>
              </div>
            )}

            {/* Display Order */}
            <div className="space-y-1.5">
              <Label htmlFor="val-order">Sort / Display Order</Label>
              <Input
                id="val-order"
                type="number"
                min={0}
                value={valueFormDisplayOrder}
                onChange={(e) => setValueFormDisplayOrder(Number(e.target.value))}
              />
            </div>

            {/* Action Buttons */}
            <DialogFooter className="pt-2 border-t border-border gap-2">
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Attribute Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(attrToDelete)}
        onClose={() => setAttrToDelete(null)}
        onConfirm={confirmDeleteAttribute}
        isLoading={isDeletingAttr}
        title="Delete Attribute"
        description={`Are you sure you want to permanently delete attribute "${attrToDelete?.name}" and all of its values? Any product variants utilizing this attribute will be affected.`}
        confirmText="Delete Attribute"
        variant="danger"
      />

      {/* Delete Value Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(valToDelete)}
        onClose={() => setValToDelete(null)}
        onConfirm={confirmDeleteValue}
        isLoading={isDeletingVal}
        title="Delete Attribute Value"
        description={`Are you sure you want to delete value "${valToDelete?.value}" from ${selectedAttribute?.name || "this attribute"}?`}
        confirmText="Delete Value"
        variant="danger"
      />
    </div>
  );
}
