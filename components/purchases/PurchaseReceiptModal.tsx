"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, PackageCheck, Plus, Trash2, X } from "lucide-react";

import {
    PurchaseOrderReceiptData,
    PurchaseOrderSerialized,
} from "./types";

import {
    createPurchaseReceiptAction,
    getPurchaseOrderForReceipt,
} from "@/actions/purchases";

type ReceiptLine = {
    id: string;
    purchase_order_item_id: number;
    purchase_qty: string;
    actual_qty: string;
    lot_number: string;
};

interface Props {
    open: boolean;
    purchaseOrder: PurchaseOrderSerialized | null;
    onClose: () => void;
    onSaved: () => Promise<void>;
}

export default function PurchaseReceiptModal({
    open,
    purchaseOrder,
    onClose,
    onSaved,
}: Props) {
    const [data, setData] = useState<PurchaseOrderReceiptData | null>(null);
    const [lines, setLines] = useState<ReceiptLine[]>([]);
    const [receiptDate, setReceiptDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createId = () => `${Date.now()}-${Math.random()}`;

    const getActualSuggestion = (poItemId: number, purchaseQty: number) => {
        const poItem = data?.items.find((item) => item.id === poItemId);
        if (!poItem) return purchaseQty;

        if (poItem.item.default_purchase_qty) {
            return purchaseQty * poItem.item.default_purchase_qty;
        }

        return purchaseQty;
    };

    useEffect(() => {
        if (!open || !purchaseOrder) return;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await getPurchaseOrderForReceipt(purchaseOrder.id);

                if (!result) {
                    setError("Purchase Order tidak ditemukan.");
                    return;
                }

                setData(result);
                setReceiptDate(new Date().toISOString().slice(0, 10));
                setRemarks("");

                const initialLines: ReceiptLine[] = result.items
                    .filter((item) => item.remaining_qty > 0)
                    .map((item) => {
                        const purchaseQty =
                            item.item.tracking === "LOT"
                                ? Math.min(1, item.remaining_qty)
                                : item.remaining_qty;

                        const actualQty = item.item.default_purchase_qty
                            ? purchaseQty * item.item.default_purchase_qty
                            : purchaseQty;

                        return {
                            id: createId(),
                            purchase_order_item_id: item.id,
                            purchase_qty: String(purchaseQty),
                            actual_qty: String(actualQty),
                            lot_number: "",
                        };
                    });

                setLines(initialLines);
            } catch (error) {
                console.error(error);
                setError("Gagal mengambil data penerimaan.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [open, purchaseOrder]);

    const updatePurchaseQty = (id: string, value: string) => {
        setLines((prev) =>
            prev.map((line) => {
                if (line.id !== id) return line;

                const qty = Number(value) || 0;

                return {
                    ...line,
                    purchase_qty: value,
                    actual_qty: String(
                        getActualSuggestion(line.purchase_order_item_id, qty)
                    ),
                };
            })
        );
    };

    const updateLine = (
        id: string,
        field: "actual_qty" | "lot_number",
        value: string
    ) => {
        setLines((prev) =>
            prev.map((line) =>
                line.id === id
                    ? { ...line, [field]: value }
                    : line
            )
        );
    };

    const addLot = (poItemId: number) => {
        const suggested = getActualSuggestion(poItemId, 1);

        setLines((prev) => [
            ...prev,
            {
                id: createId(),
                purchase_order_item_id: poItemId,
                purchase_qty: "1",
                actual_qty: String(suggested),
                lot_number: "",
            },
        ]);
    };

    const removeLine = (id: string) => {
        setLines((prev) => prev.filter((line) => line.id !== id));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!purchaseOrder) return;

        const submittedLines = lines.filter(
            (line) => Number(line.purchase_qty) > 0
        );

        if (!submittedLines.length) {
            return setError("Tidak ada barang yang diterima.");
        }

        for (const line of submittedLines) {
            const poItem = data?.items.find(
                (item) => item.id === line.purchase_order_item_id
            );

            if (Number(line.actual_qty) <= 0) {
                return setError("Actual Qty harus lebih dari 0.");
            }

            // if (poItem?.item.tracking === "LOT" && !line.lot_number.trim()) {
            //     return setError(
            //         `Lot Number ${poItem.item.name} wajib diisi.`
            //     );
            // }
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const result = await createPurchaseReceiptAction({
                purchase_order_id: purchaseOrder.id,
                receipt_date: receiptDate,
                remarks: remarks.trim() || null,

                items: submittedLines.map((line) => ({
                    purchase_order_item_id: line.purchase_order_item_id,
                    received_purchase_qty: Number(line.purchase_qty),
                    actual_qty: Number(line.actual_qty),
                    lot_number: line.lot_number.trim() || null,
                })),
            });

            if (!result.success) {
                setError(result.message);
                return;
            }

            await onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            setError("Terjadi kesalahan saat menerima barang.");
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
                        <h2 className="text-lg font-semibold">Receive Goods</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {purchaseOrder?.po_number}
                        </p>
                    </div>

                    <button type="button" onClick={onClose}>
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="animate-spin text-slate-400" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5 p-6">
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Receipt Date
                                    </label>
                                    <input
                                        type="date"
                                        value={receiptDate}
                                        onChange={(e) => setReceiptDate(e.target.value)}
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Supplier
                                    </label>
                                    <input
                                        readOnly
                                        value={data?.supplier_name ?? ""}
                                        className="w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full min-w-[1050px]">
                                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Item</th>
                                            <th className="px-4 py-3">Ordered</th>
                                            <th className="px-4 py-3">Remaining</th>
                                            <th className="px-4 py-3">Received</th>
                                            <th className="px-4 py-3">Actual Qty</th>
                                            <th className="px-4 py-3">Lot Number</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {lines.map((line) => {
                                            const poItem = data?.items.find(
                                                (item) =>
                                                    item.id ===
                                                    line.purchase_order_item_id
                                            );

                                            if (!poItem) return null;

                                            return (
                                                <tr key={line.id}>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium">
                                                            {poItem.item.reference} - {poItem.item.name}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Default: 1{" "}
                                                            {poItem.purchase_uom.symbol ??
                                                                poItem.purchase_uom.name}
                                                            {" ≈ "}
                                                            {poItem.item.default_purchase_qty ?? 1}{" "}
                                                            {poItem.item.uom.symbol ??
                                                                poItem.item.uom.name}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-3 text-sm">
                                                        {poItem.ordered_qty}{" "}
                                                        {poItem.purchase_uom.symbol ??
                                                            poItem.purchase_uom.name}
                                                    </td>

                                                    <td className="px-4 py-3 text-sm">
                                                        {poItem.remaining_qty}{" "}
                                                        {poItem.purchase_uom.symbol ??
                                                            poItem.purchase_uom.name}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.001"
                                                            value={line.purchase_qty}
                                                            onChange={(e) =>
                                                                updatePurchaseQty(
                                                                    line.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-24 rounded-lg border px-2 py-2 text-sm"
                                                        />

                                                        <span className="ml-2 text-xs text-slate-500">
                                                            {poItem.purchase_uom.symbol ??
                                                                poItem.purchase_uom.name}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.001"
                                                            value={line.actual_qty}
                                                            onChange={(e) =>
                                                                updateLine(
                                                                    line.id,
                                                                    "actual_qty",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-28 rounded-lg border px-2 py-2 text-sm"
                                                        />

                                                        <span className="ml-2 text-xs text-slate-500">
                                                            {poItem.item.uom.symbol ??
                                                                poItem.item.uom.name}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {poItem.item.tracking === "LOT" ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    value={line.lot_number}
                                                                    onChange={(e) => updateLine(line.id, "lot_number", e.target.value)}
                                                                    placeholder="Kosongkan = otomatis"
                                                                    className="w-44 rounded-lg border px-3 py-2 text-sm"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    title="Tambah Lot"
                                                                    onClick={() => addLot(poItem.id)}
                                                                    className="rounded-lg border p-2 hover:bg-slate-50"
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">-</span>
                                                        )}
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

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Remarks
                                </label>
                                <textarea
                                    rows={3}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Catatan penerimaan barang..."
                                    className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm"
                                />
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
                                className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <PackageCheck size={17} />
                                        Receive Goods
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}