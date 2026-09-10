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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SaleSerialized } from "@/components/SPK/types";
import { SaleItemRow } from "./SaleItemRow";

interface SaleCardProps {
    sale: SaleSerialized;
    formatCurrency: (amount: number | string) => string;
}

export function SaleCard({ sale, formatCurrency }: SaleCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                    <div className="flex flex-col gap-1.5">
                        {/* Baris Atas: NO SPK + SPK Type + Status Badge (Sejajar Horisontal) */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-base">
                                {sale.no_spk || "TANPA NO SPK"}
                            </span>
                            <Badge variant="outline" className="uppercase font-semibold border-slate-200 text-slate-600">
                                {sale.spk_type}
                            </Badge>
                            {getStatusBadge(sale.status)}
                        </div>

                        {/* Baris Bawah: PO Badge */}
                        <div>
                            <Badge variant="secondary" className="uppercase font-semibold bg-slate-100 text-slate-700 hover:bg-slate-100">
                                PO: {sale.no_po || "-"}
                            </Badge>
                        </div>
                        {/* {sale.no_po && (
                            
                        )} */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-500 pt-1">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
                            <span className="font-medium text-slate-800">{sale.customer.name}</span>
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

                <div className="flex sm:flex-col justify-between items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 block font-medium">
                            Total Transaksi
                        </span>
                        <span className="text-lg font-extrabold text-[#0E5EA2]">
                            {formatCurrency(sale.total_amount)}
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0E5EA2] hover:bg-slate-100"
                    >
                        <Package className="w-3.5 h-3.5" />
                        {sale.sale_items?.length || 0} Item
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Rincian Produk
                    </h4>
                    <div className="space-y-2">
                        {sale.sale_items.map((item) => (
                            <SaleItemRow key={item.id} item={item} formatCurrency={formatCurrency} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}