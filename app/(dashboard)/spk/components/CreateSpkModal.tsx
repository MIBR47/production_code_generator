"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Plus, Trash2, ShoppingBag } from "lucide-react";
import { createSaleAction } from "../actions";
import { Decimal } from "@/src/generated/prisma/internal/prismaNamespace";
import { CustomerOption, ItemRow, ProductOption, TaxOption } from "@/components/SPK/types";


interface CreateSpkModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers?: CustomerOption[];
    products?: ProductOption[];
    taxes?: TaxOption[];
}

export function CreateSpkModal({
    isOpen,
    onClose,
    customers = [],
    products = [],
    taxes = [],
}: CreateSpkModalProps) {
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [items, setItems] = useState<ItemRow[]>([
        { product_id: "", tax_id: "", quantity: 1, unit_price: 0 },
    ]);

    if (!isOpen) return null;

    const handleAddItem = () => {
        const defaultTaxId = taxes.length > 0 ? taxes[0].id : "";
        setItems((prev) => [
            ...prev,
            { product_id: "", tax_id: defaultTaxId, quantity: 1, unit_price: 0 },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (
        index: number,
        field: keyof ItemRow,
        value: any
    ) => {
        const updated = [...items];
        const item = { ...updated[index], [field]: value };

        // Otomatis isi harga jika produk dipilih dari harga terakhir di database
        if (field === "product_id") {
            const selectedProd = products.find((p) => p.id === Number(value));
            if (selectedProd && selectedProd.price !== undefined && selectedProd.price !== null) {
                item.unit_price = Number(selectedProd.price);
            } else {
                item.unit_price = 0; // Default ke 0 jika belum ada harga di DB
            }
        }

        updated[index] = item;
        setItems(updated);
    };

    const getNormalizedTaxRate = (taxId: number | ""): number => {
        const selectedTax = taxes.find((t) => t.id === Number(taxId));
        if (!selectedTax) return 0;

        const rateNum = Number(selectedTax.rate);
        return rateNum > 1 ? rateNum / 100 : rateNum;
    };

    const subtotalBeforeTax = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        return sum + qty * price;
    }, 0);

    const totalTax = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        const itemBase = qty * price;
        const taxRate = getNormalizedTaxRate(item.tax_id);

        return sum + itemBase * taxRate;
    }, 0);

    const grandTotal = subtotalBeforeTax + totalTax;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        const hasInvalidItem = items.some(
            (item) => !item.product_id || item.quantity <= 0
        );
        if (hasInvalidItem) {
            setErrorMessage(
                "Harap lengkapi semua Produk dan Jumlah Barang dengan benar."
            );
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.append("items", JSON.stringify(items));

        startTransition(async () => {
            const result = await createSaleAction(null, formData);
            if (result?.success) {
                onClose();
            } else {
                setErrorMessage(result?.message || "Terjadi kesalahan.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">Buat SPK Baru</h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                        {errorMessage && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Tipe SPK <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="spk_type"
                                    required
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                                >
                                    <option value="E-Catalog">E-Catalog (E-SPK/...)</option>
                                    <option value="Reguler">Reguler (R-SPK/...)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Pelanggan / Customer <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="customer_id"
                                    required
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                                >
                                    <option value="">-- Pilih Customer --</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Sales Person
                                </label>
                                <input
                                    type="text"
                                    name="sales_person"
                                    placeholder="Nama Sales"
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nomor E-Catalog
                                </label>
                                <input
                                    type="text"
                                    name="ecatalog"
                                    placeholder="Contoh: ECAT-102938"
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                    <ShoppingBag className="w-4 h-4 text-sky-600" /> Item Barang / Produk
                                </h4>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E5EA2] hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg transition"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    const itemBase = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                                    const itemTax = itemBase * getNormalizedTaxRate(item.tax_id);

                                    return (
                                        <div
                                            key={index}
                                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-end text-xs"
                                        >
                                            <div className="col-span-12 sm:col-span-4">
                                                <label className="block font-medium text-slate-600 mb-1">
                                                    Produk <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "product_id", e.target.value)
                                                    }
                                                    required
                                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500 bg-white"
                                                >
                                                    <option value="">-- Pilih Produk --</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.product_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-span-6 sm:col-span-2">
                                                <label className="block font-medium text-slate-600 mb-1">
                                                    Pajak
                                                </label>
                                                <select
                                                    value={item.tax_id}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "tax_id", e.target.value)
                                                    }
                                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500 bg-white"
                                                >
                                                    <option value="">Tanpa Pajak (0%)</option>
                                                    {taxes.map((t) => {
                                                        const rateVal = Number(t.rate);
                                                        const displayPercent = rateVal > 1 ? rateVal : rateVal * 100;
                                                        return (
                                                            <option key={t.id} value={t.id}>
                                                                {t.name} ({displayPercent}%)
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <div className="col-span-6 sm:col-span-2">
                                                <label className="block font-medium text-slate-600 mb-1">
                                                    Qty
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity || ""}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            "quantity",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500 bg-white"
                                                />
                                            </div>

                                            {/* Input harga manual */}
                                            <div className="col-span-9 sm:col-span-3">
                                                <label className="block font-medium text-slate-600 mb-1">
                                                    Harga Satuan (Rp)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.unit_price === 0 ? "" : item.unit_price} // 👈 Kosongkan tampilan jika bernilai 0
                                                    onChange={(e) => {
                                                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                                                        handleItemChange(index, "unit_price", val);
                                                    }}
                                                    onFocus={(e) => e.target.select()} // Optional: otomatis sorot text saat diklik/fokus
                                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500 bg-white"
                                                />
                                            </div>

                                            <div className="col-span-3 sm:col-span-1 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={items.length === 1}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="col-span-12 text-right pt-1 text-[11px] text-slate-500 border-t border-slate-100 mt-1">
                                                Subtotal: <span className="font-semibold text-slate-700">{formatCurrency(itemBase)}</span>
                                                {" | "}
                                                Pajak: <span className="font-semibold text-slate-700">{formatCurrency(itemTax)}</span>
                                                {" | "}
                                                Total: <span className="font-bold text-slate-800">{formatCurrency(itemBase + itemTax)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                <div className="flex justify-between items-center text-xs text-slate-600">
                                    <span>Total Harga Sebelum Pajak (Subtotal):</span>
                                    <span className="font-semibold text-slate-800">
                                        {formatCurrency(subtotalBeforeTax)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-600">
                                    <span>Total Pajak:</span>
                                    <span className="font-semibold text-slate-800">
                                        {formatCurrency(totalTax)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                                    <span>Total Keseluruhan (Grand Total):</span>
                                    <span className="text-base text-[#0E5EA2]">
                                        {formatCurrency(grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Catatan / Remarks
                            </label>
                            <textarea
                                name="remarks"
                                rows={2}
                                placeholder="Catatan khusus SPK..."
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E5EA2] hover:bg-sky-800 rounded-lg transition disabled:opacity-50 shadow-sm"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {isPending ? "Menyimpan..." : "Simpan SPK & Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}