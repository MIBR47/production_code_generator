// components/SPK/SaleCard.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Calendar,
    User,
    Building2,
    Tag,
    ChevronDown,
    ChevronUp,
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    Receipt,
    Calculator,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SaleSerialized } from "@/components/SPK/types";
import { SaleItemRow } from "./SaleItemRow";

interface SaleCardProps {
    sale: SaleSerialized;
    formatCurrency: (amount: number | string) => string;
    onOpenDetail?: (sale: SaleSerialized) => void;
}

export function SaleCard({ sale, formatCurrency, onOpenDetail }: SaleCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Perhitungan Ringkasan
    const subtotalDPP = sale.sale_items?.reduce(
        (acc, item) => acc + Number(item.quantity || 0) * Number(item.unit_price || 0),
        0
    ) || 0;

    const totalAmount = Number(sale.total_amount || 0);
    const totalTax = Math.max(0, totalAmount - subtotalDPP);
    const totalDiscount = sale.sale_items?.reduce(
        (acc, item) => acc + (item.subtotal * ((item.discount || 0) / 100)),
        0
    ) || 0;

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "done":
            case "selesai":
                return (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1 border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {status}
                    </Badge>
                );
            case "on progress":
            case "proses":
                return (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1 border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        {status}
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-100 gap-1 border-slate-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <div
            onClick={() => onOpenDetail && onOpenDetail(sale)}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group"
        >
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
                {/* SISI KIRI: INFORMASI UTAMA */}
                <div className="space-y-3 flex-1">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-base group-hover:text-[#0E5EA2] transition-colors">
                                {sale.no_spk || "TANPA NO SPK"}
                            </span>
                            <Badge variant="outline" className="uppercase font-semibold border-slate-200 text-slate-600">
                                {sale.spk_type}
                            </Badge>
                            {getStatusBadge(sale.status)}
                        </div>

                        <div>
                            <Badge variant="secondary" className="uppercase font-semibold bg-slate-100 text-slate-700 hover:bg-slate-100">
                                PO: {sale.no_po || "-"}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
                            <span className="font-medium text-slate-800 truncate">{sale.customer?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 shrink-0 text-slate-400" />
                            <span>Sales: {sale.sales_person || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                            <span>
                                SPK Date: {format(new Date(sale.spk_date), "dd MMMM yyyy", { locale: id })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                            <span>
                                Expected Date: {sale.expected_date ? format(new Date(sale.expected_date), "dd MMMM yyyy", { locale: id }) : "-"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                            <Tag className="w-4 h-4 shrink-0 text-slate-400" />
                            <span>E-Catalog: {sale.ecatalog || "-"}</span>
                        </div>
                    </div>

                    {sale.remarks && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                            Catatan: {sale.remarks}
                        </p>
                    )}
                </div>

                {/* SISI KANAN: RINGKASAN BIAYA & AKSI */}
                <div className="flex sm:flex-col justify-between items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 min-w-[200px]">
                    <div className="text-left sm:text-right space-y-1 w-full">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Total Transaksi
                        </span>

                        {/* <div className="text-xs space-y-0.5 text-slate-500">
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span>DPP (Subtotal):</span>
                                <span className="font-medium text-slate-700">{formatCurrency(subtotalDPP)}</span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span>Estimasi Pajak:</span>
                                <span className="font-medium text-slate-700">{formatCurrency(totalTax)}</span>
                            </div>
                        </div> */}

                        <div className="pt-1 border-t border-slate-100">
                            {/* <span className="text-xs text-slate-400 block font-medium">Total Akhir</span> */}
                            <span className="text-lg font-extrabold text-[#0E5EA2]">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0E5EA2] hover:bg-slate-100 mt-2"
                    >
                        <Package className="w-3.5 h-3.5" />
                        {sale.sale_items?.length || 0} Item
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* AREA EXPANDED ITEM & TOTAL BIAYA */}
            {isExpanded && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-50 p-4 border-t border-slate-200 space-y-4 cursor-default"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" />
                            Rincian Pembelian
                        </h4>
                    </div>

                    {/* DAFTAR ITEM */}
                    <div className="space-y-2">
                        {sale.sale_items && sale.sale_items.length > 0 ? (
                            sale.sale_items.map((item) => (
                                <SaleItemRow key={item.id} item={item} formatCurrency={formatCurrency} />
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 italic text-center py-2">
                                Tidak ada item produk.
                            </p>
                        )}
                    </div>

                    {/* RINGKASAN SUB-TOTAL (DENGAN & TANPA PAJAK) */}
                    <div className="mt-4 pt-3 border-t border-slate-200 bg-white p-3 rounded-lg border shadow-sm space-y-2 text-xs">
                        {/* <div className="flex items-center gap-1.5 font-bold text-slate-700 pb-1 border-b border-slate-100">
                            <Calculator className="w-4 h-4 text-[#0E5EA2]" />
                            <span>Ringkasan Kalkulasi SPK</span>
                        </div> */}
                        <div className="flex justify-between items-center text-slate-600">
                            <span>Total Tanpa Pajak</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(subtotalDPP)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                            <span>Pajak (PPN/PPh)</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(totalTax)}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Total Diskon</span>
                                <span>{formatCurrency(totalDiscount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-bold text-[#0E5EA2]">
                            <span>Total Dengan Pajak</span>
                            <span>{formatCurrency(totalAmount - totalDiscount)}</span>
                        </div>


                    </div>
                </div>
            )}
        </div>
    );
}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }