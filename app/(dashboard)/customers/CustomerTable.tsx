"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Plus, X, Pencil, Trash2, Check } from "lucide-react";
import { createCustomer, updateCustomer, deleteCustomer } from "./actions";
import { useRouter } from "next/navigation";

interface Customer {
    id: number;
    name: string;
}

interface Props {
    data: Customer[];
}

export default function CustomerTable({ data }: Props) {
    const [search, setSearch] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    // State untuk In-Line Edit
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Action State untuk Form Tambah Customer
    const [stateCreate, formActionCreate] = useActionState(createCustomer, {
        success: false,
        message: "",
    });

    useEffect(() => {
        if (stateCreate.success) {
            alert(stateCreate.message);
            setShowCreateForm(false);
            router.refresh();
        } else if (stateCreate.message) {
            alert(stateCreate.message);
        }
    }, [stateCreate, router]);

    // Filter Data berdasarkan Pencarian
    const filteredData = useMemo(() => {
        return data.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    // Mulai mode Edit
    const handleStartEdit = (item: Customer) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    // Handler Submit Update
    const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const res = await updateCustomer(formData);
            if (res.success) {
                setEditingId(null);
                router.refresh();
            } else {
                alert(res.message);
            }
        });
    };

    // Handler Hapus
    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus customer ini?")) {
            startTransition(async () => {
                const res = await deleteCustomer(id);
                if (res.success) {
                    router.refresh();
                } else {
                    alert(res.message);
                }
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* SEARCH BAR & BUTTON TAMBAH */}
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Cari nama customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-80 rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-[#0E5EA2] focus:outline-none focus:ring-2 focus:ring-[#0E5EA2]/20"
                />

                <button
                    onClick={() => setShowCreateForm((prev) => !prev)}
                    className="flex items-center gap-2 rounded-lg bg-[#0E5EA2] px-4 py-2 text-white hover:bg-[#0B4D86] transition"
                >
                    {showCreateForm ? <X size={18} /> : <Plus size={18} />}
                    {showCreateForm ? "Tutup" : "Tambah Customer"}
                </button>
            </div>

            {/* FORM TAMBAH CUSTOMER */}
            {showCreateForm && (
                <form action={formActionCreate} className="mt-6">
                    <div className="rounded-xl border bg-slate-100 p-6 text-black shadow-sm">
                        <div className="max-w-md">
                            <label className="mb-2 block text-sm font-medium">
                                Nama Customer
                            </label>
                            <input
                                name="name"
                                required
                                placeholder="Masukkan nama customer"
                                className="w-full rounded-lg border px-3 py-2 bg-white text-black focus:border-[#0E5EA2] focus:outline-none"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="rounded-lg border px-4 py-2 hover:bg-gray-200 transition text-black"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-[#0E5EA2] px-4 py-2 text-white hover:bg-[#0B4D86] transition"
                            >
                                Tambah
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* TABEL DATA CUSTOMER */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden text-black">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm whitespace-nowrap">
                        <thead className="bg-[#0E5EA2] text-white">
                            <tr>
                                <th className="px-4 py-3 text-center w-16">No</th>
                                <th className="px-4 py-3 text-left">Nama Customer</th>
                                <th className="px-4 py-3 text-center w-32">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => {
                                    const isEditing = editingId === item.id;

                                    if (isEditing) {
                                        return (
                                            <tr key={item.id} className="bg-blue-50/80 border-b">
                                                <td className="px-4 py-3 text-center">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        form={`form-edit-${item.id}`}
                                                        name="name"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-3 py-1 border rounded bg-white text-black focus:outline-none focus:ring-1 focus:ring-[#0E5EA2]"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <form id={`form-edit-${item.id}`} onSubmit={handleUpdateSubmit}>
                                                        <input type="hidden" name="id" value={item.id} />
                                                    </form>
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            type="submit"
                                                            form={`form-edit-${item.id}`}
                                                            disabled={isPending}
                                                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-300 transition"
                                                            title="Simpan"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingId(null)}
                                                            disabled={isPending}
                                                            className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                                                            title="Batal"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={item.id} className="border-b hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 text-center">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button
                                                        onClick={() => handleStartEdit(item)}
                                                        disabled={isPending}
                                                        className="text-blue-600 hover:text-blue-800 transition disabled:opacity-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={isPending}
                                                        className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}