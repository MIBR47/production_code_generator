// components/SPK/SaleDetailModal.tsx
"use client";

import { useState, useEffect, useTransition, ChangeEvent } from "react";
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
    Pencil,
    X,
    Save,
    Loader2,
    Upload,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SaleItemSerialized, SaleSerialized } from "@/components/SPK/types";
import { SaleItemRow } from "./SaleItemRow";
import { updateSaleAction, uploadAttachmentAction } from "@/actions/spk";
import { SaleDetailTabs } from "./SaleDetailTabs";
// import { updateSaleAction } from "../actions";

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
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    // State untuk Form Utama
    const [formData, setFormData] = useState({
        status: "",
        sales_person: "",
        ecatalog: "",
        shipping_cost: 0,
        remarks: "",
        spk_date: "",
        expected_date: "",
    });

    // State Editable Item Produk
    const [editableItems, setEditableItems] = useState<SaleItemSerialized[]>([]);

    // State Upload Lampiran Baru
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [attachmentRemarks, setAttachmentRemarks] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (sale) {
            setFormData({
                status: sale.status || "On Progress",
                sales_person: sale.sales_person || "",
                ecatalog: sale.ecatalog || "",
                shipping_cost: Number(sale.shipping_cost || 0),
                remarks: sale.remarks || "",
                spk_date: sale.spk_date ? new Date(sale.spk_date).toISOString().split("T")[0] : "",
                expected_date: sale.expected_date ? new Date(sale.expected_date).toISOString().split("T")[0] : "",
            });
            setEditableItems(sale.sale_items ? JSON.parse(JSON.stringify(sale.sale_items)) : []);
        }
        setIsEditing(false);
        setSelectedFiles([]);
        setAttachmentRemarks("");
    }, [sale]);

    if (!sale) return null;

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handler Perubahan Item Produk (Qty, Harga, Diskon)
    const handleItemChange = (index: number, field: keyof SaleItemSerialized, value: number) => {
        setEditableItems((prev) => {
            const updated = [...prev];
            const currentItem = { ...updated[index], [field]: value };

            // Perhitungan ulang Subtotal secara dinamis: (Qty * Price) * (1 - Discount/100)
            const qty = Number(currentItem.quantity) || 0;
            const price = Number(currentItem.unit_price) || 0;
            const discount = Number(currentItem.discount) || 0;

            currentItem.subtotal = qty * price * (1 - discount / 100);
            updated[index] = currentItem;
            return updated;
        });
    };

    const handleUploadAttachments = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append("sale_id", String(sale.id));
            uploadFormData.append("remarks", attachmentRemarks);

            selectedFiles.forEach((file) => {
                uploadFormData.append("files", file);
            });

            // Panggil Server Action Prisma
            const res = await uploadAttachmentAction(uploadFormData);

            if (res.success) {
                setSelectedFiles([]);
                setAttachmentRemarks("");
                alert("File berhasil diunggah!");
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert("Terjadi kesalahan saat mengunggah file.");
        } finally {
            setIsUploading(false);
        }
    };

    // Handler Simpan Data (Termasuk Item yang Di-edit)
    const handleSave = () => {
        startTransition(async () => {
            const res = await updateSaleAction(sale.id, {
                no_spk: sale.no_spk || "",
                no_po: sale.no_po || "",
                spk_type: sale.spk_type || "",
                ...formData,
                items: editableItems, // Mengirimkan array item yang telah diperbarui
            });

            if (res.success) {
                setIsEditing(false);
            } else {
                alert(res.message);
            }
        });
    };

    // Handler Upload Lampiran File
    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };



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

    // Kalkulasi Total & DPP dari state editableItems
    const activeItems = isEditing ? editableItems : (sale.sale_items || []);
    const subtotalDPP = activeItems.reduce(
        (acc, item) => acc + Number(item.quantity || 0) * Number(item.unit_price || 0) * (1 - (Number(item.discount || 0) / 100)),
        0
    );

    const totalTax = Math.max(0, Number(sale.total_amount || 0) - subtotalDPP);
    const totalAmount = subtotalDPP + totalTax;
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsEditing(false); onClose(); } }}>
            <DialogContent className="!max-w-full sm:!max-w-4xl lg:!max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl">
                {/* HEADER MODAL */}
                <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* NO SPK - Tidak bisa diedit (Teks biasa) */}
                                <span className="font-mono font-bold text-slate-900 text-lg sm:text-xl">
                                    {sale.no_spk || "TANPA NO SPK"}
                                </span>

                                {/* TIPE SPK - Tidak bisa diedit (Badge biasa) */}
                                <Badge variant="outline" className="uppercase font-semibold text-xs border-slate-300 text-slate-700">
                                    {sale.spk_type}
                                </Badge>

                                {isEditing ? (
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange("status", e.target.value)}
                                        className="h-8 px-2 text-xs border rounded-md border-slate-300 bg-white"
                                    >
                                        <option value="On Progress">On Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                ) : (
                                    getStatusBadge(sale.status)
                                )}
                            </div>
                            <DialogTitle className="text-xs sm:text-sm font-normal text-slate-500">
                                Detail Transaksi Penjualan & Lampiran Dokumen
                            </DialogTitle>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                                <span className="text-[11px] text-slate-400 font-medium block">Total Transaksi</span>
                                <span className="text-xl sm:text-2xl font-black text-[#0E5EA2]">
                                    {formatCurrency(sale.total_amount)}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                                {isEditing ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isPending}
                                            className="h-8 px-2.5 text-xs"
                                        >
                                            <X className="w-3.5 h-3.5 mr-1" /> Batal
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={isPending}
                                            className="h-8 px-2.5 text-xs bg-[#0E5EA2] hover:bg-[#0b4b82] text-white"
                                        >
                                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                                            Simpan
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                        className="h-8 px-2.5 text-xs border-slate-300 bg-white hover:bg-slate-100"
                                    >
                                        <Pencil className="w-3.5 h-3.5 mr-1 text-slate-600" /> Edit SPK
                                    </Button>
                                )}
                            </div>
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

                        {/* NO PO - Tidak bisa diedit (Teks biasa) */}
                        <div className="flex items-start gap-2.5">
                            <Hash className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs text-slate-400 font-medium block">No. PO</span>
                                <p className="font-semibold text-slate-800">{sale.no_po || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <span className="text-xs text-slate-400 font-medium block">Sales Person</span>
                                {isEditing ? (
                                    <Input
                                        value={formData.sales_person}
                                        onChange={(e) => handleInputChange("sales_person", e.target.value)}
                                        className="h-7 text-xs bg-white mt-0.5"
                                    />
                                ) : (
                                    <p className="font-semibold text-slate-800">{sale.sales_person || "-"}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <span className="text-xs text-slate-400 font-medium block">Tanggal SPK</span>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={formData.spk_date}
                                        onChange={(e) => handleInputChange("spk_date", e.target.value)}
                                        className="h-7 text-xs bg-white mt-0.5"
                                    />
                                ) : (
                                    <p className="font-semibold text-slate-800">
                                        {sale.spk_date ? format(new Date(sale.spk_date), "dd MMMM yyyy", { locale: id }) : "-"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <span className="text-xs text-slate-400 font-medium block">Target Selesai</span>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={formData.expected_date}
                                        onChange={(e) => handleInputChange("expected_date", e.target.value)}
                                        className="h-7 text-xs bg-white mt-0.5"
                                    />
                                ) : (
                                    <p className="font-semibold text-slate-800">
                                        {sale.expected_date ? format(new Date(sale.expected_date), "dd MMMM yyyy", { locale: id }) : "-"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <span className="text-xs text-slate-400 font-medium block">E-Catalog</span>
                                {isEditing ? (
                                    <Input
                                        value={formData.ecatalog}
                                        onChange={(e) => handleInputChange("ecatalog", e.target.value)}
                                        className="h-7 text-xs bg-white mt-0.5"
                                    />
                                ) : (
                                    <p className="font-semibold text-slate-800">{sale.ecatalog || "-"}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <span className="text-xs text-slate-400 font-medium block">Biaya Pengiriman</span>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={formData.shipping_cost}
                                        onChange={(e) => handleInputChange("shipping_cost", Number(e.target.value))}
                                        className="h-7 text-xs bg-white mt-0.5"
                                    />
                                ) : (
                                    <p className="font-semibold text-slate-800">{formatCurrency(sale.shipping_cost || 0)}</p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-200/60">
                            <span className="text-xs text-slate-400 font-medium block mb-1">Catatan SPK</span>
                            {isEditing ? (
                                <Textarea
                                    value={formData.remarks}
                                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                                    className="text-xs bg-white min-h-[60px]"
                                    placeholder="Tambahkan catatan..."
                                />
                            ) : (
                                <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                                    {sale.remarks || "Tidak ada catatan."}
                                </p>
                            )}
                        </div>
                    </div>
                    <SaleDetailTabs
                        sale={sale}
                        subtotalDPP={subtotalDPP}
                        totalTax={totalTax}
                        totalAmount={totalAmount}
                        selectedFiles={selectedFiles}
                        isUploading={isUploading}
                        attachmentRemarks={attachmentRemarks}
                        setAttachmentRemarks={setAttachmentRemarks}
                        handleFileSelect={handleFileSelect}
                        handleUploadAttachments={handleUploadAttachments}
                        formatCurrency={formatCurrency}
                    />
                    {/* TAB ITEM PRODUK & LAMPIRAN */}

                </div>
            </DialogContent>
        </Dialog>
    );
}