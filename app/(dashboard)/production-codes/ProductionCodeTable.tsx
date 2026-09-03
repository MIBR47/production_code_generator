"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { createProductionCode, deleteProductionCode } from "./actions"; // 1. Updated Server Action imports

import { DraftTableRow } from "./components/DraftTableRow";
import { DbTableRow } from "./components/DbTableRow";
import { ProductionCodeModal } from "./components/ProductionCodeModal"; // 2. Updated Modal component

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProductionFilter } from "@/components/production-codes/useProductionFilter";
import { DraftItem, ProductionTableProps } from "@/components/production-codes/types";
import { getNextProductionNumber, formatDateIndonesia } from "@/components/production-codes/utils";
import { TableFilterBar } from "@/components/TableFilterBar";
import { TablePagination } from "@/components/TablePagination";

export default function ProductionCodeTable({ data, products, customers }: ProductionTableProps) {
    const [showCreateProductionCode, setShowCreateProductionCode] = useState(false); // Updated state name
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
    const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

    const [deletingId, setDeletingId] = useState<number | string | null>(null);
    const [isDeletingPending, startDeleteTransition] = useTransition();

    // 3. Updated action state name
    const [stateProductionCode, formActionProductionCode] = useActionState(createProductionCode, {
        success: false,
        message: "",
    });
    const [pendingJumpId, setPendingJumpId] = useState<string | null>(null);

    const filter = useProductionFilter(data, draftItems);

    useEffect(() => {
        if (!pendingJumpId) return;

        const targetIndex = filter.combinedAndSortedData.findIndex(
            (item: any) => item.tempId === pendingJumpId
        );

        if (targetIndex !== -1) {
            const targetPage = Math.floor(targetIndex / filter.itemsPerPage) + 1;
            filter.setCurrentPage(targetPage);
            setPendingJumpId(null);
        }
    }, [draftItems, filter.combinedAndSortedData, filter.itemsPerPage, pendingJumpId]);

    // Toast Notifikasi saat Proses Simpan (Create)
    useEffect(() => {
        if (!lastSubmittedId) return;

        if (stateProductionCode.success) {
            toast.success("Berhasil!", {
                description: stateProductionCode.message || "Data produksi berhasil disimpan ke database.",
            });
            setDraftItems((prev) => prev.filter((item) => item.tempId !== lastSubmittedId));
            setLastSubmittedId(null);
        } else if (stateProductionCode.message) {
            toast.error("Gagal Menyimpan", {
                description: stateProductionCode.message,
            });
            setLastSubmittedId(null);
        }
    }, [stateProductionCode, lastSubmittedId]);

    // Toast Notifikasi untuk Aksi Hapus (Delete)
    const handleDeleteDbItem = (id: number | string) => {
        toast("Konfirmasi Hapus Data", {
            description: "Apakah Anda yakin ingin menghapus data ini secara permanen?",
            action: {
                label: "Hapus",
                onClick: () => {
                    setDeletingId(id);
                    const toastId = toast.loading("Menghapus data...");

                    startDeleteTransition(async () => {
                        const res = await deleteProductionCode(id); // 4. Updated action function call
                        toast.dismiss(toastId);

                        if (res.success) {
                            toast.success("Berhasil!", {
                                description: res.message,
                            });
                        } else {
                            toast.error("Gagal Hapus Data", {
                                description: res.message,
                            });
                        }
                        setDeletingId(null);
                    });
                },
            },
            cancel: {
                label: "Batal",
                onClick: () => { },
            },
        });
    };

    const handleAddDraft = (productId: number, productCodeId: number, customerId: number) => {
        const productObj = products.find((p) => p.id === productId);
        const codeObj = productObj?.product_codes?.find((c: any) => c.id === productCodeId);
        const customerObj = customers.find((c: any) => c.id === customerId);
        const nextProdNum = getNextProductionNumber(productId, productCodeId, data, draftItems);

        const newTempId = Date.now().toString();

        const newDraft: DraftItem = {
            tempId: newTempId,
            productId,
            productName: productObj?.product_name ?? "",
            productType: productObj?.product_type ?? "",
            productCodeId,
            productCode: codeObj?.product_code ?? "",
            customerId,
            customerName: customerObj?.name ?? "",
            productionNumber: nextProdNum,
            batch: "",
            spk: "",
            remarks: "",
            outDate: "",
            item_code_recipient: "", // 5. Updated from recipient to item_code_recipient
            isDraft: true,
        };

        filter.setSearch("");

        setDraftItems((prev) => [...prev, newDraft]);
        setPendingJumpId(newTempId);
        setShowCreateProductionCode(false);

        toast.info("Draft Ditambahkan", {
            description: "Silakan lengkapi detail data sebelum menyimpan.",
        });
    };

    const handleDuplicateDraft = (draftToDuplicate: DraftItem) => {
        const nextProdNum = getNextProductionNumber(
            draftToDuplicate.productId,
            draftToDuplicate.productCodeId,
            data,
            draftItems
        );

        const newTempId = Date.now().toString() + Math.random().toString(36).substring(2, 5);

        const newDraft: DraftItem = {
            ...draftToDuplicate,
            tempId: newTempId,
            productionNumber: nextProdNum,
        };

        filter.setSearch("");
        setDraftItems((prev) => [...prev, newDraft]);
        setPendingJumpId(newTempId);

        toast.info("Draft Diduplikasi", {
            description: `Draft dengan nomor produksi ${nextProdNum} telah dibuat.`,
        });
    };

    const handleDraftChange = (tempId: string, field: keyof DraftItem, value: any) => {
        setDraftItems((prev) =>
            prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
        );
    };

    const handleRemoveDraft = (tempId: string) => {
        setDraftItems((prev) => prev.filter((item) => item.tempId !== tempId));
        toast.info("Draft Dibatalkan");
    };

    // Checkbox Handlers
    const handleSelectToggle = (id: number | string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const dbItems = filter.paginatedData.filter((item) => !item.isDraft);
        const dbItemIds = dbItems.map((item) => item.id);
        const isCurrentPageAllSelected = dbItemIds.every((id) => selectedIds.includes(id));

        if (isCurrentPageAllSelected) {
            setSelectedIds((prev) => prev.filter((id) => !dbItemIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...dbItemIds])));
        }
    };

    // Export Excel
    const handleExportToExcel = () => {
        const filteredDbItems = filter.combinedAndSortedData.filter((item) => !item.isDraft);

        if (filteredDbItems.length === 0) {
            toast.warning("Ekspor Dibatalkan", {
                description: "Tidak ada data yang tersedia untuk diexport berdasarkan filter saat ini.",
            });
            return;
        }

        const targetData = selectedIds.length > 0
            ? filteredDbItems.filter((item) => selectedIds.includes(item.id))
            : filteredDbItems;

        const formattedData = targetData.map((item, index) => ({
            No: index + 1,
            "Nama Barang": item.product?.product_name || "-",
            "Tipe Barang": item.product?.product_type || "-",
            "Kode Barang": item.product_code?.product_code || "-",
            Batch: item.batch || "-",
            "Nomor Produksi": String(item.production_number || 0).padStart(4, "0"),
            "Kode Produksi": item.production_code || "-",
            Customer: item.customer?.name || "-",
            SPK: item.spk || "-",
            Keterangan: item.remarks || "-",
            "Tanggal Kode Keluar": item.out_code_date
                ? new Date(item.out_code_date).toLocaleDateString("id-ID")
                : "-",
            Penerima: item.item_code_recipient || "-", // 6. Updated recipient fallback
            Status: item.status ?? "Tersimpan",
            "Created At": item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID")
                : "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Production Code");

        let dateSuffix = new Date().toISOString().split("T")[0];
        if (filter.startDate && filter.endDate) {
            dateSuffix = `${filter.startDate}_smd_${filter.endDate}`;
        }

        XLSX.writeFile(workbook, `Data_Produksi_${dateSuffix}.xlsx`);

        toast.success("Ekspor Berhasil", {
            description: `${targetData.length} data berhasil diunduh ke Excel.`,
        });
    };

    const availableDbItems = filter.paginatedData.filter((item) => !item.isDraft);
    const isAllSelected =
        availableDbItems.length > 0 &&
        availableDbItems.every((item) => selectedIds.includes(item.id));

    return (
        <div className="space-y-4 [zoom:0.75] origin-top-left">
            {/* Panel Filter */}
            <TableFilterBar
                filterCategory={filter.filterCategory}
                setFilterCategory={(val) => {
                    filter.setFilterCategory(val);
                    filter.setSearch("");
                }}
                search={filter.search}
                setSearch={filter.setSearch}
                startDate={filter.startDate}
                setStartDate={filter.setStartDate}
                endDate={filter.endDate}
                setEndDate={filter.setEndDate}
                selectedCount={selectedIds.length}
                onExport={handleExportToExcel}
                onOpenCreateModal={() => setShowCreateProductionCode(true)} // 7. Updated state trigger
                onToday={filter.setTodayFilter}
                onThisWeek={filter.setThisWeekFilter}
                onThisMonth={filter.setThisMonthFilter}
            />

            {/* Banner Informasi Tanggal */}
            {(filter.startDate || filter.endDate) && (
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 text-[#0E5EA2] px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#0E5EA2] animate-pulse" />
                        <span>
                            Data tanggal :{" "}
                            {filter.startDate && filter.endDate
                                ? `${formatDateIndonesia(filter.startDate)} s/d ${formatDateIndonesia(filter.endDate)}`
                                : filter.startDate
                                    ? `Mulai ${formatDateIndonesia(filter.startDate)}`
                                    : `Sampai ${formatDateIndonesia(filter.endDate)}`}
                        </span>
                    </div>
                    <Badge variant="outline" className="bg-white/80 border-blue-200 text-slate-600">
                        {filter.totalItems} Data Ditemukan
                    </Badge>
                </div>
            )}

            {/* Modal */}
            {showCreateProductionCode && (
                <ProductionCodeModal // 8. Updated Modal component usage
                    products={products}
                    customers={customers}
                    onAddDraft={handleAddDraft}
                    onClose={() => setShowCreateProductionCode(false)}
                />
            )}

            {/* Tabel Data */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#0E5EA2] hover:bg-[#0E5EA2]">
                        <TableRow>
                            <TableHead className="w-10 text-center text-white">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded text-[#0E5EA2] focus:ring-white cursor-pointer"
                                />
                            </TableHead>
                            <TableHead className="text-center text-white">No</TableHead>
                            <TableHead className="text-white">Nama Barang</TableHead>
                            <TableHead className="text-white">Tipe Barang</TableHead>
                            <TableHead className="text-white">Kode Barang</TableHead>
                            <TableHead className="text-white">Batch</TableHead>
                            <TableHead className="text-white">Nomor Produksi</TableHead>
                            <TableHead className="text-white">Kode Produksi</TableHead>
                            <TableHead className="text-white">Customer</TableHead>
                            <TableHead className="text-white">SPK</TableHead>
                            <TableHead className="text-[#0E5EA2] hover:bg-[#0E5EA2] text-white">Keterangan</TableHead>
                            <TableHead className="text-white">Tanggal Kode Keluar</TableHead>
                            <TableHead className="text-white">Penerima</TableHead>
                            <TableHead className="text-center text-white">Status</TableHead>
                            <TableHead className="text-center text-white">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filter.paginatedData.length > 0 ? (
                            filter.paginatedData.map((item: any, index: number) => {
                                const absoluteIndex =
                                    (filter.currentPage - 1) * filter.itemsPerPage + index;

                                return item.isDraft ? (
                                    <DraftTableRow
                                        key={item.tempId}
                                        draft={item}
                                        formAction={formActionProductionCode} // 9. Updated form action
                                        onDraftChange={handleDraftChange}
                                        onRemoveDraft={handleRemoveDraft}
                                        onSubmitStart={setLastSubmittedId}
                                        onDuplicateDraft={handleDuplicateDraft}
                                    />
                                ) : (
                                    <DbTableRow
                                        key={item.id}
                                        item={item}
                                        index={absoluteIndex}
                                        onDelete={handleDeleteDbItem}
                                        isDeleting={isDeletingPending && deletingId === item.id}
                                        isSelected={selectedIds.includes(item.id)}
                                        onSelectToggle={handleSelectToggle}
                                    />
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={15} className="py-8 text-center text-muted-foreground">
                                    Data tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Paginasi */}
                <TablePagination
                    currentPage={filter.currentPage}
                    totalPages={filter.totalPages}
                    totalItems={filter.totalItems}
                    itemsPerPage={filter.itemsPerPage}
                    setItemsPerPage={filter.setItemsPerPage}
                    setCurrentPage={filter.setCurrentPage}
                />
            </div>
        </div>
    );
}