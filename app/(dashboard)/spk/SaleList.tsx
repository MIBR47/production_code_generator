// components/SPK/SaleList.tsx
"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomerOption, ProductOption, SaleSerialized, TaxOption } from "@/components/SPK/types";
import { CreateSpkModal } from "./CreateSpkModal";
import { SaleCard } from "./components/SaleCard";
import { SaleDetailModal } from "./components/SaleDetailModal";

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
        </div>
    );
}