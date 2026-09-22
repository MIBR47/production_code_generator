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
            {/* Detail Ringkasan Harga & Pajak */}
            <div className="flex w-full flex-col gap-1 border-t border-slate-100 pt-2 text-xs sm:w-auto sm:items-end sm:border-t-0 sm:pt-0 sm:text-sm">

                {/* Subtotal Item */}
                <div className="flex w-full items-center justify-end gap-3 text-right">
                    <span className="text-slate-600">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                    </span>
                    <span className="min-w-[90px] font-semibold text-slate-900">
                        {formatCurrency(item.subtotal)}
                    </span>
                </div>

                {/* Rincian Pajak */}
                <div className="flex w-full items-center justify-end gap-3 text-right text-xs text-slate-500">
                    <span>Pajak ({taxRate.toString()}%):</span>
                    <span className="min-w-[90px] font-medium text-slate-700">
                        {formatCurrency(item.tax_price ?? 0)}
                    </span>
                </div>

                {/* Rincian Diskon */}
                <div className="flex w-full items-center justify-end gap-3 text-right text-xs text-slate-500">
                    <span>Diskon ({item.discount?.toString() || '0'}%):</span>
                    <span className="min-w-[90px] font-medium text-slate-700">
                        {formatCurrency(item.subtotal * ((item.discount || 0) / 100))}
                    </span>
                </div>

            </div>
        </div>
    );
}