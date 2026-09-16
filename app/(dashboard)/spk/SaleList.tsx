// components/SPK/SaleList.tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CustomerOption, ProductOption, SaleSerialized, TaxOption } from "@/components/SPK/types";
import { CreateSpkModal } from "./CreateSpkModal";
import { SaleCard } from "./components/SaleCard";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Plus
} from "lucide-react";

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

    return (
        <div className="max-w-7xl space-y-4">
            {/* Modal Tambah SPK Baru */}
            <CreateSpkModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                customers={customers}
                products={products}
                taxes={taxes}
            />

            {/* Modal Detail SPK (Sales Items + Attachments) */}
            <SaleDetailModal
                sale={selectedSale}
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                formatCurrency={formatCurrency}
            />

            {/* Header Halaman */}
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
                            className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2] data-active:text-white data-active:shadow-sm data-active:hover:text-white hover:text-[#0E5EA2] transition-colors duration-200"
                        >
                            <Package className="w-4 h-4" />
                            <span>List SPK</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="attachments"
                            className="flex items-center justify-center gap-2 text-black text-xs sm:text-sm font-medium rounded-md data-active:bg-[#0E5EA2] data-active:text-white data-active:shadow-sm data-active:hover:text-white hover:text-[#0E5EA2] transition-colors duration-200"
                        >
                            <Paperclip className="w-4 h-4" />
                            <span>Table</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: SALE listss */}
                    <TabsContent value="items" className="space-y-3 m-0">
                        {/* List Item SPK */}
                        {sales.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-base font-semibold text-foreground">
                                    Belum ada data SPK
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Klik tombol di atas untuk membuat SPK pertama Anda.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sales.map((sale) => (
                                    <SaleCard
                                        key={sale.id}
                                        sale={sale}
                                        formatCurrency={formatCurrency}
                                        onOpenDetail={(selected) => setSelectedSale(selected)}
                                    // onClick={() => setSelectedSale(sale)}  
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2: SALE ATTACHMENTS */}
                    <TabsContent value="attachments" className="m-0">
                        {/* <>  kososngs</> */}
                    </TabsContent>
                </Tabs>
            </div>




        </div>
    );
}