// components/sales/SaleDetailTabs.tsx
import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Package, Paperclip, Upload, Loader2, FileText, ExternalLink, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SaleItemRow } from "./SaleItemRow"; // Sesuaikan jalur import
import { SaleSerialized } from "../types"; // Import tipe Anda

interface SaleDetailTabsProps {
    sale: SaleSerialized;
    subtotalDPP: number;
    totalTax: number;
    totalAmount: number;
    selectedFiles: File[];
    isUploading: boolean;
    attachmentRemarks: string;
    setAttachmentRemarks: (value: string) => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUploadAttachments: () => void;
    formatCurrency: (amount: number | string) => string;
}

export const SaleDetailTabs: React.FC<SaleDetailTabsProps> = ({
    sale,
    subtotalDPP,
    totalTax,
    totalAmount,
    selectedFiles,
    isUploading,
    attachmentRemarks,
    setAttachmentRemarks,
    handleFileSelect,
    handleUploadAttachments,
    formatCurrency,
}) => {
    return (
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

            {/* CONTENT TAB: RINCIAN PRODUK */}
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

            {/* CONTENT TAB: LAMPIRAN & UPLOAD */}
            <TabsContent value="attachments" className="space-y-4 m-0">
                {/* Form Box Upload Lampiran Baru */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#0E5EA2]" /> Unggah Dokumen / Lampiran Baru
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">Pilih File</label>
                            <Input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="h-9 text-xs file:text-black bg-white cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">Catatan Lampiran (Opsional)</label>
                            <Input
                                type="text"
                                placeholder="Contoh: Bukti Transfer / PO ditandatangani"
                                value={attachmentRemarks}
                                onChange={(e) => setAttachmentRemarks(e.target.value)}
                                className="h-9 text-xs bg-white"
                            />
                        </div>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-500">
                                {selectedFiles.length} file dipilih
                            </span>
                            <Button
                                size="sm"
                                onClick={handleUploadAttachments}
                                disabled={isUploading}
                                className="h-8 px-3 text-xs bg-[#0E5EA2] hover:bg-[#0b4b82] text-white"
                            >
                                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                                Unggah File
                            </Button>
                        </div>
                    )}
                </div>

                {/* List Lampiran */}
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
                                        <p className="text-xs text-slate-500 italic truncate">
                                            {file.remarks}
                                        </p>
                                        {/* {file.remarks && (
                                          
                                        )} */}
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
    );
};