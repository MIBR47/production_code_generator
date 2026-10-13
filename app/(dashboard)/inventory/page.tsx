"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, Loader2 } from "lucide-react";

import {
    InventoryStockSerialized,
    StockMovementSerialized,
} from "@/components/inventory/types";

import { FilterCategoryOption, TableFilter, TableFilterBar } from "@/components/TableFilterBar";
import { getInventoryStock, getStockMovements } from "@/actions/inventory";

const MOVEMENT_LABEL: Record<string, string> = {
    PURCHASE_IN: "Purchase In",
    MANUFACTURING_OUT: "Manufacturing Out",
    MANUFACTURING_IN: "Manufacturing In",
    ADJUSTMENT_IN: "Adjustment In",
    ADJUSTMENT_OUT: "Adjustment Out",
    RETURN_IN: "Return In",
    RETURN_OUT: "Return Out",
};

function formatQty(value: number) {
    return value.toLocaleString("id-ID", {
        maximumFractionDigits: 3,
    });
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function InventoryPage() {
    const [stocks, setStocks] = useState<InventoryStockSerialized[]>([]);
    const [movements, setMovements] = useState<StockMovementSerialized[]>([]);
    const [filters, setFilters] = useState<TableFilter[]>([
        { id: 1, category: "item", value: "" },
    ]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        const [stockData, movementData] = await Promise.all([
            getInventoryStock(),
            getStockMovements(),
        ]);

        setStocks(stockData);
        setMovements(movementData);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                await loadData();
            } catch (error) {
                console.error("Error loading inventory:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [loadData]);

    const filterOptions: FilterCategoryOption[] = useMemo(() => [
        { value: "item", label: "Item" },
        { value: "reference", label: "Reference" },
        {
            value: "movement_type",
            label: "Movement Type",
            inputType: "select",
            options: [
                { value: "PURCHASE_IN", label: "Purchase In" },
                { value: "MANUFACTURING_OUT", label: "Manufacturing Out" },
                { value: "MANUFACTURING_IN", label: "Manufacturing In" },
                { value: "ADJUSTMENT_IN", label: "Adjustment In" },
                { value: "ADJUSTMENT_OUT", label: "Adjustment Out" },
                { value: "RETURN_IN", label: "Return In" },
                { value: "RETURN_OUT", label: "Return Out" },
            ],
        },
        { value: "lot", label: "Lot Number" },
    ], []);

    const filteredMovements = useMemo(() => {
        return movements.filter((movement) =>
            filters.every((filter) => {
                if (!filter.value) return true;

                const keyword = filter.value.toLowerCase();

                switch (filter.category) {
                    case "item":
                        return movement.item.name.toLowerCase().includes(keyword);
                    case "reference":
                        return (
                            movement.item.reference.toLowerCase().includes(keyword) ||
                            movement.reference?.toLowerCase().includes(keyword) === true
                        );
                    case "movement_type":
                        return movement.movement_type === filter.value;
                    case "lot":
                        return movement.lot?.lot_number.toLowerCase().includes(keyword) ?? false;
                    default:
                        return true;
                }
            })
        );
    }, [movements, filters]);

    const addFilter = () => {
        setFilters((prev) => [
            ...prev,
            {
                id: Math.max(0, ...prev.map((filter) => filter.id)) + 1,
                category: "item",
                value: "",
            },
        ]);
    };

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <Loader2 size={28} className="animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Boxes size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Lihat current stock dan seluruh pergerakan inventory.
                        </p>
                    </div>
                </div>

                {/* STOCK SUMMARY */}
                <div className="mb-6 overflow-hidden rounded-xl border bg-white">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-semibold text-slate-900">Current Stock</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Stock dihitung dari seluruh Stock Movement.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Reference</th>
                                    <th className="px-5 py-3">Item</th>
                                    <th className="px-5 py-3">Group</th>
                                    <th className="px-5 py-3">Tracking</th>
                                    <th className="px-5 py-3 text-right">Stock</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {stocks.map((stock) => (
                                    <tr key={stock.item_id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 font-mono text-sm font-semibold">
                                            {stock.reference}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium">
                                            {stock.name}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {stock.group.name}
                                        </td>

                                        <td className="px-5 py-4 text-sm">
                                            {stock.tracking}
                                        </td>

                                        <td className="px-5 py-4 text-right text-sm font-semibold">
                                            {formatQty(stock.stock)} {stock.uom.symbol ?? stock.uom.name}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MOVEMENT FILTER */}
                <div className="mb-4">
                    <TableFilterBar
                        categoryOptions={filterOptions}
                        filters={filters}
                        onAddFilter={addFilter}
                        onRemoveFilter={(id) =>
                            setFilters((prev) => prev.filter((filter) => filter.id !== id))
                        }
                        onCategoryChange={(id, category) =>
                            setFilters((prev) =>
                                prev.map((filter) =>
                                    filter.id === id
                                        ? { ...filter, category, value: "" }
                                        : filter
                                )
                            )
                        }
                        onValueChange={(id, value) =>
                            setFilters((prev) =>
                                prev.map((filter) =>
                                    filter.id === id
                                        ? { ...filter, value }
                                        : filter
                                )
                            )
                        }
                        searchPlaceholder="Cari stock movement..."
                    />
                </div>

                {/* MOVEMENTS */}
                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-semibold text-slate-900">Stock Movements</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Item</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Lot</th>
                                    <th className="px-5 py-3">Reference</th>
                                    <th className="px-5 py-3 text-right">Qty</th>
                                    <th className="px-5 py-3">Remarks</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {filteredMovements.map((movement) => {
                                    const isIn = movement.quantity > 0;

                                    return (
                                        <tr key={movement.id} className="hover:bg-slate-50">
                                            <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                {formatDate(movement.movement_date)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium">{movement.item.name}</p>
                                                <p className="text-xs text-slate-400">{movement.item.reference}</p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                {MOVEMENT_LABEL[movement.movement_type] ?? movement.movement_type}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 font-mono text-sm">
                                                {movement.lot?.lot_number ?? "-"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 font-mono text-sm">
                                                {movement.reference ?? "-"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-right">
                                                <span
                                                    className={
                                                        isIn
                                                            ? "inline-flex items-center gap-1 font-semibold text-emerald-600"
                                                            : "inline-flex items-center gap-1 font-semibold text-red-600"
                                                    }
                                                >
                                                    {isIn
                                                        ? <ArrowDownToLine size={15} />
                                                        : <ArrowUpFromLine size={15} />}

                                                    {movement.quantity > 0 ? "+" : ""}
                                                    {formatQty(movement.quantity)}{" "}
                                                    {movement.uom.symbol ?? movement.uom.name}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {movement.remarks ?? "-"}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!filteredMovements.length && (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-sm text-slate-500">
                                            Stock movement tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}