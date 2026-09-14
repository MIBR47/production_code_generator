// components/SPK/SaleItemRow.tsx
"use client";

import { SaleItemSerialized } from "@/components/SPK/types";

interface SaleItemRowProps {
    item: SaleItemSerialized;
    formatCurrency: (amount: number | string) => string;
}

export function SaleItemRow({ item, formatCurrency }: SaleItemRowProps) {
    const productName = item.product?.product_name || "Produk Tidak Ditemukan";
    const productType = item.product?.product_type || "-";
    const taxName = item.tax?.name || "-";
    const taxRate = item.tax?.rate || 0;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-lg border border-slate-200 text-sm shadow-sm">
            {/* Detail Informasi Produk */}
            <div className="space-y-0.5">
                <p className="font-semibold text-slate-800 leading-tight">
                    {productName}
                </p>
                <p className="text-xs text-slate-500">
                    Tipe: <span className="font-medium text-slate-700">{productType}</span>
                </p>
            </div>

            {/* Detail Ringkasan Harga & Pajak */}
            <div className="flex flex-col gap-1 sm:items-end w-full sm:w-auto text-xs sm:text-sm pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Subtotal Item */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full">
                    <span className="text-slate-600">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                    </span>
                    <span className="font-semibold text-slate-900">
                        {formatCurrency(item.subtotal)}
                    </span>
                </div>

                {/* Rincian Pajak */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full text-xs text-slate-500">
                    <span>
                        Pajak ({taxRate.toString()}%):
                    </span>
                    <span className="font-medium text-slate-700">
                        {formatCurrency(item.tax_price ?? 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}