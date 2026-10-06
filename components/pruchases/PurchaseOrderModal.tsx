"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";

import { ItemSerialized } from "@/components/items/types";
import { SupplierSerialized } from "@/components/suppliers/types";
import { PurchaseOrderSerialized } from "./types";

import {
    createPurchaseOrderAction,
    updatePurchaseOrderAction,
} from "@/actions/purchases";

type Line = {
    id: number;
    item_id: number | null;
    quantity: string;
    unit_price: string;
};

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
    suppliers: SupplierSerialized[];
    items: ItemSerialized[];
    purchaseOrder?: PurchaseOrderSerialized | null;
}

export default function PurchaseOrderModal({
    open,
    onClose,
    onSaved,
    suppliers,
    items,
    purchaseOrder,
}: Props) {
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [orderDate, setOrderDate] = useState("");
    const [expectedDate, setExpectedDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [lines, setLines] = useState<Line[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEdit = !!purchaseOrder;

    const createEmptyLine = (): Line => ({
        id: Date.now() + Math.random(),
        item_id: null,
        quantity: "1",
        unit_price: "",
    });

    const resetForm = () => {
        setSupplierId(null);
        setOrderDate(new Date().toISOString().slice(0, 10));
        setExpectedDate("");
        setRemarks("");
        setLines([createEmptyLine()]);
        setError(null);
    };

    useEffect(() => {
        if (!open) return;

        if (purchaseOrder) {
            setSupplierId(purchaseOrder.supplier_id);
            setOrderDate(purchaseOrder.order_date.slice(0, 10));
            setExpectedDate(purchaseOrder.expected_date?.slice(0, 10) ?? "");
            setRemarks(purchaseOrder.remarks ?? "");

            setLines(
                purchaseOrder.items.map((line) => ({
                    id: line.id,
                    item_id: line.item_id,
                    quantity: String(line.quantity),
                    unit_price: String(line.unit_price),
                }))
            );
        } else {
            resetForm();
        }

        setError(null);
    }, [open, purchaseOrder]);

    const updateLine = (id: number, field: keyof Line, value: string | number | null) => {
        setLines((prev) =>
            prev.map((line) =>
                line.id === id
                    ? { ...line, [field]: value }
                    : line
            )
        );
    };

    const removeLine = (id: number) => {
        setLines((prev) => prev.length > 1 ? prev.filter((line) => line.id !== id) : prev);
    };

    const getItem = (itemId: number | null) => {
        return items.find((item) => item.id === itemId);
    };

    const total = useMemo(() => {
        return lines.reduce((sum, line) => {
            return sum + (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);
        }, 0);
    }, [lines]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!supplierId) return setError("Supplier wajib dipilih.");
        if (!orderDate) return setError("Tanggal PO wajib diisi.");
        if (lines.some((line) => !line.item_id)) return setError("Semua baris harus memiliki item.");
        if (lines.some((line) => Number(line.quantity) <= 0)) return setError("Quantity harus lebih dari 0.");

        try {
            setIsSubmitting(true);

            const payload = {
                supplier_id: supplierId,
                order_date: orderDate,
                expected_date: expectedDate || null,
                remarks: remarks.trim() || null,
                items: lines.map((line) => ({
                    item_id: line.item_id!,
                    quantity: Number(line.quantity),
                    unit_price: Number(line.unit_price) || 0,
                })),
            };

            const result = isEdit
                ? await updatePurchaseOrderAction(purchaseOrder.id, payload)
                : await createPurchaseOrderAction(payload);

            if (!result.success) return setError(result.message);

            await onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            setError("Terjadi kesalahan saat menyimpan Purchase Order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isEdit ? "Edit Purchase Order" : "Tambah Purchase Order"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {isEdit ? purchaseOrder.po_number : "Buat purchase order baru."}
                        </p>
                    </div>

                    <button type="button" onClick={onClose} disabled={isSubmitting}>
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 p-6">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Supplier</label>
                                <select
                                    value={supplierId ?? ""}
                                    onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                >
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Tanggal PO</label>
                                <input
                                    type="date"
                                    value={orderDate}
                                    onChange={(e) => setOrderDate(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Expected Date</label>
                                <input
                                    type="date"
                                    value={expectedDate}
                                    onChange={(e) => setExpectedDate(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                />
                            </div>
                        </div>

                        {/* ITEMS */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">Item PO</h3>
                                    <p className="text-xs text-slate-500">
                                        Quantity menggunakan Purchase UOM item.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setLines((prev) => [...prev, createEmptyLine()])}
                                    className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                                >
                                    <Plus size={16} />
                                    Tambah Item
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full min-w-[850px]">
                                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Item</th>
                                            <th className="px-4 py-3">Purchase UOM</th>
                                            <th className="px-4 py-3">Qty</th>
                                            <th className="px-4 py-3">Unit Price</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                            <th className="w-14 px-4 py-3"></th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {lines.map((line) => {
                                            const selectedItem = getItem(line.item_id);
                                            const subtotal =
                                                (Number(line.quantity) || 0) *
                                                (Number(line.unit_price) || 0);

                                            return (
                                                <tr key={line.id}>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={line.item_id ?? ""}
                                                            onChange={(e) =>
                                                                updateLine(
                                                                    line.id,
                                                                    "item_id",
                                                                    e.target.value ? Number(e.target.value) : null
                                                                )
                                                            }
                                                            className="w-full min-w-[280px] rounded-lg border px-3 py-2 text-sm"
                                                        >
                                                            <option value="">Pilih Item</option>

                                                            {items.map((item) => (
                                                                <option key={item.id} value={item.id}>
                                                                    {item.reference} - {item.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    <td className="px-4 py-3 text-sm">
                                                        {selectedItem?.purchase_uom?.symbol ??
                                                            selectedItem?.purchase_uom?.name ??
                                                            selectedItem?.uom.symbol ??
                                                            selectedItem?.uom.name ??
                                                            "-"}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0.001"
                                                            step="0.001"
                                                            value={line.quantity}
                                                            onChange={(e) => updateLine(line.id, "quantity", e.target.value)}
                                                            className="w-28 rounded-lg border px-3 py-2 text-sm"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={line.unit_price}
                                                            onChange={(e) => updateLine(line.id, "unit_price", e.target.value)}
                                                            className="w-40 rounded-lg border px-3 py-2 text-sm"
                                                            placeholder="0"
                                                        />
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                                                        Rp {new Intl.NumberFormat("id-ID").format(subtotal)}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLine(line.id)}
                                                            className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Remarks</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    rows={3}
                                    className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm"
                                    placeholder="Catatan Purchase Order..."
                                />
                            </div>

                            <div className="rounded-xl bg-slate-50 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Grand Total</span>
                                    <span className="text-xl font-semibold text-slate-900">
                                        Rp {new Intl.NumberFormat("id-ID").format(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border px-4 py-2.5 text-sm"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                isEdit ? "Simpan Perubahan" : "Simpan PO"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}