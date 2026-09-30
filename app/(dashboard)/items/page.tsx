"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Package } from "lucide-react";

import ItemModal from "@/components/items/ItemModal";
import { TableFilterBar, TableFilter, FilterCategoryOption } from "@/components/TableFilterBar";
import { Pencil, Power } from "lucide-react";
import { deactivateItemAction } from "@/actions/items";

import {
    ItemCategory,
    ItemGroupSerialized,
    ItemSerialized,
    UnitOfMeasureSerialized,
} from "@/components/items/types";

import { getItemGroups, getItems, getUnitOfMeasures } from "@/actions/items";

// const ITEM_FILTER_OPTIONS: FilterCategoryOption[] = [
//     { value: "name", label: "Nama Item" },
//     { value: "reference", label: "Reference" },
//     { value: "category", label: "Category" },
//     { value: "group", label: "Group" },
//     { value: "item_type", label: "Item Type" },
//     { value: "uom", label: "UOM" },
//     { value: "purchase_uom", label: "Purchase UOM" },
//     { value: "tracking", label: "Tracking" },
// ];



function getCategoryLabel(category: ItemCategory) {
    switch (category) {
        case "RAW_MATERIAL":
            return "Raw Material";
        case "SUPPORTING_MATERIAL":
            return "Supporting Material";
        case "SERVICE":
            return "Service";
        default:
            return category;
    }
}

function getItemTypeLabel(type: ItemSerialized["item_type"]) {
    switch (type) {
        case "STORABLE":
            return "Storable";
        case "CONSUMABLE":
            return "Consumable";
        case "SERVICE":
            return "Service";
        default:
            return type;
    }
}

