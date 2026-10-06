"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Building2, Loader2, Pencil, Power } from "lucide-react";

import SupplierModal from "@/components/suppliers/SupplierModal";
// import { SupplierSerialized } from "@/components/suppliers/types";
import { FilterCategoryOption, TableFilter, TableFilterBar } from "@/components/TableFilterBar";

import {
    deactivateSupplierAction,
    getSuppliers,
} from "@/actions/suppliers";
import { SupplierSerialized } from "@/components/suppliers/types";

const FILTER_OPTIONS: FilterCategoryOption[] = [
    { value: "name", label: "Nama Supplier" },
    { value: "contact", label: "Contact" },
    { value: "address", label: "Alamat" },
];

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<SupplierSerialized[]>([]);
    const [filters, setFilters] = useState<TableFilter[]>([
        { id: 1, category: "name", value: "" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<SupplierSerialized | null>(null);
    const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSuppliers = useCallback(async () => {
        const data = await getSuppliers();
        setSuppliers(data);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                await loadSuppliers();
            } catch (error) {
                console.error(error);
                setError("Gagal mengambil data supplier.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [loadSuppliers]);

    const handleAddFilter = () => {
        setFilters((prev) => [
            ...prev,
            {
                id: Math.max(0, ...prev.map((filter) => filter.id)) + 1,
                category: "name",
                value: "",
            },
        ]);
    };

    const handleRemoveFilter = (id: number) => {
        setFilters((prev) => prev.filter((filter) => filter.id !== id));
    };

    const handleCategoryChange = (id: number, category: string) => {
        setFilters((prev) =>
            prev.map((filter) =>
                filter.id === id ? { ...filter, category, value: "" } : filter
            )
        );
    };

    const handleValueChange = (id: number, value: string) => {
        setFilters((prev) =>
            prev.map((filter) =>
                filter.id === id ? { ...filter, value } : filter
            )
        );
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((supplier) =>
            filters.every((filter) => {
                const keyword = filter.value.trim().toLowerCase();
                if (!keyword) return true;

                switch (filter.category) {
                    case "name":
                        return supplier.name.toLowerCase().includes(keyword);
                    case "contact":
                        return supplier.contact?.toLowerCase().includes(keyword) ?? false;
                    case "address":
                        return supplier.address?.toLowerCase().includes(keyword) ?? false;
                    default:
                        return true;
                }
            })
        );
    }, [suppliers, filters]);

    const handleOpenCreate = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleEdit = (supplier: SupplierSerialized) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDeactivate = async (supplier: SupplierSerialized) => {
        const confirmed = window.confirm(`Nonaktifkan supplier "${supplier.name}"?`);
        if (!confirmed) return;

        try {
            setDeactivatingId(supplier.id);
            setError(null);

            const result = await deactivateSupplierAction(supplier.id);

            if (!result.success) {
                setError(result.message);
                return;
            }

            await loadSuppliers();
        } catch (error) {
            console.error(error);
            setError("Gagal menonaktifkan supplier.");
        } finally {
            setDeactivatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Building2 size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Suppliers</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola supplier untuk proses purchasing.
                        </p>
                    </div>
                </div>

                {/* FILTER */}
                <div className="mb-4">
                    <TableFilterBar
                        categoryOptions={FILTER_OPTIONS}
                        filters={filters}
                        onAddFilter={handleAddFilter}
                        onRemoveFilter={handleRemoveFilter}
                        onCategoryChange={handleCategoryChange}
                        onValueChange={handleValueChange}
                        searchPlaceholder="Masukkan nilai filter..."
                        onOpenCreateModal={handleOpenCreate}
                        createLabel="Tambah Supplier"
                    />
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-3">
                            <Loader2 size={28} className="animate-spin text-slate-400" />
                            <span className="text-sm text-slate-500">Memuat supplier...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <th className="px-5 py-3">Supplier</th>
                                        <th className="px-5 py-3">Contact</th>
                                        <th className="px-5 py-3">Alamat</th>
                                        <th className="px-5 py-3 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                {supplier.name}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {supplier.contact ?? "-"}
                                            </td>

                                            <td className="max-w-md px-5 py-4 text-sm text-slate-600">
                                                {supplier.address ?? "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(supplier)}
                                                        title="Edit Supplier"
                                                        className="rounded-md p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivate(supplier)}
                                                        disabled={deactivatingId === supplier.id}
                                                        title="Deactivate Supplier"
                                                        className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                    >
                                                        {deactivatingId === supplier.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Power size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredSuppliers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-16 text-center">
                                                <Building2 size={32} className="mx-auto mb-3 text-slate-300" />
                                                <p className="text-sm font-medium text-slate-600">
                                                    Supplier tidak ditemukan
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <SupplierModal
                open={isModalOpen}
                supplier={editingSupplier}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSupplier(null);
                }}
                onSaved={loadSuppliers}
            />
        </div>
    );
}