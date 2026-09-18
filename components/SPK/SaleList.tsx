"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerOption, ProductOption, SaleSerialized, TaxOption } from "@/components/SPK/types";
import { CreateSpkModal } from "./CreateSpkModal";
// import { SaleCard } from "./components/SaleCard";
// import { SaleDetailModal } from "./components/SaleDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Paperclip, FileText, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { EditableCell } from "./components/EditableCell";
import {
    updateSaleInlineAction,
    updatePoBisInlineAction,
    updateSaleItemInlineAction
} from "@/actions/spk";
import { SaleCard } from "./SaleCard";
import { EditableCell } from "./EditableCell";
import { SaleDetailModal } from "./SaleDetailModal";

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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<SaleSerialized | null>(null);

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

    return (
        <div className="space-y-4">
            <CreateSpkModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                customers={customers}
                products={products}
                taxes={taxes}
            />

            <SaleDetailModal
                sale={selectedSale}
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
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

            <div>
                <Tabs defaultValue="items" className="w-full space-y-4">
                    <TabsList className="w-full max-w-md h-10 bg-slate-100 rounded-lg border border-[#0E5EA2] ml-auto">
                        <TabsTrigger
                            value="items"
                            className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2] data-active:text-white"
                        >
                            <Package className="w-4 h-4" />
                            <span>List SPK</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="attachments"
                            className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2] data-active:text-white"
                        >
                            <Paperclip className="w-4 h-4" />
                            <span>Table</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: CARD VIEW */}
                    <TabsContent value="items" className="space-y-3 m-0">
                        {sales.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-base font-semibold text-foreground">Belum ada data SPK</h3>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sales.map((sale) => (
                                    <SaleCard
                                        key={sale.id}
                                        sale={sale}
                                        formatCurrency={formatCurrency}
                                        onOpenDetail={(selected) => setSelectedSale(selected)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2: SEAMLESS EDITABLE TABLE VIEW */}
                    <TabsContent value="attachments" className="m-0">
                        <div className="space-y-4 [zoom:0.80] origin-top-left">
                            <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-[#0E5EA2] hover:bg-[#0E5EA2]">
                                        <TableRow className="hover:bg-[#0E5EA2]">
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
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap min-w-[140px]">Harga Tanpa PPN</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">PPN</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">Harga PO (Inc. PPN)</TableHead>
                                            <TableHead className="text-center text-white font-semibold w-20">Disc (%)</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">Subtotal (Ex. PPN)</TableHead>
                                            <TableHead className="text-right text-white font-semibold whitespace-nowrap">Total SPK</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sales.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={16} className="text-center py-8 text-muted-foreground">
                                                    Tidak ada data SPK untuk ditampilkan.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sales.map((sale, saleIndex) => {
                                                const items = sale.sale_items || [];
                                                const rowSpan = items.length > 0 ? items.length : 1;
                                                const noPoBis = sale.sale_additionals?.no_po_bis || "";

                                                if (items.length === 0) {
                                                    return (
                                                        <TableRow key={sale.id} className="border-b hover:bg-slate-50 transition-colors">
                                                            <TableCell className="text-center font-medium text-slate-600">{saleIndex + 1}</TableCell>
                                                            <TableCell className="font-semibold text-slate-900 whitespace-nowrap">{sale.customer?.name || "-"}</TableCell>
                                                            <TableCell className="font-medium text-[#0E5EA2] whitespace-nowrap">{sale.no_spk || "-"}</TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    type="date"
                                                                    value={formatDateForInput(sale.spk_date)}
                                                                    onSave={async (val: any) => {
                                                                        await updateSaleInlineAction({ saleId: sale.id, spk_date: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-slate-400 italic" colSpan={3}>Tidak ada item</TableCell>
                                                            <TableCell className="whitespace-nowrap text-slate-700">{sale.no_po || "-"}</TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    value={noPoBis}
                                                                    onSave={async (val: any) => {
                                                                        await updatePoBisInlineAction({ saleId: sale.id, no_po_bis: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    value={sale.sales_person || ""}
                                                                    onSave={async (val: any) => {
                                                                        await updateSaleInlineAction({ saleId: sale.id, sales_person: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <EditableCell
                                                                    value={sale.ecatalog || ""}
                                                                    onSave={async (val: any) => {
                                                                        await updateSaleInlineAction({ saleId: sale.id, ecatalog: String(val) });
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-center text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono text-slate-400">-</TableCell>
                                                            <TableCell className="text-right font-mono font-bold text-[#0E5EA2] whitespace-nowrap">
                                                                {formatCurrency(sale.total_amount)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                return items.map((item, itemIndex) => {
                                                    // 1. unit_price di DB = Harga Tanpa PPN
                                                    const unitPriceWithoutTax = Number(item.unit_price);
                                                    const taxRate = item.tax?.rate ? Number(item.tax.rate) : 0;

                                                    const taxPricePerUnit = unitPriceWithoutTax * (taxRate / 100);

                                                    // 2. Harga PO (With PPN) dihitung secara dinamis
                                                    const hargaPoWithTax = (unitPriceWithoutTax * (1 + taxRate / 100));

                                                    const discount = Number(item.discount) || 0;
                                                    const itemSubtotal = Number(item.subtotal); // Subtotal Tanpa PPN
                                                    const productCode = item.product?.product_type || "-";

                                                    return (
                                                        <TableRow
                                                            key={`${sale.id}-${item.id || itemIndex}`}
                                                            className={`hover:bg-black transition-colors ${itemIndex === items.length - 1 ? "border-b-2 border-slate-200" : "border-b border-slate-100"
                                                                }`}
                                                        >
                                                            {/* Merged Columns */}
                                                            {itemIndex === 0 && (
                                                                <>
                                                                    <TableCell rowSpan={rowSpan} className="text-center font-medium text-slate-600 align-top bg-slate-50/30">
                                                                        {saleIndex + 1}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="font-semibold text-slate-900 whitespace-nowrap align-top bg-slate-50/30">
                                                                        {sale.customer?.name || "-"}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="font-medium text-[#0E5EA2] whitespace-nowrap align-top bg-slate-50/30">
                                                                        {sale.no_spk || "-"}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap align-top bg-slate-50/30">
                                                                        <EditableCell
                                                                            type="date"
                                                                            value={formatDateForInput(sale.spk_date)}
                                                                            onSave={async (val: any) => {
                                                                                await updateSaleInlineAction({ saleId: sale.id, spk_date: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </>
                                                            )}

                                                            {/* Product Details */}
                                                            <TableCell className="max-w-[200px] truncate font-medium text-slate-800" title={item.product?.product_name}>
                                                                {item.product?.product_name || "-"}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs text-slate-600 whitespace-nowrap">
                                                                {productCode}
                                                            </TableCell>

                                                            {/* Editable QTY */}
                                                            <TableCell className="text-center">
                                                                <EditableCell
                                                                    type="number"
                                                                    className="text-center font-semibold"
                                                                    value={item.quantity}
                                                                    onSave={async (val: any) => {
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
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap text-slate-700 align-top bg-slate-50/30">
                                                                        {sale.no_po || "-"}
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap align-top bg-slate-50/30">
                                                                        <EditableCell
                                                                            value={noPoBis}
                                                                            onSave={async (val: any) => {
                                                                                await updatePoBisInlineAction({ saleId: sale.id, no_po_bis: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap align-top bg-slate-50/30">
                                                                        <EditableCell
                                                                            value={sale.sales_person || ""}
                                                                            onSave={async (val: any) => {
                                                                                await updateSaleInlineAction({ saleId: sale.id, sales_person: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap align-top bg-slate-50/30">
                                                                        <EditableCell
                                                                            value={sale.ecatalog || ""}
                                                                            onSave={async (val: any) => {
                                                                                await updateSaleInlineAction({ saleId: sale.id, ecatalog: String(val) });
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </>
                                                            )}

                                                            {/* Editable Harga Tanpa PPN (Membaca & Memperbarui unit_price DB) */}
                                                            <TableCell className="text-right font-mono whitespace-nowrap">
                                                                <EditableCell
                                                                    type="number"
                                                                    className="text-right font-medium text-slate-900"
                                                                    value={unitPriceWithoutTax}
                                                                    onSave={async (val: any) => {
                                                                        await updateSaleItemInlineAction({
                                                                            saleItemId: item.id,
                                                                            saleId: sale.id,
                                                                            unitPriceWithoutTax: Number(val),
                                                                        });
                                                                    }}
                                                                />
                                                            </TableCell>

                                                            {/* Calculated PPN */}
                                                            <TableCell className="text-right font-mono whitespace-nowrap text-slate-600 bg-slate-50/50">
                                                                {formatCurrency(taxPricePerUnit)}
                                                            </TableCell>

                                                            {/* Calculated Harga PO (Include PPN) */}
                                                            <TableCell className="text-right font-mono whitespace-nowrap text-slate-600 bg-slate-50/50">
                                                                {formatCurrency(hargaPoWithTax)}
                                                            </TableCell>





                                                            {/* Editable Discount */}
                                                            <TableCell className="text-center font-medium">
                                                                <EditableCell
                                                                    type="number"
                                                                    className="text-center"
                                                                    value={discount}
                                                                    onSave={async (val: any) => {
                                                                        await updateSaleItemInlineAction({
                                                                            saleItemId: item.id,
                                                                            saleId: sale.id,
                                                                            discount: Number(val),
                                                                        });
                                                                    }}
                                                                />
                                                            </TableCell>

                                                            {/* Subtotal (Tanpa PPN) */}
                                                            <TableCell className="text-right font-mono text-slate-900 font-semibold whitespace-nowrap">
                                                                {formatCurrency(itemSubtotal)}
                                                            </TableCell>

                                                            {/* Merged Total SPK */}
                                                            {itemIndex === 0 && (
                                                                <TableCell rowSpan={rowSpan} className="text-right font-mono font-bold text-[#0E5EA2] whitespace-nowrap align-top bg-slate-50/30">
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
