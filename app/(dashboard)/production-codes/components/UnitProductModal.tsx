"use client";

import { useState, useMemo } from "react";
import { ProductWithCodes, Customer } from "@/components/production-codes/types";

// Shadcn UI Imports
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";

interface Props {
    products: ProductWithCodes[];
    customers: Customer[];
    onAddDraft: (productId: number, productCodeId: number, customerId: number) => void;
    onClose: () => void;
}

export function UnitProductModal({ products, customers, onAddDraft, onClose }: Props) {
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedCodeId, setSelectedCodeId] = useState<number | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    // Memo untuk mengambil data objek berdasarkan ID terpilih
    const selectedProduct = useMemo(
        () => products.find((p) => Number(p.id) === selectedProductId) ?? null,
        [products, selectedProductId]
    );

    const selectedCode = useMemo(
        () => selectedProduct?.product_codes?.find((c) => Number(c.id) === selectedCodeId) ?? null,
        [selectedProduct, selectedCodeId]
    );

    const selectedCustomer = useMemo(
        () => customers.find((c) => Number(c.id) === selectedCustomerId) ?? null,
        [customers, selectedCustomerId]
    );

    const handleSubmit = () => {
        if (!selectedProductId || !selectedCodeId || !selectedCustomerId) {
            alert("Harap pilih Nama Barang, Kode Barang, dan Customer terlebih dahulu!");
            return;
        }
        onAddDraft(selectedProductId, selectedCodeId, selectedCustomerId);
    };

    return (
        <Card className="rounded-xl border shadow-lg space-y-0">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-semibold">ADD</CardTitle>
                <CardDescription className="text-xs">
                    Pilih Nama Barang, Kode Barang dan Customer untuk membuat draft
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 grid gap-4 md:grid-cols-3">
                {/* Combobox Nama Barang */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Nama Barang</Label>
                    <Combobox
                        items={products}
                        value={selectedProductId ? String(selectedProductId) : ""}
                        onValueChange={(id) => {
                            if (id) {
                                setSelectedProductId(Number(id));
                                setSelectedCodeId(null);
                            }
                        }}
                    >
                        <ComboboxInput
                            placeholder="Cari barang..."
                            value={selectedProduct ? `${selectedProduct.product_name} (${selectedProduct.product_type})` : ""}
                            className="w-full bg-white"
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>Barang tidak ditemukan.</ComboboxEmpty>
                            <ComboboxList>
                                {(product: ProductWithCodes) => (
                                    <ComboboxItem key={product.id} value={String(product.id)}>
                                        {product.product_name} ({product.product_type})
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>

                {/* Combobox Kode Barang */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Kode Barang</Label>
                    <Combobox
                        items={selectedProduct?.product_codes ?? []}
                        value={selectedCodeId ? String(selectedCodeId) : ""}
                        onValueChange={(id) => {
                            if (id) setSelectedCodeId(Number(id));
                        }}
                    >
                        <ComboboxInput
                            placeholder={
                                selectedProduct ? "Cari kode barang..." : "Pilih Barang Terlebih Dahulu"
                            }
                            value={selectedCode ? selectedCode.product_code : ""}
                            disabled={!selectedProduct}
                            className="w-full bg-white"
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>Kode barang tidak ditemukan.</ComboboxEmpty>
                            <ComboboxList>
                                {(code) => (
                                    <ComboboxItem key={code.id} value={String(code.id)}>
                                        {code.product_code}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>

                {/* Combobox Customer */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Customer</Label>
                    <Combobox
                        items={customers}
                        value={selectedCustomerId ? String(selectedCustomerId) : ""}
                        onValueChange={(id) => {
                            if (id) setSelectedCustomerId(Number(id));
                        }}
                    >
                        <ComboboxInput
                            placeholder="Cari customer..."
                            value={selectedCustomer ? selectedCustomer.name : ""}
                            className="w-full bg-white"
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>Customer tidak ditemukan.</ComboboxEmpty>
                            <ComboboxList>
                                {(customer: Customer) => (
                                    <ComboboxItem key={customer.id} value={String(customer.id)}>
                                        {customer.name}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-[#0E5EA2] hover:bg-[#0B4A82] text-white"
                >
                    Masukkan ke Tabel
                </Button>
            </CardFooter>
        </Card>
    );
}