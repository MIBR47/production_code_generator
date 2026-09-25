"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Package, Plus, Search } from "lucide-react";

import ItemModal from "@/components/items/ItemModal";
import {
    ItemCategory,
    ItemGroupSerialized,
    ItemSerialized,
    UnitOfMeasureSerialized,
} from "@/components/items/types";

import { getItemGroups, getItems, getUnitOfMeasures } from "@/actions/items";

type CategoryFilter = "ALL" | ItemCategory;

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
    { value: "ALL", label: "Semua" },
    { value: "RAW_MATERIAL", label: "Raw Material" },
    { value: "SUPPORTING_MATERIAL", label: "Supporting Material" },
    { value: "SERVICE", label: "Service" },
];

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

export default function ItemsPage() {
    const [items, setItems] = useState<ItemSerialized[]>([]);
    const [groups, setGroups] = useState<ItemGroupSerialized[]>([]);
    const [uoms, setUoms] = useState<UnitOfMeasureSerialized[]>([]);

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = useCallback(async () => {
        try {
            const data = await getItems();
            setItems(data);
        } catch (error) {
            console.error("Error loading items:", error);
            throw error;
        }
    }, []);

    const loadMasterData = useCallback(async () => {
        try {
            const [groupData, uomData] = await Promise.all([
                getItemGroups(),
                getUnitOfMeasures(),
            ]);

            setGroups(groupData);
            setUoms(uomData);
        } catch (error) {
            console.error("Error loading item master:", error);
            throw error;
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                await Promise.all([
                    loadItems(),
                    loadMasterData(),
                ]);
            } catch (error) {
                console.error(error);
                setError("Gagal mengambil data item.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [loadItems, loadMasterData]);

    const filteredItems = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchCategory =
                activeCategory === "ALL" ||
                item.category === activeCategory;

            const matchSearch =
                !keyword ||
                item.name.toLowerCase().includes(keyword) ||
                item.reference.toLowerCase().includes(keyword) ||
                item.group.name.toLowerCase().includes(keyword);

            return matchCategory && matchSearch;
        });
    }, [items, search, activeCategory]);

    const handleItemCreated = useCallback(async () => {
        await loadItems();

        // Refresh group karena last_number berubah setelah create item.
        const groupData = await getItemGroups();
        setGroups(groupData);
    }, [loadItems]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Package size={22} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Items</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Kelola raw material, supporting material, dan service.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <Plus size={18} />
                        Tambah Item
                    </button>
                </div>

                {/* FILTER CATEGORY */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {CATEGORY_TABS.map((tab) => {
                        const active = activeCategory === tab.value;

                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveCategory(tab.value)}
                                className={
                                    active
                                        ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                                        : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                }
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* SEARCH */}
                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="relative max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, reference, atau group..."
                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </div>
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
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="transition hover:bg-slate-50">
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="font-mono text-sm font-semibold text-slate-700">
                                                    {item.reference}
                                                </span>
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
                                        </tr>
                                    ))}

                                    {filteredItems.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-5 py-16 text-center">
                                                <Package
                                                    size={32}
                                                    className="mx-auto mb-3 text-slate-300"
                                                />

                                                <p className="text-sm font-medium text-slate-600">
                                                    Item tidak ditemukan
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Coba ubah pencarian atau category filter.
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
                onClose={() => setIsModalOpen(false)}
                groups={groups}
                uoms={uoms}
                onCreated={handleItemCreated}
            />
        </div>
    );
}