function formatRupiah(value: number | string) {
    return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function getFilterValue(item: ItemSerialized, category: string) {
    switch (category) {
        case "name":
            return item.name;
        case "reference":
            return item.reference;
        case "category":
            return `${item.category} ${getCategoryLabel(item.category)}`;
        case "group":
            return item.group.name;
        case "item_type":
            return `${item.item_type} ${getItemTypeLabel(item.item_type)}`;
        case "uom":
            return `${item.uom.name} ${item.uom.symbol ?? ""}`;
        case "purchase_uom":
            return item.purchase_uom
                ? `${item.purchase_uom.name} ${item.purchase_uom.symbol ?? ""}`
                : "";
        case "tracking":
            return item.tracking;
        default:
            return "";
    }
}

export default function ItemsPage() {
    const [items, setItems] = useState<ItemSerialized[]>([]);
    const [groups, setGroups] = useState<ItemGroupSerialized[]>([]);
    const [uoms, setUoms] = useState<UnitOfMeasureSerialized[]>([]);
    const [filters, setFilters] = useState<TableFilter[]>([
        { id: 1, category: "name", value: "" },
    ]);

    const [editingItem, setEditingItem] = useState<ItemSerialized | null>(null);
    const [isDeactivating, setIsDeactivating] = useState<number | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = useCallback(async () => {
        const data = await getItems();
        setItems(data);
    }, []);

    const loadMasterData = useCallback(async () => {
        const [groupData, uomData] = await Promise.all([
            getItemGroups(),
            getUnitOfMeasures(),
        ]);

        setGroups(groupData);
        setUoms(uomData);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([loadItems(), loadMasterData()]);
            } catch (error) {
                console.error(error);
                setError("Gagal mengambil data item.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [loadItems, loadMasterData]);

    const handleAddFilter = () => {
        setFilters((prev) => {
            const nextId = Math.max(0, ...prev.map((filter) => filter.id)) + 1;

            return [
                ...prev,
                {
                    id: nextId,
                    category: "name",
                    value: "",
                },
            ];
        });
    };

    const handleRemoveFilter = (id: number) => {
        setFilters((prev) => prev.filter((filter) => filter.id !== id));
    };

    const handleCategoryChange = (id: number, category: string) => {
        setFilters((prev) =>
            prev.map((filter) =>
                filter.id === id
                    ? { ...filter, category, value: "" }
                    : filter
            )
        );
    };

    const handleValueChange = (id: number, value: string) => {
        setFilters((prev) =>
            prev.map((filter) =>
                filter.id === id
                    ? { ...filter, value }
                    : filter
            )
        );
    };

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            return filters.every((filter) => {
                if (!filter.value) return true;

                const keyword = filter.value.toLowerCase();

                switch (filter.category) {
                    case "name":
                        return item.name.toLowerCase().includes(keyword);

                    case "reference":
                        return item.reference.toLowerCase().includes(keyword);

                    case "category":
                        return item.category === filter.value;

                    case "group":
                        return item.group_id === Number(filter.value);

                    case "item_type":
                        return item.item_type === filter.value;

                    case "uom":
                        return item.uom_id === Number(filter.value);

                    case "purchase_uom":
                        return item.purchase_uom_id === Number(filter.value);

                    case "tracking":
                        return item.tracking === filter.value;

                    default:
                        return true;
                }
            });
        });
    }, [items, filters]);

    const itemFilterOptions: FilterCategoryOption[] = useMemo(() => [
        {
            value: "name",
            label: "Nama Item",
            inputType: "text",
        },
        {
            value: "reference",
            label: "Reference",
            inputType: "text",
        },
        {
            value: "category",
            label: "Category",
            inputType: "select",
            options: [
                { value: "RAW_MATERIAL", label: "Raw Material" },
                { value: "SUPPORTING_MATERIAL", label: "Supporting Material" },
                { value: "SERVICE", label: "Service" },
            ],
        },
        {
            value: "group",
            label: "Group",
            inputType: "select",
            options: groups.map((group) => ({
                value: String(group.id),
                label: group.name,
            })),
        },
        {
            value: "item_type",
            label: "Item Type",
            inputType: "select",
            options: [
                { value: "STORABLE", label: "Storable" },
                { value: "CONSUMABLE", label: "Consumable" },
                { value: "SERVICE", label: "Service" },
            ],
        },
        {
            value: "uom",
            label: "Inventory UOM",
            inputType: "select",
            options: uoms.map((uom) => ({
                value: String(uom.id),
                label: uom.symbol ? `${uom.name} (${uom.symbol})` : uom.name,
            })),
        },
        {
            value: "purchase_uom",
            label: "Purchase UOM",
            inputType: "select",
            options: uoms.map((uom) => ({
                value: String(uom.id),
                label: uom.symbol ? `${uom.name} (${uom.symbol})` : uom.name,
            })),
        },
        {
            value: "tracking",
            label: "Tracking",
            inputType: "select",
            options: [
                { value: "NONE", label: "None" },
                { value: "LOT", label: "Lot / Roll / Batch" },
            ],
        },
    ], [groups, uoms]);

    const handleItemCreated = useCallback(async () => {
        await Promise.all([
            loadItems(),
            loadMasterData(),
        ]);
    }, [loadItems, loadMasterData]);

    const handleOpenCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: ItemSerialized) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeactivate = async (item: ItemSerialized) => {
        const confirmed = window.confirm(
            `Nonaktifkan item "${item.name}" (${item.reference})?`
        );

        if (!confirmed) return;

        try {
            setIsDeactivating(item.id);
            setError(null);

            const result = await deactivateItemAction(item.id);

            if (!result.success) {
                setError(result.message);
                return;
            }

            await loadItems();
        } catch (error) {
            console.error(error);
            setError("Gagal menonaktifkan item.");
        } finally {
            setIsDeactivating(null);
        }
    };
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Package size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Items</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola raw material, supporting material, dan service.
                        </p>
                    </div>
                </div>

                {/* FILTER */}
                <div className="mb-4">
                    <TableFilterBar
                        categoryOptions={itemFilterOptions}
                        filters={filters}
                        onAddFilter={handleAddFilter}
                        onRemoveFilter={handleRemoveFilter}
                        onCategoryChange={handleCategoryChange}
                        onValueChange={handleValueChange}
                        searchPlaceholder="Masukkan nilai filter..."
                        onOpenCreateModal={handleOpenCreate}
                        createLabel="Tambah Item"
                    />
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-3">
                            <Loader2 size={28} className="animate-spin text-slate-400" />
                            <span className="text-sm text-slate-500">Memuat data item...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <th className="px-5 py-3">Reference</th>
                                        <th className="px-5 py-3">Item</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3">Group</th>
                                        <th className="px-5 py-3">Type</th>
                                        <th className="px-5 py-3">UOM</th>
                                        <th className="px-5 py-3">Purchase UOM</th>
                                        <th className="px-5 py-3">Default Qty</th>
                                        <th className="px-5 py-3">Tracking</th>
                                        <th className="px-5 py-3 text-right">Cost</th>
                                        <th className="px-5 py-3 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="transition hover:bg-slate-50">
                                            <td className="whitespace-nowrap px-5 py-4 font-mono text-sm font-semibold text-slate-700">
                                                {item.reference}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                {item.name}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                    {getCategoryLabel(item.category)}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {item.group.name}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {getItemTypeLabel(item.item_type)}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                                    {item.uom.symbol ?? item.uom.name}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                {item.purchase_uom ? (
                                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                                        {item.purchase_uom.symbol ?? item.purchase_uom.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {item.default_purchase_qty ?? "-"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                {item.tracking === "LOT" ? (
                                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                        LOT
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                                        NONE
                                                    </span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-700">
                                                Rp {formatRupiah(item.cost)}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit Item"
                                                        className="rounded-md p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivate(item)}
                                                        disabled={isDeactivating === item.id}
                                                        title="Deactivate Item"
                                                        className="rounded-md p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                    >
                                                        {isDeactivating === item.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Power size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredItems.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="px-5 py-16 text-center">
                                                <Package size={32} className="mx-auto mb-3 text-slate-300" />
                                                <p className="text-sm font-medium text-slate-600">
                                                    Item tidak ditemukan
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Coba ubah filter yang digunakan.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ItemModal
                open={isModalOpen}
                item={editingItem}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                groups={groups}
                uoms={uoms}
                onCreated={handleItemCreated}
                onMasterUpdated={loadMasterData}
            />
        </div>
    );
}