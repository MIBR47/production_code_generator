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

    // State untuk teks pencarian
    const [productQuery, setProductQuery] = useState("");
    const [codeQuery, setCodeQuery] = useState("");
    const [customerQuery, setCustomerQuery] = useState("");

    // Object terpilih berdasarkan ID
    const selectedProduct = useMemo(
        () => products.find((p) => Number(p.id) === selectedProductId) ?? null,
        [products, selectedProductId]
    );

    const availableCodes = useMemo(
        () => selectedProduct?.product_codes ?? [],
        [selectedProduct]
    );

    // Dynamic Filter
    const filteredProducts = useMemo(() => {
        if (!productQuery) return products;
        return products.filter((p) =>
            `${p.product_name} ${p.product_type}`.toLowerCase().includes(productQuery.toLowerCase())
        );
    }, [products, productQuery]);

    const filteredCodes = useMemo(() => {
        if (!codeQuery) return availableCodes;
        return availableCodes.filter((c) =>
            c.product_code.toLowerCase().includes(codeQuery.toLowerCase())
        );
    }, [availableCodes, codeQuery]);

    const filteredCustomers = useMemo(() => {
        if (!customerQuery) return customers;
        return customers.filter((c) =>
            c.name.toLowerCase().includes(customerQuery.toLowerCase())
        );
    }, [customers, customerQuery]);

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
                        value={selectedProduct ? `${selectedProduct.product_name} (${selectedProduct.product_type})` : ""}
                        onValueChange={(val) => {
                            const found = products.find(
                                (p) => `${p.product_name} (${p.product_type})` === val
                            );
                            if (found) {
                                setSelectedProductId(Number(found.id));
                                setSelectedCodeId(null);
                                setCodeQuery("");
                            }
                        }}
                        onOpenChange={(isOpen) => {
                            // Kosongkan kata kunci cari jika dropdown ditutup (klik di luar)
                            if (!isOpen) setProductQuery("");
                        }}
                    >
                        <ComboboxInput
                            placeholder="Cari barang..."
                            onChange={(e) => setProductQuery(e.target.value)}
                            className="w-full bg-white"
                        />
                        <ComboboxContent>
                            {filteredProducts.length === 0 && (
                                <ComboboxEmpty>Barang tidak ditemukan.</ComboboxEmpty>
                            )}
                            <ComboboxList>
                                {filteredProducts.map((product) => {
                                    const label = `${product.product_name} (${product.product_type})`;
                                    return (
                                        <ComboboxItem key={product.id} value={label}>
                                            {label}
                                        </ComboboxItem>
                                    );
                                })}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>

                {/* Combobox Kode Barang */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Kode Barang</Label>
                    <Combobox
                        value={availableCodes.find((c) => Number(c.id) === selectedCodeId)?.product_code ?? ""}
                        onValueChange={(val) => {
                            const found = availableCodes.find((c) => c.product_code === val);
                            if (found) setSelectedCodeId(Number(found.id));
                        }}
                        onOpenChange={(isOpen) => {
                            // Kosongkan kata kunci cari jika dropdown ditutup (klik di luar)
                            if (!isOpen) setCodeQuery("");
                        }}
                    >
                        <ComboboxInput
                            placeholder={
                                selectedProduct ? "Cari kode barang..." : "Pilih Barang Terlebih Dahulu"
                            }
                            onChange={(e) => setCodeQuery(e.target.value)}
                            disabled={!selectedProduct}
                            className="w-full bg-white"
                        />
                        <ComboboxContent>
                            {filteredCodes.length === 0 && (
                                <ComboboxEmpty>Kode barang tidak ditemukan.</ComboboxEmpty>
                            )}
                            <ComboboxList>
                                {filteredCodes.map((code) => (
                                    <ComboboxItem key={code.id} value={code.product_code}>
                                        {code.product_code}
                                    </ComboboxItem>
                                ))}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>

                {/* Combobox Customer */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Customer</Label>
                    <Combobox
                        value={customers.find((c) => Number(c.id) === selectedCustomerId)?.name ?? ""}
                        onValueChange={(val) => {
                            const found = customers.find((c) => c.name === val);
                            if (found) setSelectedCustomerId(Number(found.id));
                        }}
                        onOpenChange={(isOpen) => {
                            // Kosongkan kata kunci cari jika dropdown ditutup (klik di luar)
                            if (!isOpen) setCustomerQuery("");
                        }}
                    >
                        <ComboboxInput
                            placeholder="Cari customer..."
                            onChange={(e) => setCustomerQuery(e.target.value)}
                            className="w-full bg-white"
                        />
                        <ComboboxContent>
                            {filteredCustomers.length === 0 && (
                                <ComboboxEmpty>Customer tidak ditemukan.</ComboboxEmpty>
                            )}
                            <ComboboxList>
                                {filteredCustomers.map((customer) => (
                                    <ComboboxItem key={customer.id} value={customer.name}>
                                        {customer.name}
                                    </ComboboxItem>
                                ))}
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