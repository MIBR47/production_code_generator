"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Hash,
    MapPin,
    Package,
    PackageCheck,
    Phone,
    Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import {
    PurchaseOrderReceiptData,
    PurchaseOrderSerialized,
} from "@/components/purchases/types";

import { getPurchaseOrderForReceipt } from "@/actions/purchases";

interface PurchaseDetailModalProps {
    purchaseOrder: PurchaseOrderSerialized | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PurchaseDetailModal({
    purchaseOrder,
    isOpen,
    onClose,
}: PurchaseDetailModalProps) {
    const [receiptData, setReceiptData] =
        useState<PurchaseOrderReceiptData | null>(null);

    const [loadingReceipt, setLoadingReceipt] = useState(false);

    useEffect(() => {
        if (!purchaseOrder || !isOpen) return;

        const load = async () => {
            try {
                setLoadingReceipt(true);

                const result =
                    await getPurchaseOrderForReceipt(purchaseOrder.id);

                setReceiptData(result);
            } catch (error) {
                console.error("Error loading receipt data:", error);
            } finally {
                setLoadingReceipt(false);
            }
        };

        load();
    }, [purchaseOrder, isOpen]);

    if (!purchaseOrder) return null;

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

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-h-[90vh] w-[95vw] !max-w-full overflow-y-auto p-0 gap-0 rounded-xl sm:!max-w-4xl lg:!max-w-5xl">
                {/* HEADER */}
                <DialogHeader className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 p-4 pb-4 backdrop-blur-sm sm:p-6">
                    <div className="flex flex-col justify-between gap-3 pr-6 sm:flex-row sm:items-center">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-lg font-bold text-slate-900 sm:text-xl">
                                    {purchaseOrder.po_number}
                                </span>

                                {getStatusBadge(purchaseOrder.status)}
                            </div>

                            <DialogTitle className="text-xs font-normal text-slate-500 sm:text-sm">
                                Detail Purchase Order
                            </DialogTitle>
                        </div>

                        <div className="border-t border-slate-200/60 pt-2 text-left sm:border-t-0 sm:pt-0 sm:text-right">
                            <span className="block text-[11px] font-medium text-slate-400">
                                Total Purchase Order
                            </span>

                            <span className="text-xl font-black text-[#0E5EA2] sm:text-2xl">
                                {formatCurrency(purchaseOrder.total_amount)}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 p-4 sm:p-6">
                    {/* INFORMASI PO */}
                    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
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
                            <TabsTrigger value="items">
                                Item PO
                            </TabsTrigger>

                            <TabsTrigger value="receiving">
                                Receiving
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
                        <TabsContent
                            value="receiving"
                            className="mt-4"
                        >
                            <div className="overflow-hidden rounded-xl border">
                                <div className="border-b bg-slate-50 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Status Penerimaan Barang
                                    </h3>
                                </div>

                                {loadingReceipt ? (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        Memuat receiving...
                                    </div>
                                ) : receiptData ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[750px]">
                                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3">
                                                        Item
                                                    </th>

                                                    <th className="px-4 py-3 text-right">
                                                        Ordered
                                                    </th>

                                                    <th className="px-4 py-3 text-right">
                                                        Received
                                                    </th>

                                                    <th className="px-4 py-3 text-right">
                                                        Remaining
                                                    </th>

                                                    <th className="px-4 py-3">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y">
                                                {receiptData.items.map(
                                                    (poItem) => {
                                                        const fullyReceived =
                                                            poItem.remaining_qty <=
                                                            0;

                                                        const partiallyReceived =
                                                            poItem.already_received_qty >
                                                            0 &&
                                                            poItem.remaining_qty >
                                                            0;

                                                        return (
                                                            <tr
                                                                key={
                                                                    poItem.id
                                                                }
                                                            >
                                                                <td className="px-4 py-4">
                                                                    <p className="font-medium text-slate-800">
                                                                        {
                                                                            poItem
                                                                                .item
                                                                                .name
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-slate-400">
                                                                        {
                                                                            poItem
                                                                                .item
                                                                                .reference
                                                                        }
                                                                    </p>
                                                                </td>

                                                                <td className="px-4 py-4 text-right">
                                                                    {formatQty(
                                                                        poItem.ordered_qty
                                                                    )}{" "}
                                                                    {poItem
                                                                        .purchase_uom
                                                                        .symbol ??
                                                                        poItem
                                                                            .purchase_uom
                                                                            .name}
                                                                </td>

                                                                <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                                                                    {formatQty(
                                                                        poItem.already_received_qty
                                                                    )}{" "}
                                                                    {poItem
                                                                        .purchase_uom
                                                                        .symbol ??
                                                                        poItem
                                                                            .purchase_uom
                                                                            .name}
                                                                </td>

                                                                <td className="px-4 py-4 text-right">
                                                                    {formatQty(
                                                                        poItem.remaining_qty
                                                                    )}{" "}
                                                                    {poItem
                                                                        .purchase_uom
                                                                        .symbol ??
                                                                        poItem
                                                                            .purchase_uom
                                                                            .name}
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    {fullyReceived ? (
                                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                                            Received
                                                                        </Badge>
                                                                    ) : partiallyReceived ? (
                                                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
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
                                                    }
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        Data receiving tidak ditemukan.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}