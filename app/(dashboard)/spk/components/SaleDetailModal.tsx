// components/SPK/SaleDetailModal.tsx
"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Paperclip,
    ExternalLink,
    Download,
    Building2,
    User,
    Calendar,
    Tag,
    Hash,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaleSerialized } from "@/components/SPK/types";
import { SaleItemRow } from "./SaleItemRow";

interface SaleDetailModalProps {
    sale: SaleSerialized | null;
    isOpen: boolean;
    onClose: () => void;
    formatCurrency: (amount: number | string) => string;
}

export function SaleDetailModal({
    sale,
    isOpen,
    onClose,
    formatCurrency,
}: SaleDetailModalProps) {
    if (!sale) return null;

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

    const subtotalDPP = sale.sale_items?.reduce(
        (acc, item) => acc + Number(item.quantity || 0) * (Number(item.unit_price) || 0) * (1 - (Number(item.discount || 0) / 100)),
        0
    ) || 0;

    const totalAmount = Number(sale.total_amount || 0);
    const totalTax = Math.max(0, totalAmount - subtotalDPP);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Penggunaan !max-w-4xl dan sm:!max-w-5xl wajib untuk menimpa CSS shadcn */}
            <DialogContent className="!max-w-full sm:!max-w-4xl lg:!max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl">
                {/* HEADER MODAL */}
                <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 text-lg sm:text-xl">
                                    {sale.no_spk || "TANPA NO SPK"}
                                </span>
                                <Badge variant="outline" className="uppercase font-semibold text-xs border-slate-300 text-slate-700">
                                    {sale.spk_type}
                                </Badge>
                                {getStatusBadge(sale.status)}
                            </div>
                            <DialogTitle className="text-xs sm:text-sm font-normal text-slate-500">
                                Detail Transaksi Penjualan & Lampiran Dokumen
                            </DialogTitle>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                            <span className="text-[11px] text-slate-400 font-medium block">Total Transaksi</span>
                            <span className="text-xl sm:text-2xl font-black text-[#0E5EA2]">
                                {formatCurrency(sale.total_amount)}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                {/* BODY MODAL */}
                <div className="p-4 sm:p-6 space-y-6">
                    {/* GRID INFORMASI LENGKAP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm">
                        <div className="flex items-start gap-2.5">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <span className="text-xs text-slate-400 font-medium block">Customer</span>
                                <p className="font-semibold text-slate-800 truncate">{sale.customer?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Hash className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs text-slate-400 font-medium block">No. PO</span>
                                <p className="font-semibold text-slate-800">{sale.no_po || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs text-slate-400 font-medium block">Sales Person</span>
                                <p className="font-semibold text-slate-800">{sale.sales_person || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs text-slate-400 font-medium block">Tanggal SPK</span>
                                <p className="font-semibold text-slate-800">
                                    {format(new Date(sale.spk_date), "dd MMMM yyyy", { locale: id })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs text-slate-400 font-medium block">Target Selesai</span>
                                <p className="font-semibold text-slate-800">
                                    {sale.expected_date ? format(new Date(sale.expected_date), "dd MMMM yyyy", { locale: id }) : "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs text-slate-400 font-medium block">E-Catalog</span>
                                <p className="font-semibold text-slate-800">{sale.ecatalog || "-"}</p>
                            </div>
                        </div>

                        {sale.remarks && (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-200/60">
                                <span className="text-xs text-slate-400 font-medium block mb-1">Catatan SPK</span>
                                <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                                    {sale.remarks}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* TAB ITEM PRODUK & LAMPIRAN */}
                    <Tabs defaultValue="items" className="w-full space-y-4">
                        <TabsList className="grid w-full grid-cols-2 max-w-md h-10 p-1 bg-slate-100 rounded-lg">
                            <TabsTrigger
                                value="items"
                                className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                            >
                                <Package className="w-4 h-4" />
                                <span>Rincian Produk ({sale.sale_items?.length || 0})</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="attachments"
                                className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                            >
                                <Paperclip className="w-4 h-4" />
                                <span>Lampiran ({sale.sale_attachments?.length || 0})</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: SALE ITEMS */}
                        <TabsContent value="items" className="space-y-3 m-0">
                            {sale.sale_items && sale.sale_items.length > 0 ? (
                                <div className="space-y-2">
                                    {sale.sale_items.map((item) => (
                                        <SaleItemRow key={item.id} item={item} formatCurrency={formatCurrency} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                    Tidak ada item produk dalam SPK ini.
                                </div>
                            )}


                            <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50 p-3 rounded-lg border shadow-sm space-y-2 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Tanpa Pajak</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotalDPP)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Pajak (PPN/PPh)</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(totalTax)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-bold text-[#0E5EA2]">
                                    <span>Total Keseluruhan</span>
                                    <span>{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                        </TabsContent>

                        {/* TAB 2: SALE ATTACHMENTS */}
                        <TabsContent value="attachments" className="m-0">
                            {sale.sale_attachments && sale.sale_attachments.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {sale.sale_attachments.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="p-2 rounded-lg bg-blue-50 shrink-0 text-[#0E5EA2]">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-800 truncate" title={file.file_name}>
                                                        {file.file_name}
                                                    </p>
                                                    {file.remarks && (
                                                        <p className="text-xs text-slate-500 italic truncate">
                                                            {file.remarks}
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        {format(new Date(file.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                                <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <ExternalLink className="w-4 h-4 text-slate-600" />
                                                    </Button>
                                                </a>
                                                <a href={file.file_path} download={file.file_name}>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <Download className="w-4 h-4 text-slate-600" />
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                    Belum ada bukti atau dokumen lampiran yang diunggah.
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}