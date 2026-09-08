"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    FileText,
    Calendar,
    User,
    Building2,
    Tag,
    ChevronDown,
    ChevronUp,
    Package,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

import { Decimal } from "@/src/generated/prisma/internal/prismaNamespace";
import { CustomerOption, ProductOption, SaleSerialized, TaxOption } from "@/components/SPK/types";
import { CreateSpkModal } from "./components/CreateSpkModal";


interface SaleListProps {
    sales: SaleSerialized[];
    customers?: CustomerOption[];
    products?: ProductOption[];
    taxes?: TaxOption[];
    onAddNew?: () => void;
}

export function SaleList({
    sales,
    customers = [],
    products = [],
    taxes = [],
    onAddNew,
}: SaleListProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleOpenModal = () => {
        if (onAddNew) {
            onAddNew();
        } else {
            setIsModalOpen(true);
        }
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };



    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "done":
            case "selesai":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {status}
                    </span>
                );
            case "on progress":
            case "proses":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        {status}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="max-w-7xl space-y-2">
            {/* Pop-up Modal */}
            <CreateSpkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customers={customers}
                products={products}
                taxes={taxes}
            />

            {/* Header Halaman */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Daftar SPK / Sales</h1>
                    <p className="text-sm text-slate-500">
                        Kelola pesanan dan dokumen SPK produksi
                    </p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="inline-flex items-center gap-2 bg-[#0E5EA2] hover:bg-sky-800 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Buat SPK Baru
                </button>
            </div>

            {/* List Item SPK */}
            {sales.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-700">
                        Belum ada data SPK
                    </h3>
                    <p className="text-sm text-slate-500">
                        Klik tombol di atas untuk membuat SPK pertama Anda.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sales.map((sale) => {
                        const isExpanded = expandedId === sale.id;

                        return (
                            <div
                                key={sale.id}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono font-bold text-slate-900 text-base">
                                                {sale.no_spk || "TANPA NO SPK"}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold uppercase">
                                                {sale.spk_type}
                                            </span>
                                            {getStatusBadge(sale.status)}
                                        </div>
                                        <div>
                                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 pt-1">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span className="font-medium text-slate-800">
                                                        {sale.customer.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>Sales: {sale.sales_person || "-"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>
                                                        {format(new Date(sale.spk_date), "dd MMMM yyyy", {
                                                            locale: id,
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>E-Catalog: {sale.ecatalog || "-"}</span>
                                                </div>
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

                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(sale.id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0E5EA2] bg-slate-100 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Package className="w-3.5 h-3.5" />
                                            {sale.sale_items?.length || 0} Item
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                            Rincian Produk
                                        </h4>

                                        <div className="space-y-2">
                                            {sale.sale_items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm"
                                                >
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
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}