"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { ItemRow, ProductOption, TaxOption } from "@/components/SPK/types";

interface SpkItemRowProps {
    index: number;
    item: ItemRow;
    products: ProductOption[];
    taxes: TaxOption[];
    canRemove: boolean;
    onItemChange: (index: number, field: keyof ItemRow, value: any) => void;
    onRemoveItem: (index: number) => void;
    getNormalizedTaxRate: (taxId: number | "") => number;
    formatCurrency: (val: number) => string;
}

export function CreateSpkItemRow({
    index,
    item,
    products,
    taxes,
    canRemove,
    onItemChange,
    onRemoveItem,
    getNormalizedTaxRate,
    formatCurrency,
}: SpkItemRowProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const itemBase = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    const itemTax = itemBase * getNormalizedTaxRate(item.tax_id);

    // Ambil produk terpilih untuk menampilkan nama di input
    const selectedProduct = products.find((p) => String(p.id) === String(item.product_id));

    // Filter list produk berdasarkan apa yang diketik user
    const filteredProducts = products.filter((p) =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <TableRow className="hover:bg-slate-50 border-b border-slate-200">
            {/* 1. Combobox Produk (Value berupa String ID agar tidak ter-render JSON) */}
            <TableCell className="w-[45%] p-2 align-middle">
                <Combobox
                    value={item.product_id ? String(item.product_id) : ""}
                    onValueChange={(val: string | null) => {
                        onItemChange(index, "product_id", val ?? "");
                        setSearchQuery(""); // Reset query pencarian setelah memilih
                    }}
                >
                    <ComboboxInput
                        placeholder="Pilih atau cari produk..."
                        showClear
                        value={searchQuery || selectedProduct?.product_name || ""}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 bg-white border-slate-300 text-slate-800"
                    />
                    <ComboboxContent className="max-h-60 overflow-y-auto z-50">
                        <ComboboxList>
                            {filteredProducts.length === 0 ? (
                                <ComboboxEmpty>Produk tidak ditemukan.</ComboboxEmpty>
                            ) : (
                                filteredProducts.map((p) => (
                                    <ComboboxItem key={p.id} value={String(p.id)}>
                                        {p.product_name}
                                    </ComboboxItem>
                                ))
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </TableCell>

            {/* 2. Pilih Pajak (Menampilkan Nama Pajak + Persentase) */}
            <TableCell className="w-[15%] p-2 align-middle">
                <Select
                    value={
                        item.tax_id !== "" && item.tax_id !== null && item.tax_id !== undefined
                            ? String(item.tax_id)
                            : "0"
                    }
                    onValueChange={(val) => onItemChange(index, "tax_id", val === "0" ? "" : val)}
                >
                    <SelectTrigger className="h-9 w-full bg-white border-slate-300 text-slate-800 focus:ring-blue-500">
                        <SelectValue placeholder="Pajak">
                            {(() => {
                                if (!item.tax_id || item.tax_id === 0) return "Tanpa Pajak (0%)";
                                const tax = taxes.find((t) => String(t.id) === String(item.tax_id));
                                if (!tax) return "Tanpa Pajak (0%)";
                                const rateVal = Number(tax.rate);
                                const displayPercent = rateVal > 1 ? rateVal : rateVal * 100;
                                return `${tax.name} (${displayPercent}%)`;
                            })()}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-50">
                        <SelectItem value="0">Tanpa Pajak (0%)</SelectItem>
                        {taxes.map((t) => {
                            const rateVal = Number(t.rate);
                            const displayPercent = rateVal > 1 ? rateVal : rateVal * 100;
                            return (
                                <SelectItem key={t.id} value={String(t.id)}>
                                    {t.name} ({displayPercent}%)
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </TableCell>

            {/* 3. Quantity */}
            <TableCell className="w-[10%] p-2 align-middle">
                <Input
                    type="number"
                    min="1"
                    className="h-9 w-full bg-white border-slate-300 text-center text-slate-800 focus-visible:ring-blue-500"
                    value={item.quantity || ""}
                    onChange={(e) => onItemChange(index, "quantity", Number(e.target.value))}
                />
            </TableCell>

            {/* 4. Harga Satuan */}
            <TableCell className="w-[18%] p-2 align-middle">
                <Input
                    type="number"
                    min="0"
                    className="h-9 w-full bg-white border-slate-300 text-right text-slate-800 focus-visible:ring-blue-500"
                    value={item.unit_price === 0 ? "" : item.unit_price}
                    onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                        onItemChange(index, "unit_price", val);
                    }}
                    onFocus={(e) => e.target.select()}
                />
            </TableCell>

            {/* 5. Subtotal */}
            <TableCell className="w-[12%] p-2 align-middle text-right font-medium text-xs text-slate-900 whitespace-nowrap">
                {formatCurrency(itemBase + itemTax)}
            </TableCell>

            {/* 6. Tombol Hapus */}
            <TableCell className="w-[40px] p-2 align-middle text-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={!canRemove}
                    onClick={() => onRemoveItem(index)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}