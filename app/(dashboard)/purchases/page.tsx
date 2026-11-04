"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban, Check, Loader2, PackageCheck, Pencil, ShoppingCart } from "lucide-react";
import { ItemSerialized } from "@/components/items/types";
import { SupplierSerialized } from "@/components/suppliers/types";
import { FilterCategoryOption, TableFilter, TableFilterBar } from "@/components/TableFilterBar";
import { cancelPurchaseOrderAction, confirmPurchaseOrderAction, getPurchaseOrders } from "@/actions/purchases";
import { getItems } from "@/actions/items";
import { getSuppliers } from "@/actions/suppliers";
import { PurchaseOrderSerialized } from "@/components/purchases/types";
import PurchaseOrderModal from "@/components/purchases/PurchaseOrderModal";
import PurchaseReceiptModal from "@/components/purchases/PurchaseReceiptModal";
import PurchaseDetailModal from "@/components/purchases/PurchaseDetailModal";
import { canCancelPurchase, canConfirmPurchase, canEditPurchase, canReceivePurchase } from "@/lib/purchases/status";

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
// import router from "next/router";

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID").format(new Date(value));
}

const PURCHASE_STATUS_META: Record<PurchaseOrderSerialized["status"], { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "border-slate-200 bg-slate-100 text-slate-700" },
    CONFIRMED: { label: "Confirmed", className: "border-blue-200 bg-blue-50 text-blue-700" },
    PARTIALLY_RECEIVED: { label: "Partially Received", className: "border-amber-200 bg-amber-50 text-amber-700" },
    RECEIVED: { label: "Received", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    CANCELLED: { label: "Cancelled", className: "border-red-200 bg-red-50 text-red-700" },
};
const PAYMENT_STATUS_META: Record<PurchaseOrderSerialized["payment_summary"]["status"], { label: string; className: string }> = {
    UNPAID: { label: "Belum Dibayar", className: "border-slate-200 bg-slate-100 text-slate-700" },
    PARTIALLY_PAID: { label: "Dibayar Sebagian", className: "border-amber-200 bg-amber-50 text-amber-700" },
    PAID: { label: "Lunas", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};
type ProcessingAction = { id: number; type: "confirm" | "cancel" } | null;

export default function PurchasesPage() {

    const router = useRouter();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderSerialized[]>([]);
    const [items, setItems] = useState<ItemSerialized[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierSerialized[]>([]);
    const [filters, setFilters] = useState<TableFilter[]>([{ id: 1, category: "po_number", value: "" }]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrderSerialized | null>(null);
    const [processingAction, setProcessingAction] = useState<ProcessingAction>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [receivingPO, setReceivingPO] = useState<PurchaseOrderSerialized | null>(null);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrderSerialized | null>(null);
    const [actionPO, setActionPO] = useState<PurchaseOrderSerialized | null>(null);
    const [actionType, setActionType] = useState<"confirm" | "cancel" | null>(null);

    // ======================================================
    // LOAD DATA
    // ======================================================
    const loadPurchaseOrders = useCallback(async () => {
        const data = await getPurchaseOrders();
        setPurchaseOrders(data);
    }, []);

    const loadMaster = useCallback(async () => {
        const [itemData, supplierData] = await Promise.all([getItems(), getSuppliers()]);
        setItems(itemData);
        setSuppliers(supplierData);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([loadPurchaseOrders(), loadMaster()]);
            } catch (error) {
                console.error("Error loading Purchase Orders:", error);
                setError("Gagal mengambil Purchase Order.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [loadPurchaseOrders, loadMaster]);

    // ======================================================
    // FILTER
    // ======================================================
    const filterOptions: FilterCategoryOption[] = useMemo(() => [
        { value: "po_number", label: "No PO" },
        {
            value: "supplier",
            label: "Supplier",
            inputType: "select",
            options: suppliers.map((supplier) => ({ value: String(supplier.id), label: supplier.name })),
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
        {
            value: "payment_status",
            label: "Pembayaran",
            inputType: "select",
            options: [
                { value: "UNPAID", label: "Belum Dibayar" },
                { value: "PARTIALLY_PAID", label: "Dibayar Sebagian" },
                { value: "PAID", label: "Lunas" },
            ],
        },
    ], [suppliers]);

    const filteredPO = useMemo(() => {
        return purchaseOrders.filter((po) =>
            filters.every((filter) => {
                if (!filter.value) return true;
                if (filter.category === "po_number") return po.po_number.toLowerCase().includes(filter.value.toLowerCase());
                if (filter.category === "supplier") return po.supplier_id === Number(filter.value);
                if (filter.category === "status") return po.status === filter.value;
                if (filter.category === "payment_status") return po.payment_summary.status === filter.value;
                return true;
            })
        );
    }, [purchaseOrders, filters]);

    const addFilter = () => {
        setFilters((prev) => [
            ...prev,
            { id: Math.max(0, ...prev.map((filter) => filter.id)) + 1, category: "po_number", value: "" },
        ]);
    };

    // ======================================================
    // CONFIRM / CANCEL
    // ======================================================
    const handleAction = async () => {
        if (!actionPO || !actionType) return;

        try {
            setError(null);
            setProcessingAction({ id: actionPO.id, type: actionType });

            const result = actionType === "confirm"
                ? await confirmPurchaseOrderAction(actionPO.id)
                : await cancelPurchaseOrderAction(actionPO.id);

            if (!result.success) {
                setError(result.message);
                return;
            }

            await loadPurchaseOrders();

            if (selectedPO?.id === actionPO.id) {
                const updated = (await getPurchaseOrders()).find((po) => po.id === actionPO.id);
                if (updated) setSelectedPO(updated);
            }

            setActionPO(null);
            setActionType(null);
        } catch (error) {
            console.error("Error processing Purchase Order:", error);
            setError("Terjadi kesalahan saat memproses Purchase Order.");
        } finally {
            setProcessingAction(null);
        }
    };

    // ======================================================
    // PAGE
    // ======================================================
    return (
        // <div className="">
        <div className="mx-auto max-w-7xl">
            {/* HEADER */}
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <ShoppingCart size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">Purchase Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola pembelian barang dan jasa dari supplier.</p>
                </div>
            </div>

            {/* FILTER */}
            <div className="mb-4">
                <TableFilterBar
                    categoryOptions={filterOptions}
                    filters={filters}
                    onAddFilter={addFilter}
                    onRemoveFilter={(id) => setFilters((prev) => prev.filter((filter) => filter.id !== id))}
                    onCategoryChange={(id, category) => setFilters((prev) => prev.map((filter) => filter.id === id ? { ...filter, category, value: "" } : filter))}
                    onValueChange={(id, value) => setFilters((prev) => prev.map((filter) => filter.id === id ? { ...filter, value } : filter))}
                    onOpenCreateModal={() => {
                        setEditingPO(null);
                        setIsModalOpen(true);
                    }}
                    createLabel="Tambah PO"
                />
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* TABLE */}
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
                                    <th className="px-5 py-3">Pembayaran</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                    <th className="px-5 py-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {filteredPO.map((po) => {
                                    const statusMeta = PURCHASE_STATUS_META[po.status];
                                    const isProcessing = processingAction?.id === po.id;
                                    const paymentMeta = PAYMENT_STATUS_META[po.payment_summary.status];

                                    return (
                                        <tr key={po.id} onClick={() => router.push(`/purchases/${po.id}`)} className="cursor-pointer transition-colors hover:bg-slate-50">
                                            {/* NO PO */}
                                            <td className="px-5 py-4 font-mono text-sm font-semibold">{po.po_number}</td>

                                            {/* DATE */}
                                            <td className="px-5 py-4 text-sm">{formatDate(po.order_date)}</td>

                                            {/* SUPPLIER */}
                                            <td className="px-5 py-4 text-sm font-medium">{po.supplier.name}</td>

                                            {/* ITEM COUNT */}
                                            <td className="px-5 py-4 text-sm">{po.items.length} Item</td>

                                            {/* STATUS */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                                                    {statusMeta.label}
                                                </span>
                                            </td>

                                            {/* PAYMENT STATUS */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${paymentMeta.className}`}>
                                                    {paymentMeta.label}
                                                </span>
                                            </td>

                                            {/* TOTAL */}
                                            <td className="px-5 py-4 text-right text-sm font-semibold">Rp {formatRupiah(po.total_amount)}</td>

                                            {/* ACTION */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-center gap-1">
                                                    {/* EDIT */}
                                                    {canEditPurchase(po.status) && (
                                                        <button
                                                            type="button"
                                                            title="Edit"
                                                            disabled={isProcessing}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingPO(po);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="rounded-md p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    )}

                                                    {/* CONFIRM */}
                                                    {canConfirmPurchase(po.status) && (
                                                        <button
                                                            type="button"
                                                            title="Confirm"
                                                            disabled={isProcessing}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActionPO(po);
                                                                setActionType("confirm");
                                                            }}
                                                            className="rounded-md p-2 text-slate-500 transition hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                                                        >
                                                            {processingAction?.id === po.id && processingAction.type === "confirm"
                                                                ? <Loader2 size={16} className="animate-spin" />
                                                                : <Check size={16} />}
                                                        </button>
                                                    )}

                                                    {/* RECEIVE */}
                                                    {canReceivePurchase(po.status) && (
                                                        <button
                                                            type="button"
                                                            title={po.status === "PARTIALLY_RECEIVED" ? "Receive Remaining" : "Receive Goods"}
                                                            disabled={isProcessing}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setReceivingPO(po);
                                                            }}
                                                            className="rounded-md p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <PackageCheck size={16} />
                                                        </button>
                                                    )}

                                                    {/* CANCEL */}
                                                    {canCancelPurchase(po.status) && (
                                                        <button
                                                            type="button"
                                                            title="Cancel"
                                                            disabled={isProcessing}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActionPO(po);
                                                                setActionType("cancel");
                                                            }}
                                                            className="rounded-md p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                        >
                                                            {processingAction?.id === po.id && processingAction.type === "cancel"
                                                                ? <Loader2 size={16} className="animate-spin" />
                                                                : <Ban size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!filteredPO.length && (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-sm text-slate-500">Purchase Order tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* </div> */}

            {/* CREATE / EDIT */}
            {/* <PurchaseOrderModal
                open={isModalOpen}
                purchaseOrder={editingPO}
                suppliers={suppliers}
                items={items}
                onSaved={loadPurchaseOrders}
                onClose={() => {
                    setSelectedPO(null);
                    loadPurchaseOrders();
                }}
            /> */}

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
            {/* RECEIVE GOODS */}
            <PurchaseReceiptModal
                open={!!receivingPO}
                purchaseOrder={receivingPO}
                onSaved={loadPurchaseOrders}
                onClose={() => setReceivingPO(null)}
            />

            {/* DETAIL */}
            <PurchaseDetailModal
                purchaseOrder={selectedPO}
                isOpen={!!selectedPO}
                onClose={() => setSelectedPO(null)}
            />

            <AlertDialog
                open={!!actionPO && !!actionType}
                onOpenChange={(open) => {
                    if (!open && !processingAction) {
                        setActionPO(null);
                        setActionType(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionType === "confirm" ? "Konfirmasi Purchase Order?" : "Batalkan Purchase Order?"}
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {actionType === "confirm"
                                ? `${actionPO?.po_number} akan dikonfirmasi dan setelah itu tidak dapat diedit.`
                                : `${actionPO?.po_number} akan dibatalkan. Tindakan ini tidak dapat dibatalkan.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!processingAction}>
                            Kembali
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleAction();
                            }}
                            disabled={!!processingAction}
                            className={actionType === "cancel"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"}
                        >
                            {processingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {actionType === "confirm" ? "Ya, Konfirmasi" : "Ya, Batalkan"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

}
