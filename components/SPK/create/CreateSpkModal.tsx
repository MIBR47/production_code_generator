"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, ShoppingBag } from "lucide-react";
import { CustomerOption, ItemRow, ProductOption, TaxOption } from "@/components/SPK/types";

// Import UI Components Shadcn/ui
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";

import { createSaleAction } from "@/actions/spk";
import { CreateSpkItemRow } from "./CreateSpkItemRow";

interface CreateSpkModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers?: CustomerOption[];
    products?: ProductOption[];
    taxes?: TaxOption[];
}

export function CreateSpkModal({
    isOpen,
    onClose,
    customers = [],
    products = [],
    taxes = [],
}: CreateSpkModalProps) {
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const todayStr = new Date().toISOString().split("T")[0];

    // State Form
    const [spkType, setSpkType] = useState<string | null>("E-Catalog");
    const [spkDate, setSpkDate] = useState<string>(todayStr);
    const [expectedDate, setExpectedDate] = useState<string>("");
    const [customerId, setCustomerId] = useState<string>("");
    const [customerSearchQuery, setCustomerSearchQuery] = useState<string>("");

    // State baru untuk field yang belum terhubung
    const [salesPerson, setSalesPerson] = useState<string>("");
    const [ecatalog, setEcatalog] = useState<string>("");
    const [shippingCost, setShippingCost] = useState<string>("");

    const [items, setItems] = useState<ItemRow[]>([
        { product_id: "", tax_id: "", quantity: 1, unit_price: 0 },
    ]);

    const selectedCustomer = customers.find((c) => String(c.id) === String(customerId));
    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
    );

    const handleAddItem = () => {
        const defaultTaxId = taxes.length > 0 ? taxes[0].id : "";
        setItems((prev) => [
            ...prev,
            { product_id: "", tax_id: defaultTaxId, quantity: 1, unit_price: 0 },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
        const updated = [...items];
        const item = { ...updated[index], [field]: value };

        if (field === "product_id") {
            const selectedProd = products.find((p) => String(p.id) === String(value));
            if (selectedProd && selectedProd.price !== undefined && selectedProd.price !== null) {
                item.unit_price = Number(selectedProd.price);
            } else {
                item.unit_price = 0;
            }
        }

        updated[index] = item;
        setItems(updated);
    };

    const getNormalizedTaxRate = (taxId: number | ""): number => {
        const selectedTax = taxes.find((t) => String(t.id) === String(taxId));
        if (!selectedTax) return 0;

        const rateNum = Number(selectedTax.rate);
        return rateNum > 1 ? rateNum / 100 : rateNum;
    };

    const subtotalBeforeTax = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        return sum + qty * price;
    }, 0);

    const totalTax = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        const itemBase = qty * price;
        const taxRate = getNormalizedTaxRate(item.tax_id);
        return sum + itemBase * taxRate;
    }, 0);

    const grandTotal = subtotalBeforeTax + totalTax + (Number(shippingCost) || 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setErrors({});

        const newErrors: Record<string, boolean> = {};

        // Validasi Tipe SPK
        if (!spkType) {
            newErrors.spk_type = true;
        }

        // Validasi Tanggal SPK
        if (!spkDate) {
            newErrors.spk_date = true;
        }

        // Validasi Customer
        if (!customerId) {
            newErrors.customer_id = true;
        }

        // Validasi Estimasi Selesai
        if (!expectedDate) {
            newErrors.expected_date = true;
        }

        // Validasi Sales Person (Required)
        if (!salesPerson.trim()) {
            newErrors.sales_person = true;
        }

        // Validasi Nomor E-Catalog (Khusus jika tipe SPK = "E-Catalog")
        if (spkType === "E-Catalog" && !ecatalog.trim()) {
            newErrors.ecatalog = true;
        }

        // Validasi Biaya Pengiriman (Jika diisi, pastikan angka valid dan tidak negatif)
        if (shippingCost !== "" && (isNaN(Number(shippingCost)) || Number(shippingCost) < 0)) {
            newErrors.shipping_cost = true;
        }

        // Validasi Items
        const hasInvalidItem = items.some((item) => !item.product_id || item.quantity <= 0);
        if (hasInvalidItem) {
            newErrors.items = true;
        }

        // Jika ada error, hentikan submit dan tampilkan pesan
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            if (newErrors.spk_type) setErrorMessage("Harap pilih Tipe SPK.");
            else if (newErrors.customer_id) setErrorMessage("Harap pilih Customer.");
            else if (newErrors.spk_date) setErrorMessage("Harap isi Tanggal SPK.");
            else if (newErrors.expected_date) setErrorMessage("Harap isi Estimasi Selesai.");
            else if (newErrors.sales_person) setErrorMessage("Harap isi Nama Sales Person.");
            else if (newErrors.ecatalog) setErrorMessage("Harap isi Nomor E-Catalog untuk tipe SPK E-Catalog.");
            else if (newErrors.shipping_cost) setErrorMessage("Biaya pengiriman harus berupa angka yang valid.");
            else if (newErrors.items) setErrorMessage("Harap lengkapi semua Produk dan Jumlah Barang dengan benar.");

            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.append("spk_type", spkType ?? "");
        formData.append("spk_date", spkDate);
        formData.append("expected_date", expectedDate);
        formData.append("customer_id", customerId);
        formData.append("sales_person", salesPerson);
        formData.append("ecatalog", ecatalog);
        formData.append("shipping_cost", shippingCost || "0");
        formData.append("items", JSON.stringify(items));

        startTransition(async () => {
            const result = await createSaleAction(null, formData);
            if (result?.success) {
                onClose();
            } else {
                setErrorMessage(result?.message || "Terjadi kesalahan saat menyimpan.");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full sm:max-w-[850px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white text-slate-800">
                <DialogHeader className="p-6 pb-4 border-b border-slate-200">
                    <DialogTitle className="text-lg font-bold text-slate-900">Buat SPK Baru</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        {errorMessage && (
                            <Alert variant="destructive">
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 1. Tipe SPK */}
                            <div className="space-y-2">
                                <Label htmlFor="spk_type" className="text-sm font-semibold text-slate-700">
                                    Tipe SPK <span className="text-red-500">*</span>
                                </Label>
                                <Select value={spkType ?? ""} onValueChange={setSpkType}>
                                    <SelectTrigger
                                        id="spk_type"
                                        className={`h-10 w-full bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.spk_type ? "border-red-500" : ""}`}
                                    >
                                        <SelectValue placeholder="Pilih Tipe SPK" />
                                    </SelectTrigger>
                                    <SelectContent className="z-50 bg-white border-slate-200 shadow-md">
                                        <SelectItem value="E-Catalog" className="cursor-pointer py-2 text-slate-800">
                                            <span className="font-medium">E-Catalog</span>
                                            <span className="text-xs text-slate-400 ml-2">(E-SPK/...)</span>
                                        </SelectItem>
                                        <SelectItem value="Reguler" className="cursor-pointer py-2 text-slate-800">
                                            <span className="font-medium">Reguler</span>
                                            <span className="text-xs text-slate-400 ml-2">(R-SPK/...)</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 2. Customer */}
                            <div className="space-y-2">
                                <Label htmlFor="customer_id" className="text-sm font-semibold text-slate-700">
                                    Pelanggan / Customer <span className="text-red-500">*</span>
                                </Label>
                                <Combobox
                                    value={customerId}
                                    onValueChange={(val: string | null) => {
                                        setCustomerId(val ?? "");
                                        setCustomerSearchQuery("");
                                    }}
                                >
                                    <ComboboxInput
                                        placeholder="Pilih atau cari customer..."
                                        showClear
                                        value={customerSearchQuery || selectedCustomer?.name || ""}
                                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                        className={`w-full h-10 bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 ${errors.customer_id ? "border-red-500" : ""}`}
                                    />
                                    <ComboboxContent className="max-h-60 overflow-y-auto z-50 bg-white border border-slate-200 shadow-lg rounded-md">
                                        <ComboboxList>
                                            {filteredCustomers.length === 0 ? (
                                                <ComboboxEmpty className="p-2 text-xs text-slate-500 text-center">
                                                    Customer tidak ditemukan.
                                                </ComboboxEmpty>
                                            ) : (
                                                filteredCustomers.map((c) => (
                                                    <ComboboxItem
                                                        key={c.id}
                                                        value={String(c.id)}
                                                        className="px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 cursor-pointer"
                                                    >
                                                        {c.name}
                                                    </ComboboxItem>
                                                ))
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>

                            {/* 3. Tanggal SPK */}
                            <div className="space-y-2">
                                <Label htmlFor="spk_date" className="text-sm font-semibold text-slate-700">
                                    Tanggal SPK <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="spk_date"
                                    name="spk_date"
                                    type="date"
                                    value={spkDate}
                                    onChange={(e) => setSpkDate(e.target.value)}
                                    className={`h-10 bg-white border-slate-300 text-slate-800 ${errors.spk_date ? "border-red-500" : ""}`}
                                />
                            </div>

                            {/* 4. Expected Date / Estimasi Selesai */}
                            <div className="space-y-2">
                                <Label htmlFor="expected_date" className="text-sm font-semibold text-slate-700">
                                    Estimasi Selesai (Expected Date) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="expected_date"
                                    name="expected_date"
                                    type="date"
                                    value={expectedDate}
                                    onChange={(e) => setExpectedDate(e.target.value)}
                                    className={`h-10 bg-white border-slate-300 text-slate-800 ${errors.expected_date ? "border-red-500" : ""}`}
                                />
                            </div>

                            {/* 5. Sales Person */}
                            <div className="space-y-2">
                                <Label htmlFor="sales_person" className="text-sm font-semibold text-slate-700">
                                    Sales Person <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="sales_person"
                                    name="sales_person"
                                    value={salesPerson}
                                    onChange={(e) => setSalesPerson(e.target.value)}
                                    placeholder="Nama Sales"
                                    className={`h-10 bg-white border-slate-300 text-slate-800 ${errors.sales_person ? "border-red-500" : ""}`}
                                />
                            </div>

                            {/* 6. Nomor E-Catalog */}
                            <div className="space-y-2">
                                <Label htmlFor="ecatalog" className="text-sm font-semibold text-slate-700">
                                    Nomor E-Catalog {spkType === "E-Catalog" && <span className="text-red-500">*</span>}
                                </Label>
                                <Input
                                    id="ecatalog"
                                    name="ecatalog"
                                    value={ecatalog}
                                    onChange={(e) => setEcatalog(e.target.value)}
                                    placeholder="Contoh: ECAT-102938"
                                    className={`h-10 bg-white border-slate-300 text-slate-800 ${errors.ecatalog ? "border-red-500" : ""}`}
                                />
                            </div>

                            {/* 7. Biaya Pengiriman */}
                            <div className="space-y-2">
                                <Label htmlFor="shipping_cost" className="text-sm font-semibold text-slate-700">
                                    Biaya Pengiriman
                                </Label>
                                <Input
                                    id="shipping_cost"
                                    name="shipping_cost"
                                    type="number"
                                    min="0"
                                    value={shippingCost}
                                    onChange={(e) => setShippingCost(e.target.value)}
                                    placeholder="Contoh: 100000"
                                    className={`h-10 bg-white border-slate-300 text-slate-800 ${errors.shipping_cost ? "border-red-500" : ""}`}
                                />
                            </div>
                        </div>

                        {/* Section Item Barang */}
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <ShoppingBag className="w-4 h-4 text-blue-600" /> Item Barang / Produk
                                </h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddItem}
                                    className="gap-1 text-xs border-slate-300 hover:bg-slate-100"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Item
                                </Button>
                            </div>

                            <div className="border border-slate-200 rounded-md overflow-x-auto bg-white">
                                <Table className="table-fixed w-full">
                                    <TableHeader>
                                        <TableRow className="bg-[#0E5EA2] hover:bg-[#0E5EA2]">
                                            <TableHead className="w-[42%] text-white font-semibold">Produk *</TableHead>
                                            <TableHead className="w-[18%] text-white font-semibold">Pajak</TableHead>
                                            <TableHead className="w-[10%] text-white font-semibold text-center">Qty</TableHead>
                                            <TableHead className="w-[18%] text-white font-semibold text-right">
                                                Harga Satuan (Rp)
                                            </TableHead>
                                            <TableHead className="w-[12%] text-white font-semibold text-right">
                                                Subtotal
                                            </TableHead>
                                            <TableHead className="w-[40px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <CreateSpkItemRow
                                                key={index}
                                                index={index}
                                                item={item}
                                                products={products}
                                                taxes={taxes}
                                                canRemove={items.length > 1}
                                                onItemChange={handleItemChange}
                                                onRemoveItem={handleRemoveItem}
                                                errors={errors.items}
                                                getNormalizedTaxRate={getNormalizedTaxRate}
                                                formatCurrency={formatCurrency}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Detail Rincian Biaya */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Harga Sebelum Pajak (Subtotal):</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(subtotalBeforeTax)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Pajak:</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(totalTax)}</span>
                                </div>
                                {Number(shippingCost) > 0 && (
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Biaya Pengiriman:</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(Number(shippingCost))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                                    <span>Total Keseluruhan :</span>
                                    <span className="text-base text-[#0E5EA2]">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Catatan / Remarks */}
                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-sm font-semibold text-slate-700">
                                Catatan / Remarks
                            </Label>
                            <Textarea
                                id="remarks"
                                name="remarks"
                                rows={2}
                                placeholder="Catatan khusus SPK..."
                                className="resize-none bg-white border-slate-300 text-slate-800"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-4 pb-8 pr-8 bg-slate-50 border-t border-slate-200 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending} className="bg-[#195F9C] hover:bg-[#033D70] text-white">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? "Menyimpan..." : "Simpan SPK & Item"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}