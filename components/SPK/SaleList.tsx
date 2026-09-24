"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerOption, ProductOption, SaleSerialized, TaxOption } from "@/components/SPK/types";
import { CreateSpkModal } from "./create/CreateSpkModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Paperclip, FileText, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    updateSaleInlineAction,
    updatePoBisInlineAction,
    updateSaleItemInlineAction,
} from "@/actions/spk";
import { SaleCard } from "./modal/SaleCard";
import { EditableCell } from "./EditableCell";
import { SaleDetailModal } from "./modal/SaleDetailModal";
import { FilterCategoryOption, TableFilterBar } from "../TableFilterBar";
import { useProductionFilter } from "../production-codes/useProductionFilter";

interface SaleListProps {
    sales: SaleSerialized[];
    customers?: CustomerOption[];
    products?: ProductOption[];
    taxes?: TaxOption[];
    onAddNew?: () => void;
}

type SaleFilter = {
    id: number;
    category: string;
    value: string;
};
export function SaleList({
    sales,
    customers = [],
    products = [],
    taxes = [],
    onAddNew,
}: SaleListProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // const [selectedSale, setSelectedSale] = useState<SaleSerialized | null>(null);
    const [selectedSaleId, setSelectedSaleId] =
        useState<number | null>(null);

    const selectedSale = useMemo(() => {
        if (selectedSaleId === null) return null;

        return sales.find(
            (sale) => sale.id === selectedSaleId
        ) ?? null;
    }, [sales, selectedSaleId]);

    const [filters, setFilters] = useState<SaleFilter[]>([
        {
            id: 1,
            category: "customer",
            value: "",
        },
    ]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleOpenCreateModal = () => {
        if (onAddNew) {
            onAddNew();
        } else {
            setIsCreateModalOpen(true);
        }
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };

    const formatDateForInput = (dateString?: string | Date) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        return d.toISOString().split("T")[0];
    };
    const addFilter = () => {
        setFilters((prev) => [
            ...prev,
            {
                id: Date.now(),
                category: "customer",
                value: "",
            },
        ]);
    };

    const removeFilter = (id: number) => {
        setFilters((prev) =>
            prev.filter((filter) => filter.id !== id)
        );
    };

    const updateFilterCategory = (
        id: number,
        category: string
    ) => {
        setFilters((prev) =>
            prev.map((filter) =>
                filter.id === id
                    ? {
                        ...filter,
                        category,
                        value: "",
                    }
                    : filter
            )
        );
    };

    const updateFilterValue = (
        id: number,
        value: string
    ) => {
        setFilters((prev) =>
            prev.map((filter) =>
                filter.id === id
                    ? {
                        ...filter,
                        value,
                    }
                    : filter
            )
        );
    };

    const matchesFilter = (
        sale: SaleSerialized,
        category: string,
        searchValue: string
    ) => {
        const keyword = searchValue.toLowerCase().trim();

        if (!keyword) return true;

        switch (category) {
            case "customer":
                return String(sale.customer?.name ?? "")
                    .toLowerCase()
                    .includes(keyword);

            case "no_spk":
                return String(sale.no_spk ?? "")
                    .toLowerCase()
                    .includes(keyword);

            case "spk_date":
                return sale.spk_date
                    ? new Date(sale.spk_date)
                        .toISOString()
                        .split("T")[0] === searchValue
                    : false;

            case "product_name":
                return sale.sale_items?.some((item) =>
                    String(item.product?.product_name ?? "")
                        .toLowerCase()
                        .includes(keyword)
                );

            case "product_code":
                return sale.sale_items?.some((item) =>
                    item.product?.product_codes?.some((code: any) =>
                        String(code.product_code ?? "")
                            .toLowerCase()
                            .includes(keyword)
                    )
                );

            case "quantity":
                return sale.sale_items?.some((item) =>
                    String(item.quantity).includes(keyword)
                );

            case "no_po":
                return String(sale.no_po ?? "")
                    .toLowerCase()
                    .includes(keyword);

            case "no_po_bis":
                return String(
                    sale.sale_additional?.no_po_bis ?? ""
                )
                    .toLowerCase()
                    .includes(keyword);

            case "sales_person":
                return String(sale.sales_person ?? "")
                    .toLowerCase()
                    .includes(keyword);

            case "ecatalog":
                return String(sale.ecatalog ?? "")
                    .toLowerCase()
                    .includes(keyword);

            default:
                return true;
        }
    };

    const categoryOptions = [
        { value: "all", label: "Semua Kategori" },
        { value: "customer", label: "Customer" },
        { value: "no_spk", label: "No SPK" },
        { value: "spk_date", label: "Tgl SPK" },
        { value: "product_name", label: "Nama Barang" },
        { value: "product_code", label: "Code" },
        { value: "quantity", label: "QTY" },
        { value: "no_po", label: "No PO" },
        { value: "no_po_bis", label: "No PO BIS" },
        { value: "sales_person", label: "Sales Person" },
        { value: "ecatalog", label: "E-Catalog" },
    ];
    const handleToday = () => {
        const today = new Date();

        const date = today.toISOString().split("T")[0];

        setStartDate(date);
        setEndDate(date);
    };

    const handleThisWeek = () => {
        const today = new Date();

        // Senin sebagai awal minggu
        const day = today.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;

        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        setStartDate(monday.toISOString().split("T")[0]);
        setEndDate(sunday.toISOString().split("T")[0]);
    };

    const handleThisMonth = () => {
        const today = new Date();

        const firstDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        const lastDay = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        );

        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(lastDay.toISOString().split("T")[0]);
    };
    const filteredData = useMemo(() => {
        return sales.filter((sale) => {

            // =========================
            // FILTER TANGGAL
            // =========================
            if (startDate || endDate) {
                const saleDate = new Date(sale.spk_date)
                    .toISOString()
                    .split("T")[0];

                if (startDate && saleDate < startDate) {
                    return false;
                }

                if (endDate && saleDate > endDate) {
                    return false;
                }
            }

            // =========================
            // MULTIPLE FILTERS
            // =========================
            return filters.every((filter) =>
                matchesFilter(
                    sale,
                    filter.category,
                    filter.value
                )
            );
        });
    }, [
        sales,
        filters,
        startDate,
        endDate,
    ]);
    return (
        <div className="space-y-4 [zoom:0.85]">
            <CreateSpkModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                customers={customers}
                products={products}
                taxes={taxes}
            />

            {/* <SaleDetailModal
                sale={selectedSale}
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                formatCurrency={formatCurrency}
            /> */}
            <SaleDetailModal
                sale={selectedSale}
                isOpen={selectedSaleId !== null}
                onClose={() => setSelectedSaleId(null)}
                formatCurrency={formatCurrency}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold text-black">Daftar SPK</h1>
                    <p className="text-sm text-black/60">
                        Kelola pesanan dan dokumen SPK produksi
                    </p>
                </div>
                <Button onClick={handleOpenCreateModal} className="bg-[#0E5EA2] hover:bg-sky-800 gap-2">
                    <Plus className="w-4 h-4" />
                    Buat SPK Baru
                </Button>
            </div>
            <TableFilterBar
                filters={filters}
                categoryOptions={categoryOptions}

                onAddFilter={addFilter}
                onRemoveFilter={removeFilter}
                onCategoryChange={updateFilterCategory}
                onValueChange={updateFilterValue}

                startDate={startDate}
                setStartDate={setStartDate}

                endDate={endDate}
                setEndDate={setEndDate}

                dateFilterLabel="Filter Tanggal SPK:"

                showQuickDateButtons={true}

                onToday={handleToday}
                onThisWeek={handleThisWeek}
                onThisMonth={handleThisMonth}
            />


            <div>
                <Tabs defaultValue="items" className="w-full space-y-4">
                    <TabsList className="w-full max-w-md h-10 bg-slate-100 rounded-lg border border-[#0E5EA2] ml-auto">
                        <TabsTrigger
                            value="items"
                            className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2] data-active:text-white data-active:hover:text-white hover:text-black"
                        >
                            <Package className="w-4 h-4" />
                            <span>List SPK</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="attachments"
                            className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2] data-active:text-white data-active:hover:text-white hover:text-black"
                        >
                            <Paperclip className="w-4 h-4" />
                            <span>Table</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: CARD VIEW */}
                    <TabsContent value="items" className="space-y-3 m-0">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-base font-semibold text-foreground">Belum ada data SPK</h3>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredData.map((sale) => (
                                    <SaleCard
                                        key={sale.id}
                                        sale={sale}
                                        formatCurrency={formatCurrency}
                                        onOpenDetail={(selected) =>
                                            setSelectedSaleId(selected.id)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2: SEAMLESS EDITABLE TABLE VIEW */}
                    <TabsContent value="attachments" className="m-0">
                        <div className="space-y-4 [zoom:0.80] origin-top-left">
                            <div className="rounded-xl border border-black bg-card shadow-sm overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-[#0E5EA2] hover:bg-[#0E5EA2] border-b-2 border-black">
                                        <TableRow className="group hover:bg-[#0E5EA2] border-b-2 border-black">
                                            <TableHead className="text-center text-white font-semibold w-12">No</TableHead>
                                            <TableHead className="text-white font-semibold">Customer</TableHead>
                                            <TableHead className="text-white font-semibold">No SPK</TableHead>
                                            <TableHead className="text-white font-semibold whitespace-nowrap min-w-[130px]">Tgl SPK</TableHead>
                                            <TableHead className="text-white font-semibold">Nama Barang</TableHead>
                                            <TableHead className="text-white font-semibold">Code</TableHead>
                                            <TableHead className="text-center text-white font-semibold w-20 min-w-[80px]">QTY</TableHead>
                                            <TableHead className="text-white font-semibold">No PO</TableHead>
                                            <TableHead className="text-white font-semibold min-w-[130px]">No PO BIS</TableHead>
                                            <TableHead className="text-white font-semibold min-w-[130px]">Sales Person</TableHead>
                                            <TableHead className="text-white font-semibold min-w-[130px]">E-Catalog</TableHead>
                                            <TableHead className="text-center text-white font-semibold whitespace-nowrap min-w-[140px]">Harga Tanpa PPN</TableHead>
                                            <TableHead className="text-center text-white font-semibold w-20">Disc (%)</TableHead>
                                            <TableHead className="text-center text-white font-semibold whitespace-nowrap">with disc</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">PPN</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">Harga PO (Inc. PPN)</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">Subtotal (Inc. PPN)</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">Total SPK</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.length === 0 ? (
                                            <TableRow className="group">
                                                <TableCell colSpan={17} className="text-center py-8 text-muted-foreground">
                                                    Tidak ada data SPK untuk ditampilkan.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((sale, saleIndex) => {
                                                const items = sale.sale_items || [];
                                                const rowSpan = items.length > 0 ? items.length : 1;
                                                const noPoBis = sale.sale_additional?.no_po_bis || "-";


                                                const isEven = saleIndex % 2 === 0;
                                                const groupBgColor = isEven ? "bg-white" : "bg-sky-50/50";
                                                const hoverBgColor = isEven ? "hover:bg-slate-100/70" : "hover:bg-sky-100/60";

                                                if (items.length === 0) {
                                                    return (
                                                        <TableRow
                                                            key={sale.id}
                                                            className={`group transition-colors border-b-2 border-black ${groupBgColor} ${hoverBgColor}`}
                                                        >
                                                            <TableCell className="text-center font-medium text-slate-600">{saleIndex + 1}</TableCell>
                                                            <TableCell className="font-semibold text-slate-900 whitespace-nowrap">{sale.customer?.name || "-"}</TableCell>
                                                            <TableCell className="font-medium text-[#0E5EA2] whitespace-nowrap">{sale.no_spk || "-"}</TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    type="date"
                                                                    value={formatDateForInput(sale.spk_date)}
                                                                    onSave={async (val: string | number) => {
                                                                        await updateSaleInlineAction({ saleId: sale.id, spk_date: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-slate-400 italic" colSpan={3}>Tidak ada item</TableCell>
                                                            <TableCell className="whitespace-nowrap text-slate-700">{sale.no_po || "-"}</TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    value={noPoBis}
                                                                    onSave={async (val: string | number) => {
                                                                        await updatePoBisInlineAction({ saleId: sale.id, no_po_bis: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    value={sale.sales_person || ""}
                                                                    onSave={async (val: string | number) => {
                                                                        await updateSaleInlineAction({ saleId: sale.id, sales_person: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    value={sale.ecatalog || ""}
                                                                    onSave={async (val: string | number) => {
                                                                        await updateSaleInlineAction({ saleId: sale.id, ecatalog: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-center text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono font-bold text-[#0E5EA2] whitespace-nowrap">
                                                                {formatCurrency(sale.total_amount)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                return items.map((item, itemIndex) => {
                                                    const unitPriceWithoutTax = Number(item.unit_price) || 0;
                                                    const taxRate = item.tax?.rate ? Number(item.tax.rate) : 0;
                                                    const discount = Number(item.discount) || 0;
                                                    const priceAfterDisc = unitPriceWithoutTax - (unitPriceWithoutTax * discount / 100);
                                                    const taxPrice = (priceAfterDisc * (taxRate / 100));
                                                    const hargaPoWithTax = priceAfterDisc * (1 + taxRate / 100);
                                                    const itemSubtotal = Number(item.subtotal) + (taxPrice * item.quantity) || 0;
                                                    const productCode = item.product?.product_type || "-";

                                                    const isLastItem = itemIndex === items.length - 1;

                                                    return (
                                                        <TableRow
                                                            key={`${sale.id}-${item.id || itemIndex}`}
                                                            className={`group transition-colors ${groupBgColor} ${hoverBgColor} ${isLastItem ? "border-b-2 border-black" : "border-b border-slate-200"
                                                                }`}
                                                        >
                                                            {/* Merged Columns (First item row) */}
                                                            {itemIndex === 0 && (
                                                                <>
                                                                    <TableCell rowSpan={rowSpan} className="text-center font-medium text-slate-600">
                                                                        {saleIndex + 1}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="font-semibold text-slate-900 whitespace-nowrap ">
                                                                        {sale.customer?.name || "-"}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="font-medium text-[#0E5EA2] whitespace-nowrap ">
                                                                        {sale.no_spk || "-"}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap">
                                                                        <EditableCell
                                                                            type="date"
                                                                            value={formatDateForInput(sale.spk_date)}
                                                                            onSave={async (val: string | number) => {
                                                                                await updateSaleInlineAction({ saleId: sale.id, spk_date: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </>
                                                            )}

                                                            {/* Item Specific Columns */}
                                                            <TableCell className="max-w-[200px] truncate font-medium text-slate-800" title={item.product?.product_name}>
                                                                {item.product?.product_name || "-"}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs text-slate-600 whitespace-nowrap">
                                                                {productCode}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <EditableCell
                                                                    type="number"
                                                                    className="text-center font-semibold"
                                                                    value={item.quantity}
                                                                    onSave={async (val: string | number) => {
                                                                        await updateSaleItemInlineAction({
                                                                            saleItemId: item.id,
                                                                            saleId: sale.id,
                                                                            quantity: Number(val),
                                                                        });
                                                                    }}
                                                                />
                                                            </TableCell>

                                                            {/* Additional Merged Columns */}
                                                            {itemIndex === 0 && (
                                                                <>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap text-slate-700">
                                                                        {sale.no_po || "-"}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap">
                                                                        <EditableCell
                                                                            value={noPoBis}
                                                                            onSave={async (val: string | number) => {
                                                                                await updatePoBisInlineAction({ saleId: sale.id, no_po_bis: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap">
                                                                        <EditableCell
                                                                            value={sale.sales_person || ""}
                                                                            onSave={async (val: string | number) => {
                                                                                await updateSaleInlineAction({ saleId: sale.id, sales_person: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap">
                                                                        <EditableCell
                                                                            value={sale.ecatalog || ""}
                                                                            onSave={async (val: string | number) => {
                                                                                await updateSaleInlineAction({ saleId: sale.id, ecatalog: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </>
                                                            )}

                                                            {/* Item Numerical Values & Calculations */}
                                                            <TableCell className="text-right font-mono whitespace-nowrap">
                                                                <EditableCell
                                                                    type="number"
                                                                    className="text-right font-medium text-slate-900"
                                                                    value={unitPriceWithoutTax}
                                                                    onSave={async (val: string | number) => {
                                                                        await updateSaleItemInlineAction({
                                                                            saleItemId: item.id,
                                                                            saleId: sale.id,
                                                                            unitPriceWithoutTax: Number(val),
                                                                        });
                                                                    }}
                                                                />
                                                            </TableCell>


                                                            <TableCell className="text-center font-mono text-slate-600">
                                                                {discount}%
                                                            </TableCell>
                                                            <TableCell className="text-center font-mono font-medium text-slate-900 whitespace-nowrap">
                                                                {
                                                                    formatCurrency(priceAfterDisc)
                                                                }
                                                            </TableCell>
                                                            <TableCell className="text-center font-mono text-slate-600 whitespace-nowrap">
                                                                {formatCurrency(taxPrice)}
                                                            </TableCell>
                                                            <TableCell className="text-center font-mono text-slate-700 whitespace-nowrap">
                                                                {formatCurrency(hargaPoWithTax)}
                                                            </TableCell>
                                                            <TableCell className="text-center font-mono font-medium text-slate-900 whitespace-nowrap">
                                                                {formatCurrency(itemSubtotal)}
                                                            </TableCell>


                                                            {/* Total SPK Merged Column */}
                                                            {itemIndex === 0 && (
                                                                <TableCell
                                                                    rowSpan={rowSpan}
                                                                    className="text-right font-mono font-bold text-[#0E5EA2] whitespace-nowrap"
                                                                >
                                                                    {formatCurrency(sale.total_amount)}
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    );
                                                });
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}