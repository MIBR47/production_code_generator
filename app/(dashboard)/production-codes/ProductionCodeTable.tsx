"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { createUnitProduct, deleteUnitProduct } from "./actions";

// import { TableFilterBar } from "../components/TableFilterBar";
// import { TablePagination } from "./components/TablePagination";
// import { DraftItem, ProductionTableProps } from "./types";
// import { useProductionFilter } from "./useProductionFilter";
// import { formatDateIndonesia, getNextProductionNumber } from "./utils";

import { DraftTableRow } from "./components/DraftTableRow";
import { DbTableRow } from "./components/DbTableRow";
import { UnitProductModal } from "./components/UnitProductModal";

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
    const [showCreateUnitProduct, setShowCreateUnitProduct] = useState(false);
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
    const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

    const [deletingId, setDeletingId] = useState<number | string | null>(null);
    const [isDeletingPending, startDeleteTransition] = useTransition();

    const [stateunitproduct, formActionUnitProduct] = useActionState(createUnitProduct, {
        success: false,
        message: "",
    });

    const filter = useProductionFilter(data, draftItems);

    useEffect(() => {
        if (stateunitproduct.success && lastSubmittedId) {
            setDraftItems((prev) => prev.filter((item) => item.tempId !== lastSubmittedId));
            setLastSubmittedId(null);
        }
    }, [stateunitproduct.success, lastSubmittedId]);

    const handleDeleteDbItem = (id: number | string) => {
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            setDeletingId(id);
            startDeleteTransition(async () => {
                const res = await deleteUnitProduct(id);
                if (!res.success) {
                    alert(res.message);
                }
                setDeletingId(null);
            });
        }
    };

    const handleAddDraft = (productId: number, productCodeId: number, customerId: number) => {
        const productObj = products.find((p) => p.id === productId);
        const codeObj = productObj?.product_codes?.find((c: any) => c.id === productCodeId);
        const customerObj = customers.find((c: any) => c.id === customerId);
        const nextProdNum = getNextProductionNumber(productId, productCodeId, data, draftItems);

        const newDraft: DraftItem = {
            tempId: Date.now().toString(),
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
            outDate: new Date().toISOString().split("T")[0],
            recipient: "",
            isDraft: true,
        };

        setDraftItems((prev) => [...prev, newDraft]);
        setShowCreateUnitProduct(false);
    };

    const handleDraftChange = (tempId: string, field: keyof DraftItem, value: any) => {
        setDraftItems((prev) =>
            prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
        );
    };

    const handleRemoveDraft = (tempId: string) => {
        setDraftItems((prev) => prev.filter((item) => item.tempId !== tempId));
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
        if (selectedIds.length === 0) {
            alert("Silakan pilih minimal satu data untuk diexport.");
            return;
        }

        const selectedData = filter.combinedAndSortedData
            .filter((item) => !item.isDraft && selectedIds.includes(item.id))
            .map((item, index) => ({
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
                "Out Date": item.out_code_date
                    ? new Date(item.out_code_date).toLocaleDateString("id-ID")
                    : "-",
                Recipient: item.Item_code_recipient || item.recipient || "-",
                Status: item.status ?? "Tersimpan",
                "Created At": item.created_at
                    ? new Date(item.created_at).toLocaleDateString("id-ID")
                    : "-",
            }));

        const worksheet = XLSX.utils.json_to_sheet(selectedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Production Code");
        XLSX.writeFile(
            workbook,
            `Data_Produksi_${new Date().toISOString().split("T")[0]}.xlsx`
        );
    };

    const availableDbItems = filter.paginatedData.filter((item) => !item.isDraft);
    const isAllSelected =
        availableDbItems.length > 0 &&
        availableDbItems.every((item) => selectedIds.includes(item.id));

    return (
        <div className="space-y-4">
            {/* Panel Filter */}
            <TableFilterBar
                filterCategory={filter.filterCategory}
                setFilterCategory={filter.setFilterCategory}
                search={filter.search}
                setSearch={filter.setSearch}
                startDate={filter.startDate}
                setStartDate={filter.setStartDate}
                endDate={filter.endDate}
                setEndDate={filter.setEndDate}
                selectedCount={selectedIds.length}
                onExport={handleExportToExcel}
                onOpenCreateModal={() => setShowCreateUnitProduct(true)}
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
            {showCreateUnitProduct && (
                <UnitProductModal
                    products={products}
                    customers={customers}
                    onAddDraft={handleAddDraft}
                    onClose={() => setShowCreateUnitProduct(false)}
                />
            )}

            {/* Tabel Data shadcn */}
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
                            <TableHead className="text-white">Keterangan</TableHead>
                            <TableHead className="text-white">Out Date</TableHead>
                            <TableHead className="text-white">Recipient</TableHead>
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
                                        formAction={formActionUnitProduct}
                                        onDraftChange={handleDraftChange}
                                        onRemoveDraft={handleRemoveDraft}
                                        onSubmitStart={setLastSubmittedId}
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