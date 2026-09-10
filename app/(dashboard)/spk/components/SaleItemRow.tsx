// components/SPK/SaleItemRow.tsx
"use client";

import { SaleItemSerialized } from "@/components/SPK/types";

interface SaleItemRowProps {
    item: SaleItemSerialized;
    formatCurrency: (amount: number | string) => string;
}

export function SaleItemRow({ item, formatCurrency }: SaleItemRowProps) {
    return (
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
            <div>
                <p className="font-semibold text-slate-800">
                    {item.product?.product_name || "Produk Tidak Ditemukan"}
                </p>
                <p className="text-xs text-slate-500">
                    Tipe: {item.product?.product_type || "-"} | Pajak:{" "}
                    {item.tax?.name || "-"} ({String(item.tax?.rate || 0)}%)
                </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 text-xs sm:text-sm">
                <span className="text-slate-600">
                    {item.quantity} x {formatCurrency(item.unit_price)}
                </span>
                <span className="font-bold text-slate-900">
                    {formatCurrency(item.subtotal)}
                </span>
            </div>
        </div>
    );
}