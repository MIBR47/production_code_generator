"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    Ban,
    Check,
    Loader2,
    Pencil,
    ShoppingCart,
} from "lucide-react";


import { ItemSerialized } from "@/components/items/types";
import { SupplierSerialized } from "@/components/suppliers/types";
import {
    FilterCategoryOption,
    TableFilter,
    TableFilterBar,
} from "@/components/TableFilterBar";

import {
    cancelPurchaseOrderAction,
    confirmPurchaseOrderAction,
    getPurchaseOrders,
} from "@/actions/purchases";

import { getItems } from "@/actions/items";
import { getSuppliers } from "@/actions/suppliers";
import { PurchaseOrderSerialized } from "@/components/purchases/types";
import PurchaseOrderModal from "@/components/purchases/PurchaseOrderModal";

import { PackageCheck } from "lucide-react";
import PurchaseReceiptModal from "@/components/purchases/PurchaseReceiptModal";

import PurchaseDetailModal from "@/components/purchases/PurchaseDetailModal";

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID").format(new Date(value));
}

export default function PurchasesPage() {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderSerialized[]>([]);
    const [items, setItems] = useState<ItemSerialized[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierSerialized[]>([]);
    const [filters, setFilters] = useState<TableFilter[]>([
        { id: 1, category: "po_number", value: "" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrderSerialized | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [receivingPO, setReceivingPO] =
        useState<PurchaseOrderSerialized | null>(null);
    const [selectedPO, setSelectedPO] =
        useState<PurchaseOrderSerialized | null>(null);
    const loadPurchaseOrders = useCallback(async () => {
        setPurchaseOrders(await getPurchaseOrders());
    }, []);

    const loadMaster = useCallback(async () => {
        const [itemData, supplierData] = await Promise.all([
            getItems(),
            getSuppliers(),
        ]);

        setItems(itemData);
        setSuppliers(supplierData);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                await Promise.all([loadPurchaseOrders(), loadMaster()]);
            } catch (error) {
                console.error(error);
                setError("Gagal mengambil Purchase Order.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [loadPurchaseOrders, loadMaster]);

    const filterOptions: FilterCategoryOption[] = useMemo(() => [
        { value: "po_number", label: "No PO" },
        {
            value: "supplier",
            label: "Supplier",
            inputType: "select",
            options: suppliers.map((supplier) => ({
                value: String(supplier.id),
                label: supplier.name,
            })),
        },
        {
            value: "status",
            label: "Status",
            inputType: "select",
            options: [
                { value: "DRAFT", label: "Draft" },
                { value: "CONFIRMED", label: "Confirmed" },
                { value: "PARTIALLY_RECEIVED", label: "Partially Received" },
                { value: "RECEIVED", label: "Received" },
                { value: "CANCELLED", label: "Cancelled" },
            ],
        },
    ], [suppliers]);

    const filteredPO = useMemo(() => {
        return purchaseOrders.filter((po) =>
            filters.every((filter) => {
                if (!filter.value) return true;

                if (filter.category === "po_number") {
                    return po.po_number.toLowerCase().includes(filter.value.toLowerCase());
                }

                if (filter.category === "supplier") {
                    return po.supplier_id === Number(filter.value);
                }

                if (filter.category === "status") {
                    return po.status === filter.value;
                }

                return true;
            })
        );
    }, [purchaseOrders, filters]);

    const addFilter = () => {
        setFilters((prev) => [
            ...prev,
            {
                id: Math.max(0, ...prev.map((filter) => filter.id)) + 1,
                category: "po_number",
                value: "",
            },
        ]);
    };

    const handleAction = async (
        po: PurchaseOrderSerialized,
        type: "confirm" | "cancel"
    ) => {
        const text = type === "confirm"
            ? `Konfirmasi ${po.po_number}? Setelah dikonfirmasi PO tidak dapat diedit.`
            : `Batalkan ${po.po_number}?`;

        if (!window.confirm(text)) return;

        try {
            setProcessingId(po.id);

            const result = type === "confirm"
                ? await confirmPurchaseOrderAction(po.id)
                : await cancelPurchaseOrderAction(po.id);

            if (!result.success) {
                setError(result.message);
                return;
            }

            await loadPurchaseOrders();
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <ShoppingCart size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold">Purchase Orders</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola pembelian barang dan jasa dari supplier.
                        </p>
                    </div>
                </div>

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
                        onOpenCreateModal={() => {
                            setEditingPO(null);
                            setIsModalOpen(true);
                        }}
                        createLabel="Tambah PO"
                    />
                </div>

                {error && (
                    <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border bg-white">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">No PO</th>
                                        <th className="px-5 py-3">Tanggal</th>
                                        <th className="px-5 py-3">Supplier</th>
                                        <th className="px-5 py-3">Items</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {filteredPO.map((po) => (
                                        <tr key={po.id} onClick={() => setSelectedPO(po)} className="hover:bg-slate-50">
                                            <td className="px-5 py-4 font-mono text-sm font-semibold">
                                                {po.po_number}
                                            </td>

                                            <td className="px-5 py-4 text-sm">
                                                {formatDate(po.order_date)}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium">
                                                {po.supplier.name}
                                            </td>

                                            <td className="px-5 py-4 text-sm">
                                                {po.items.length} Item
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                                                    {po.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm font-semibold">
                                                Rp {formatRupiah(po.total_amount)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-center gap-1">
                                                    {po.status === "DRAFT" && (
                                                        <>
                                                            <button
                                                                title="Edit"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingPO(po);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="rounded-md p-2 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                title="Confirm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAction(po, "confirm");
                                                                }}
                                                                className="rounded-md p-2 hover:bg-green-50 hover:text-green-600"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {(po.status === "DRAFT" || po.status === "CONFIRMED") && (
                                                        <button
                                                            title="Cancel"
                                                            disabled={processingId === po.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAction(po, "cancel");
                                                            }}
                                                            className="rounded-md p-2 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            {processingId === po.id
                                                                ? <Loader2 size={16} className="animate-spin" />
                                                                : <Ban size={16} />}
                                                        </button>
                                                    )}
                                                    {(po.status === "CONFIRMED" ||
                                                        po.status === "PARTIALLY_RECEIVED") && (
                                                            <button
                                                                type="button"
                                                                title={
                                                                    po.status === "PARTIALLY_RECEIVED"
                                                                        ? "Receive Remaining"
                                                                        : "Receive Goods"
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setReceivingPO(po);
                                                                }}
                                                                className="rounded-md p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                                                            >
                                                                <PackageCheck size={16} />
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {!filteredPO.length && (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-sm text-slate-500">
                                                Purchase Order tidak ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <PurchaseOrderModal
                open={isModalOpen}
                purchaseOrder={editingPO}
                suppliers={suppliers}
                items={items}
                onSaved={loadPurchaseOrders}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPO(null);
                }}
            />

            <PurchaseReceiptModal
                open={!!receivingPO}
                purchaseOrder={receivingPO}
                onSaved={loadPurchaseOrders}
                onClose={() => setReceivingPO(null)}
            />
            <PurchaseDetailModal
                purchaseOrder={selectedPO}
                isOpen={!!selectedPO}
                onClose={() => setSelectedPO(null)}
            />
        </div>
    );
}