"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CreditCard,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Hash,
    Loader2,
    MapPin,
    Package,
    PackageCheck,
    Paperclip,
    Phone,
    Truck,
    Upload,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    PurchaseOrderAttachmentSerialized,
    PurchaseOrderReceiptData,
    PurchasePaymentData,
    PurchaseOrderSerialized,
} from "@/components/purchases/types";
import {
    createPurchasePaymentAction,
    deletePurchaseOrderAttachmentAction,
    getPurchaseOrderAttachments,
    getPurchaseOrderForReceipt,
    getPurchasePaymentData,
    uploadPurchaseOrderAttachmentAction,
} from "@/actions/purchases";

interface PurchaseDetailPageProps {
    purchaseOrder: PurchaseOrderSerialized;
}

function getTodayDateInput() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export default function PurchaseDetailPage({ purchaseOrder }: PurchaseDetailPageProps) {
    const [receiptData, setReceiptData] = useState<PurchaseOrderReceiptData | null>(null);
    const [loadingReceipt, setLoadingReceipt] = useState(false);
    const [attachments, setAttachments] = useState<PurchaseOrderAttachmentSerialized[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [attachmentRemarks, setAttachmentRemarks] = useState("");
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);
    const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null);
    const [paymentData, setPaymentData] = useState<PurchasePaymentData | null>(null);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [paymentDate, setPaymentDate] = useState(getTodayDateInput());
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Transfer Bank");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentRemarks, setPaymentRemarks] = useState("");
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);


    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoadingReceipt(true);
                setLoadingAttachments(true);
                setLoadingPayment(true);
                const [receiptResult, attachmentResult, paymentResult] = await Promise.all([
                    getPurchaseOrderForReceipt(purchaseOrder.id),
                    getPurchaseOrderAttachments(purchaseOrder.id),
                    getPurchasePaymentData(purchaseOrder.id),
                ]);
                if (cancelled) return;
                setReceiptData(receiptResult);
                setAttachments(attachmentResult);
                setPaymentData(paymentResult);
            } catch (error) {
                console.error("Error loading receipt data:", error);
            } finally {
                if (!cancelled) {
                    setLoadingReceipt(false);
                    setLoadingAttachments(false);
                    setLoadingPayment(false);
                }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [purchaseOrder.id]);

    useEffect(() => {
        setPaymentDate(getTodayDateInput());
        setPaymentAmount("");
        setPaymentMethod("Transfer Bank");
        setPaymentReference("");
        setPaymentRemarks("");
        setPaymentError(null);
        setPaymentSuccess(null);
    }, [purchaseOrder.id]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };
    const formatQty = (value: number) => {
        return value.toLocaleString("id-ID", {
            maximumFractionDigits: 3,
        });
    };
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "DRAFT":

                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-slate-300 bg-slate-100 text-slate-700"
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Draft
                    </Badge>
                );
            case "CONFIRMED":
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-blue-200 bg-blue-100 text-blue-700"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed
                    </Badge>
                );
            case "PARTIALLY_RECEIVED":
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-amber-200 bg-amber-100 text-amber-700"
                    >
                        <Package className="h-3.5 w-3.5" />
                        Partially Received
                    </Badge>
                );
            case "RECEIVED":
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-emerald-200 bg-emerald-100 text-emerald-700"
                    >
                        <PackageCheck className="h-3.5 w-3.5" />
                        Received
                    </Badge>
                );
            case "CANCELLED":
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-red-200 bg-red-100 text-red-700"
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentStatusBadge = (status: PurchasePaymentData["summary"]["status"]) => {
        if (status === "PAID") return <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">Paid</Badge>;
        if (status === "PARTIALLY_PAID") return <Badge className="border border-amber-200 bg-amber-50 text-amber-700">Partially Paid</Badge>;
        return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">Unpaid</Badge>;
    };

    const paymentProgress = paymentData && paymentData.summary.total_amount > 0
        ? Math.min(100, (paymentData.summary.paid_amount / paymentData.summary.total_amount) * 100)
        : 0;
    const canCreatePayment = (purchaseOrder.status === "CONFIRMED" || purchaseOrder.status === "PARTIALLY_RECEIVED" || purchaseOrder.status === "RECEIVED") && !!paymentData && paymentData.summary.remaining_amount > 0;

    const loadPaymentData = async () => {
        if (!purchaseOrder) return;
        try {
            setLoadingPayment(true);
            setPaymentData(await getPurchasePaymentData(purchaseOrder.id));
        } catch (error) {
            console.error("Error loading payment data:", error);
            setPaymentError("Gagal memuat data pembayaran.");
        } finally {
            setLoadingPayment(false);
        }
    };
    const openPaymentDialog = () => {
        setPaymentDate(getTodayDateInput());
        setPaymentAmount("");
        setPaymentMethod("Transfer Bank");
        setPaymentReference("");
        setPaymentRemarks("");
        setPaymentError(null);
        setPaymentSuccess(null);
        setIsPaymentDialogOpen(true);
    };

    const closePaymentDialog = () => {
        if (isSavingPayment) return;
        setIsPaymentDialogOpen(false);
    };

    const openAttachmentDialog = () => {
        setAttachmentError(null);
        setSelectedFiles([]);
        setAttachmentRemarks("");
        setIsAttachmentDialogOpen(true);
    };

    const closeAttachmentDialog = () => {
        if (isUploading) return;
        setIsAttachmentDialogOpen(false);
        setSelectedFiles([]);
        setAttachmentRemarks("");
        setAttachmentError(null);
    };
    const handleCreatePayment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!purchaseOrder || !paymentData) return;
        const amount = Number(paymentAmount);
        if (!paymentDate) return setPaymentError("Tanggal pembayaran wajib diisi.");
        if (!Number.isFinite(amount) || amount <= 0) return setPaymentError("Nominal pembayaran harus lebih dari 0.");
        if (Math.round(amount * 100) > Math.round(paymentData.summary.remaining_amount * 100)) return setPaymentError("Nominal pembayaran melebihi sisa tagihan.");

        try {
            setIsSavingPayment(true);
            setPaymentError(null);
            setPaymentSuccess(null);
            const result = await createPurchasePaymentAction({
                purchase_order_id: purchaseOrder.id,
                payment_date: paymentDate,
                amount,
                payment_method: paymentMethod.trim() || null,
                reference_number: paymentReference.trim() || null,
                remarks: paymentRemarks.trim() || null,
            });
            if (!result.success) {
                setPaymentError(result.message);
                return;
            }
            setPaymentSuccess(result.payment_number ? `${result.message} (${result.payment_number})` : result.message);
            setPaymentAmount("");
            setPaymentReference("");
            setPaymentRemarks("");
            await loadPaymentData();
        } catch (error) {
            console.error("Error creating payment:", error);
            setPaymentError("Terjadi kesalahan saat mencatat pembayaran.");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const loadAttachments = async () => {
        if (!purchaseOrder) return;
        try {
            setLoadingAttachments(true);
            const result =
                await getPurchaseOrderAttachments(
                    purchaseOrder.id
                );
            setAttachments(result);
        } catch (error) {
            console.error(
                "Error loading attachments:",
                error
            );
        } finally {
            setLoadingAttachments(false);
        }
    };

    const handleFileSelect = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files) return;
        setSelectedFiles(
            Array.from(e.target.files)
        );
        setAttachmentError(null);
    };

    const handleUploadAttachments = async () => {
        if (!purchaseOrder) return;
        if (!selectedFiles.length) {
            setAttachmentError(
                "Pilih minimal satu file."
            );
            return;
        }
        try {
            setIsUploading(true);
            setAttachmentError(null);
            const formData = new FormData();
            formData.append(
                "purchase_order_id",
                String(purchaseOrder.id)
            );
            formData.append(
                "remarks",
                attachmentRemarks
            );
            selectedFiles.forEach((file) => {
                formData.append(
                    "files",
                    file
                );
            });
            const result =
                await uploadPurchaseOrderAttachmentAction(
                    formData
                );
            if (!result.success) {
                setAttachmentError(result.message);
                return;
            }
            setSelectedFiles([]);
            setAttachmentRemarks("");
            await loadAttachments();
        } catch (error) {
            console.error(error);
            setAttachmentError(
                "Terjadi kesalahan saat upload file."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAttachment = async (
        attachment: PurchaseOrderAttachmentSerialized
    ) => {
        const confirmed = window.confirm(
            `Hapus attachment "${attachment.file_name}"?`
        );
        if (!confirmed) return;
        try {
            setDeletingAttachmentId(attachment.id);
            setAttachmentError(null);
            const result =
                await deletePurchaseOrderAttachmentAction(
                    attachment.id
                );
            if (!result.success) {
                setAttachmentError(result.message);
                return;
            }
            await loadAttachments();
        } catch (error) {
            console.error(
                "Error deleting attachment:",
                error
            );
            setAttachmentError(
                "Terjadi kesalahan saat menghapus attachment."
            );
        } finally {
            setDeletingAttachmentId(null);
        }
    };
    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* PAGE HEADER */}
                <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0 space-y-3">
                        <Link href="/purchases" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0E5EA2]">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Purchases
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    {purchaseOrder.po_number}
                                </h1>
                                {getStatusBadge(purchaseOrder.status)}
                                {paymentData && getPaymentStatusBadge(paymentData.summary.status)}
                            </div>
                            <p className="mt-1 text-sm text-slate-500">Detail dan aktivitas Purchase Order</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm sm:min-w-64 sm:text-right">
                        <span className="block text-xs font-medium text-slate-400">Total Purchase Order</span>
                        <span className="text-xl font-bold text-[#0E5EA2] sm:text-2xl">
                            {formatCurrency(purchaseOrder.total_amount)}
                        </span>
                    </div>
                </header>
                <div className="space-y-6">
                    {/* INFORMASI PO */}
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                        {/* Supplier */}
                        <div className="flex items-start gap-2.5">
                            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                                <span className="block text-xs font-medium text-slate-400">
                                    Supplier
                                </span>
                                <p className="font-semibold text-slate-800">
                                    {purchaseOrder.supplier.name}
                                </p>
                            </div>
                        </div>
                        {/* PO */}
                        <div className="flex items-start gap-2.5">
                            <Hash className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <div>
                                <span className="block text-xs font-medium text-slate-400">
                                    No. PO
                                </span>
                                <p className="font-semibold text-slate-800">
                                    {purchaseOrder.po_number}
                                </p>
                            </div>
                        </div>
                        {/* Order Date */}
                        <div className="flex items-start gap-2.5">
                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <div>
                                <span className="block text-xs font-medium text-slate-400">
                                    Tanggal PO
                                </span>
                                <p className="font-semibold text-slate-800">
                                    {format(
                                        new Date(purchaseOrder.order_date),
                                        "dd MMMM yyyy",
                                        { locale: id }
                                    )}
                                </p>
                            </div>
                        </div>
                        {/* Expected */}
                        <div className="flex items-start gap-2.5">
                            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <div>
                                <span className="block text-xs font-medium text-slate-400">
                                    Expected Date
                                </span>
                                <p className="font-semibold text-slate-800">
                                    {purchaseOrder.expected_date
                                        ? format(
                                            new Date(
                                                purchaseOrder.expected_date
                                            ),
                                            "dd MMMM yyyy",
                                            { locale: id }
                                        )
                                        : "-"}
                                </p>
                            </div>
                        </div>
                        {/* Contact */}
                        <div className="flex items-start gap-2.5">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <div>
                                <span className="block text-xs font-medium text-slate-400">
                                    Kontak Supplier
                                </span>
                                <p className="font-semibold text-slate-800">
                                    {purchaseOrder.supplier.contact || "-"}
                                </p>
                            </div>
                        </div>
                        {/* Address */}
                        <div className="flex items-start gap-2.5">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <div>
                                <span className="block text-xs font-medium text-slate-400">
                                    Alamat Supplier
                                </span>
                                <p className="line-clamp-2 font-semibold text-slate-800">
                                    {purchaseOrder.supplier.address || "-"}
                                </p>
                            </div>
                        </div>
                        {/* Remarks */}
                        <div className="border-t border-slate-200/60 pt-3 sm:col-span-2 lg:col-span-3">
                            <span className="mb-1 block text-xs font-medium text-slate-400">
                                Catatan Purchase Order
                            </span>
                            <p className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs italic text-slate-600">
                                {purchaseOrder.remarks ||
                                    "Tidak ada catatan."}
                            </p>
                        </div>
                    </div>
                    {/* TABS */}
                    <Tabs defaultValue="items">
                        <TabsList>
                            <TabsTrigger value="items"
                                className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2]  data-active:text-white data-active:shadow-sm data-active:hover:text-white hover:text-black"
                            >
                                Item PO
                            </TabsTrigger>
                            <TabsTrigger value="receiving"
                                // className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-active:hover:text-white hover:text-black"
                                // className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-white data-[state=active]:shadow-sm data-active:hover:text-white hover:text-black"
                                className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2]  data-active:text-white data-active:shadow-sm data-active:hover:text-white hover:text-black"

                            >
                                Receiving
                            </TabsTrigger>
                            <TabsTrigger value="attachments"
                                className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2]  data-active:text-white data-active:shadow-sm data-active:hover:text-white hover:text-black"

                            //    className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-active:hover:text-white hover:text-black"
                            >
                                Attachments
                                {attachments.length > 0 && (
                                    <span className="ml-1.5 rounded-full text-white bg-[#606E7A] px-1.5 text-[10px]">
                                        {attachments.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="payments"
                                className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2]  data-active:text-white data-active:shadow-sm data-active:hover:text-white hover:text-black"

                            // className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:text-black"
                            >
                                Payments
                                {paymentData && paymentData.payments.length > 0 && (
                                    <span className="ml-1.5 rounded-full bg-[#606E7A] px-1.5 text-[10px] text-white">{paymentData.payments.length}</span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                        {/* ITEMS */}
                        <TabsContent value="items" className="mt-4">
                            <div className="overflow-hidden rounded-xl border">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Item
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3">
                                                    UOM
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Unit Price
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {purchaseOrder.items.map(
                                                (poItem) => (
                                                    <tr
                                                        key={poItem.id}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <p className="font-medium text-slate-800">
                                                                {
                                                                    poItem.item
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {
                                                                    poItem.item
                                                                        .reference
                                                                }
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-medium">
                                                            {formatQty(
                                                                poItem.quantity
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {poItem.uom
                                                                .symbol ??
                                                                poItem.uom.name}
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            {formatCurrency(
                                                                poItem.unit_price
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-semibold">
                                                            {formatCurrency(
                                                                poItem.subtotal
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                        <tfoot className="border-t bg-slate-50">
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-4 text-right text-sm font-semibold"
                                                >
                                                    Total
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-[#0E5EA2]">
                                                    {formatCurrency(
                                                        purchaseOrder.total_amount
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>
                        {/* RECEIVING */}
                        <TabsContent value="receiving" className="mt-4 space-y-4">
                            {/* RECEIVING SUMMARY */}
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="border-b bg-slate-50 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Receiving Summary
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Progress penerimaan berdasarkan quantity Purchase Order.
                                    </p>
                                </div>
                                {loadingReceipt ? (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        Memuat data receiving...
                                    </div>
                                ) : receiptData ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[750px]">
                                            <thead className="bg-slate-50/60 text-left text-xs uppercase text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3">Item</th>
                                                    <th className="px-4 py-3 text-right">Ordered</th>
                                                    <th className="px-4 py-3 text-right">Received</th>
                                                    <th className="px-4 py-3 text-right">Remaining</th>
                                                    <th className="px-4 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {receiptData.items.map((poItem) => {
                                                    const fullyReceived =
                                                        poItem.remaining_qty <= 0;
                                                    const partiallyReceived =
                                                        poItem.already_received_qty > 0 &&
                                                        poItem.remaining_qty > 0;
                                                    const purchaseUom =
                                                        poItem.purchase_uom.symbol ??
                                                        poItem.purchase_uom.name;
                                                    return (
                                                        <tr
                                                            key={poItem.id}
                                                            className="hover:bg-slate-50/60"
                                                        >
                                                            <td className="px-4 py-4">
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {poItem.item.name}
                                                                </p>
                                                                <p className="mt-0.5 font-mono text-xs text-slate-400">
                                                                    {poItem.item.reference}
                                                                </p>
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                                                                {formatQty(poItem.ordered_qty)}{" "}
                                                                {purchaseUom}
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-emerald-600">
                                                                {formatQty(
                                                                    poItem.already_received_qty
                                                                )}{" "}
                                                                {purchaseUom}
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                                                                {formatQty(
                                                                    poItem.remaining_qty
                                                                )}{" "}
                                                                {purchaseUom}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {fullyReceived ? (
                                                                    <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                                        Received
                                                                    </Badge>
                                                                ) : partiallyReceived ? (
                                                                    <Badge className="border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                                        Partial
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-slate-50 text-slate-500"
                                                                    >
                                                                        Waiting
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        Data receiving tidak ditemukan.
                                    </div>
                                )}
                            </div>
                            {/* GOODS RECEIPT HISTORY */}
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="border-b bg-slate-50 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Goods Receipt History
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Riwayat penerimaan barang dari Purchase Order ini.
                                    </p>
                                </div>
                                {loadingReceipt ? (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        Memuat riwayat penerimaan...
                                    </div>
                                ) : !receiptData?.receipts.length ? (
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <Package className="mb-3 h-8 w-8 text-slate-300" />
                                        <p className="text-sm font-medium text-slate-600">
                                            Belum ada penerimaan barang
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Goods Receipt akan muncul setelah barang diterima.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {receiptData.receipts.map((receipt) => (
                                            <div
                                                key={receipt.id}
                                                className="p-4 sm:p-5"
                                            >
                                                {/* GR HEADER */}
                                                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-mono text-sm font-bold text-slate-800">
                                                                {receipt.receipt_number}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                                            >
                                                                <PackageCheck className="mr-1 h-3.5 w-3.5" />
                                                                Received
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {format(
                                                                new Date(receipt.receipt_date),
                                                                "dd MMMM yyyy",
                                                                { locale: id }
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* GR ITEMS */}
                                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full min-w-[750px]">
                                                            <thead className="bg-slate-50 text-left text-xs text-slate-500">
                                                                <tr>
                                                                    <th className="px-3 py-2.5">
                                                                        Item
                                                                    </th>
                                                                    <th className="px-3 py-2.5 text-right">
                                                                        Received
                                                                    </th>
                                                                    <th className="px-3 py-2.5 text-right">
                                                                        Actual Qty
                                                                    </th>
                                                                    <th className="px-3 py-2.5">
                                                                        Lot Number
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y">
                                                                {receipt.items.map(
                                                                    (receiptItem) => (
                                                                        <tr
                                                                            key={receiptItem.id}
                                                                        >
                                                                            <td className="px-3 py-3">
                                                                                <p className="text-sm font-medium text-slate-800">
                                                                                    {
                                                                                        receiptItem
                                                                                            .item.name
                                                                                    }
                                                                                </p>
                                                                                <p className="font-mono text-xs text-slate-400">
                                                                                    {
                                                                                        receiptItem
                                                                                            .item
                                                                                            .reference
                                                                                    }
                                                                                </p>
                                                                            </td>
                                                                            <td className="whitespace-nowrap px-3 py-3 text-right text-sm">
                                                                                {formatQty(
                                                                                    receiptItem.received_purchase_qty
                                                                                )}{" "}
                                                                                {receiptItem
                                                                                    .purchase_uom
                                                                                    .symbol ??
                                                                                    receiptItem
                                                                                        .purchase_uom
                                                                                        .name}
                                                                            </td>
                                                                            <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold text-emerald-600">
                                                                                {formatQty(
                                                                                    receiptItem.actual_qty
                                                                                )}{" "}
                                                                                {receiptItem.uom
                                                                                    .symbol ??
                                                                                    receiptItem.uom
                                                                                        .name}
                                                                            </td>
                                                                            <td className="px-3 py-3">
                                                                                {receiptItem.lots
                                                                                    .length ? (
                                                                                    <div className="flex flex-wrap gap-1.5">
                                                                                        {receiptItem.lots.map(
                                                                                            (
                                                                                                lot
                                                                                            ) => (
                                                                                                <Badge
                                                                                                    key={lot.id}
                                                                                                    variant="outline"
                                                                                                    className="font-mono text-xs text-black border-black"
                                                                                                >
                                                                                                    {lot.lot_number}
                                                                                                </Badge>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-sm text-slate-400">
                                                                                        -
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                {receipt.remarks && (
                                                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                                                        <span className="block text-[11px] font-medium text-slate-400">
                                                            Remarks
                                                        </span>
                                                        <p className="mt-0.5 text-xs text-slate-600">
                                                            {receipt.remarks}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        {/* ATTACHMENTS */}
                        <TabsContent
                            value="attachments"
                            className="mt-4 space-y-4"
                        >
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="flex flex-col gap-3 border-b bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">Purchase Documents</h3>
                                        <p className="mt-0.5 text-xs text-slate-400">Invoice, quotation, surat jalan, dan dokumen Purchase Order lainnya.</p>
                                    </div>
                                    <button type="button" onClick={openAttachmentDialog} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0E5EA2] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800">
                                        <Upload className="h-4 w-4" />
                                        Upload Attachment
                                    </button>
                                </div>
                                {attachmentError && !isAttachmentDialogOpen && (
                                    <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {attachmentError}
                                    </div>
                                )}
                            </div>
                            {/* ATTACHMENT LIST */}
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">Daftar Lampiran</h3>
                                        <p className="mt-0.5 text-xs text-slate-400">{attachments.length} file tersimpan</p>
                                    </div>
                                    <Paperclip className="h-4 w-4 text-slate-400" />
                                </div>
                                {loadingAttachments ? (
                                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-400">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat attachment...
                                    </div>
                                ) : attachments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <Paperclip className="mb-3 h-8 w-8 text-slate-300" />
                                        <p className="text-sm font-medium text-slate-600">
                                            Belum ada attachment
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Upload dokumen Purchase Order di atas.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {attachments.map(
                                            (attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center"
                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                        <FileText className="h-5 w-5 text-slate-500" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                            {attachment.file_name}
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                                            <span>
                                                                {format(
                                                                    new Date(
                                                                        attachment.created_at
                                                                    ),
                                                                    "dd MMMM yyyy HH:mm",
                                                                    {
                                                                        locale: id,
                                                                    }
                                                                )}
                                                            </span>
                                                            {attachment.remarks && (
                                                                <span className="text-slate-500">
                                                                    {attachment.remarks}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={attachment.file_path}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Buka file"
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0E5EA2]"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                        <a
                                                            href={attachment.file_path}
                                                            download={attachment.file_name}
                                                            title="Download"
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0E5EA2]"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                        <button
                                                            type="button"
                                                            title="Hapus attachment"
                                                            disabled={deletingAttachmentId === attachment.id}
                                                            onClick={() =>
                                                                handleDeleteAttachment(attachment)
                                                            }
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {deletingAttachmentId === attachment.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        {/* PAYMENTS */}
                        <TabsContent value="payments" className="mt-4 space-y-4">
                            {/* PAYMENT SUMMARY */}
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="flex flex-col gap-3 border-b bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">Payment Summary</h3>
                                        <p className="mt-0.5 text-xs text-slate-400">Ringkasan pembayaran Purchase Order.</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {paymentData && getPaymentStatusBadge(paymentData.summary.status)}
                                        {canCreatePayment && (
                                            <button type="button" onClick={openPaymentDialog} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0E5EA2] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-sky-800">
                                                <CreditCard className="h-4 w-4" />
                                                Tambah Pembayaran
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {loadingPayment ? (
                                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-400">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat data pembayaran...
                                    </div>
                                ) : paymentData ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <span className="text-xs text-slate-400">Total Purchase Order</span>
                                                <p className="mt-1 text-lg font-bold text-slate-800">{formatCurrency(paymentData.summary.total_amount)}</p>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <span className="text-xs text-slate-400">Total Dibayar</span>
                                                <p className="mt-1 text-lg font-bold text-emerald-600">{formatCurrency(paymentData.summary.paid_amount)}</p>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <span className="text-xs text-slate-400">Sisa Tagihan</span>
                                                <p className="mt-1 text-lg font-bold text-amber-600">{formatCurrency(paymentData.summary.remaining_amount)}</p>
                                            </div>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                                                <span>Payment Progress</span>
                                                <span>{paymentProgress.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${paymentProgress}%` }} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-8 text-center text-sm text-slate-400">Data pembayaran tidak ditemukan.</div>
                                )}
                            </div>

                            {paymentSuccess && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {paymentSuccess}
                                </div>
                            )}
                            {!loadingPayment && paymentData && !canCreatePayment && paymentData.summary.remaining_amount > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                    Pembayaran hanya dapat dicatat untuk PO Confirmed, Partially Received, atau Received.
                                </div>
                            )}
                            {/* PAYMENT HISTORY */}
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">Payment History</h3>
                                        <p className="mt-0.5 text-xs text-slate-400">{paymentData?.payments.length ?? 0} transaksi pembayaran</p>
                                    </div>
                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                </div>
                                {loadingPayment ? (
                                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-400">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat riwayat pembayaran...
                                    </div>
                                ) : !paymentData?.payments.length ? (
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <CreditCard className="mb-3 h-8 w-8 text-slate-300" />
                                        <p className="text-sm font-medium text-slate-600">Belum ada pembayaran</p>
                                        <p className="mt-1 text-xs text-slate-400">Riwayat pembayaran akan muncul setelah pembayaran dicatat.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {paymentData.payments.map((payment) => (
                                            <div key={payment.id} className="space-y-3 p-4 sm:p-5">
                                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                                    <div>
                                                        <p className="font-mono text-sm font-bold text-slate-800">{payment.payment_number}</p>
                                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {format(new Date(payment.payment_date), "dd MMMM yyyy", { locale: id })}
                                                        </div>
                                                    </div>
                                                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(payment.amount)}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                                    {payment.payment_method && <span>Metode: <strong className="font-medium text-slate-700">{payment.payment_method}</strong></span>}
                                                    {payment.reference_number && <span>Referensi: <strong className="font-medium text-slate-700">{payment.reference_number}</strong></span>}
                                                </div>
                                                {payment.remarks && (
                                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                                        <span className="block text-[11px] font-medium text-slate-400">Remarks</span>
                                                        <p className="mt-0.5 text-xs text-slate-600">{payment.remarks}</p>
                                                    </div>
                                                )}
                                                {payment.attachments.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {payment.attachments.map((attachment) => (
                                                            <a key={attachment.id} href={attachment.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50">
                                                                <FileText className="h-3.5 w-3.5" />
                                                                {attachment.file_name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                    {/* UPLOAD ATTACHMENT DIALOG */}
                    <Dialog open={isAttachmentDialogOpen} onOpenChange={(open) => { if (isUploading) return; if (open) setIsAttachmentDialogOpen(true); else closeAttachmentDialog(); }}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Upload Attachment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500">Tambahkan invoice, quotation, surat jalan, atau dokumen pendukung Purchase Order.</p>
                                {attachmentError && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{attachmentError}</div>
                                )}
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-center transition hover:border-[#0E5EA2] hover:bg-slate-50">
                                    <Upload className="mb-2 h-7 w-7 text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-700">Pilih file untuk diunggah</span>
                                    <span className="mt-1 text-xs text-slate-400">PDF, JPG, PNG • Maksimal 10 MB/file</span>
                                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
                                </label>
                                {selectedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-slate-600">File terpilih ({selectedFiles.length})</p>
                                        {selectedFiles.map((file, index) => (
                                            <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                                                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
                                                <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Remarks (Opsional)</label>
                                    <textarea rows={2} value={attachmentRemarks} onChange={(e) => setAttachmentRemarks(e.target.value)} placeholder="Contoh: Invoice supplier, surat jalan..." className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5EA2]" />
                                </div>
                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                    <button type="button" onClick={closeAttachmentDialog} disabled={isUploading} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Batal</button>
                                    <button type="button" onClick={handleUploadAttachments} disabled={isUploading || !selectedFiles.length} className="inline-flex items-center gap-2 rounded-lg bg-[#0E5EA2] px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50">
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        {isUploading ? "Uploading..." : "Upload File"}
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* ADD PAYMENT DIALOG */}
                    <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => { if (isSavingPayment) return; if (open) setIsPaymentDialogOpen(true); else closePaymentDialog(); }}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Tambah Pembayaran</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Catat pembayaran DP, cicilan, atau pelunasan Purchase Order.</p>
                                <p className="text-xs text-slate-400">PO: <span className="font-mono font-medium text-slate-600">{purchaseOrder.po_number}</span> · Sisa tagihan: <span className="font-semibold text-amber-600">{paymentData ? formatCurrency(paymentData.summary.remaining_amount) : "-"}</span></p>
                            </div>
                            <form onSubmit={handleCreatePayment} className="space-y-4">
                                {paymentError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{paymentError}</div>}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600">Tanggal Pembayaran</label>
                                        <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5EA2]" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600">Nominal Pembayaran</label>
                                        <input type="number" required min="0.01" step="0.01" max={paymentData?.summary.remaining_amount ?? undefined} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Masukkan nominal" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5EA2]" />
                                        <p className="mt-1 text-[11px] text-slate-400">Maksimal {formatCurrency(paymentData?.summary.remaining_amount ?? 0)}</p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600">Metode Pembayaran</label>
                                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0E5EA2]">
                                            <option value="Transfer Bank">Transfer Bank</option>
                                            <option value="Cash">Cash / Tunai</option>
                                            <option value="Giro / Cek">Giro / Cek</option>
                                            <option value="Kartu Debit">Kartu Debit</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600">No. Referensi Bank / Transaksi (Opsional)</label>
                                        <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Nomor referensi pada bukti transaksi" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5EA2]" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600">Remarks (Opsional)</label>
                                        <textarea rows={3} value={paymentRemarks} onChange={(e) => setPaymentRemarks(e.target.value)} placeholder="Contoh: DP 30%, pembayaran termin pertama..." className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5EA2]" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                    <button type="button" onClick={closePaymentDialog} disabled={isSavingPayment} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Batal</button>
                                    <button type="submit" disabled={isSavingPayment || !paymentAmount || !paymentData} className="inline-flex items-center gap-2 rounded-lg bg-[#0E5EA2] px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50">
                                        {isSavingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                                        {isSavingPayment ? "Menyimpan..." : "Simpan Pembayaran"}
                                    </button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </main>
    );
}
