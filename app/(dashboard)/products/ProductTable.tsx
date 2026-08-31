"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Plus, X, Pencil, Trash2, Check } from "lucide-react";
import { createProduct, createProductCode, updateProduct, deleteProductItem } from "./actions";
import { useRouter } from "next/navigation";

interface Props {
    data: any[];
}

export default function ProductTable({ data }: Props) {
    const [search, setSearch] = useState("");
    const [showCreateProduct, setShowCreateProduct] = useState(false);
    const [showCreateCodeProduct, setShowCreateCodeProduct] = useState(false);

    // State untuk In-Line Edit
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{
        product_name: string;
        product_type: string;
        product_code: string;
    }>({ product_name: "", product_type: "", product_code: "" });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [stateproduct, formActionProduct] = useActionState(createProduct, {
        success: false,
        message: "",
    });

    const [statecode, formActionCode] = useActionState(createProductCode, {
        success: false,
        message: "",
    });

    useEffect(() => {
        if (stateproduct.success) {
            alert(stateproduct.message);
            setShowCreateProduct(false);
            router.refresh();
        } else if (stateproduct.message) {
            alert(stateproduct.message);
        }
    }, [stateproduct, router]);

    useEffect(() => {
        if (statecode.success) {
            alert(statecode.message);
            setShowCreateCodeProduct(false);
            router.refresh();
        } else if (statecode.message) {
            alert(statecode.message);
        }
    }, [statecode, router]);

    // Flatten Data untuk Tabel
    const filteredData = useMemo(() => {
        const filtered = data.filter((item) =>
            item.product_name.toLowerCase().includes(search.toLowerCase())
        );

        return filtered.flatMap((item) => {
            if (!item.product_codes || item.product_codes.length === 0) {
                return [{
                    rowId: `p-${item.id}`,
                    productId: item.id,
                    codeId: null,
                    product_name: item.product_name,
                    product_type: item.product_type,
                    product_code: null,
                }];
            }

            return item.product_codes.map((code: any) => ({
                rowId: `pc-${item.id}-${code.id}`,
                productId: item.id,
                codeId: code.id,
                product_name: item.product_name,
                product_type: item.product_type,
                product_code: code.product_code,
            }));
        });
    }, [data, search]);

    // Jalankan Mode Edit
    const handleStartEdit = (item: any) => {
        setEditingRowId(item.rowId);
        setEditValues({
            product_name: item.product_name,
            product_type: item.product_type,
            product_code: item.product_code || "",
        });
    };

    // Form Submit Handler untuk Update
    const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const res = await updateProduct(formData);
            if (res.success) {
                setEditingRowId(null);
                router.refresh();
            } else {
                alert(res.message);
            }
        });
    };

    // Handler Hapus
    const handleDelete = (productId: number, codeId: number | null) => {
        const message = codeId
            ? "Apakah kamu yakin ingin menghapus KODE PRODUK ini?"
            : "Apakah kamu yakin ingin menghapus INDUK PRODUK ini beserta seluruh kodenya?";

        if (confirm(message)) {
            startTransition(async () => {
                const res = await deleteProductItem(productId, codeId);
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
            <div>
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        placeholder="Cari nama barang..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-80 rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-[#0E5EA2] focus:ring-2 focus:ring-[#0E5EA2]/20"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCreateProduct((prev) => !prev)}
                            className="flex items-center gap-2 rounded-lg bg-[#0E5EA2] px-4 py-2 text-white hover:bg-[#0B4D86]"
                        >
                            {showCreateProduct ? <X size={18} /> : <Plus size={18} />}
                            {showCreateProduct ? "Tutup" : "Tambah Barang"}
                        </button>

                        <button
                            onClick={() => setShowCreateCodeProduct((prev) => !prev)}
                            className="flex items-center gap-2 rounded-lg bg-[#0E5EA2] px-4 py-2 text-white hover:bg-[#0B4D86]"
                        >
                            {showCreateCodeProduct ? <X size={18} /> : <Plus size={18} />}
                            {showCreateCodeProduct ? "Tutup" : "Tambah Kode Barang"}
                        </button>
                    </div>
                </div>
            </div>

            {/* FORM TAMBAH BARANG */}
            {showCreateProduct && (
                <form action={formActionProduct} className="mt-6">
                    <div className="rounded-xl border bg-slate-200 p-6 text-black shadow-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Nama Barang</label>
                                <input name="product_name" required className="w-full rounded-lg border px-3 py-2 bg-white" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Tipe Barang</label>
                                <input name="product_type" required className="w-full rounded-lg border px-3 py-2 bg-white" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowCreateProduct(false)} className="rounded-lg border px-4 py-2">Batal</button>
                            <button className="rounded-lg bg-[#0E5EA2] px-4 py-2 text-white">Tambah</button>
                        </div>
                    </div>
                </form>
            )}

            {/* FORM TAMBAH KODE BARANG */}
            {showCreateCodeProduct && (
                <form action={formActionCode} className="mt-6">
                    <div className="rounded-xl border bg-slate-200 p-6 text-black shadow-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Nama Barang</label>
                                <select name="product_id" className="w-full rounded-lg border px-3 py-2 bg-white" defaultValue="" required>
                                    <option value="" disabled>-- Pilih Barang --</option>
                                    {data.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.product_name} ({item.product_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Kode Barang</label>
                                <input name="product_code" required className="w-full rounded-lg border px-3 py-2 bg-white" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowCreateCodeProduct(false)} className="rounded-lg border px-4 py-2">Batal</button>
                            <button className="rounded-lg bg-[#0E5EA2] px-4 py-2 text-white">Tambah</button>
                        </div>
                    </div>
                </form>
            )}

            {/* TABEL BARANG */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden text-black">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm whitespace-nowrap">
                        <thead className="bg-[#0E5EA2] text-white">
                            <tr>
                                <th className="px-4 py-3 text-center">No</th>
                                <th className="px-4 py-3 text-left">Nama Barang</th>
                                <th className="px-4 py-3 text-left">Tipe Barang</th>
                                <th className="px-4 py-3 text-left">Kode Barang</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => {
                                    const isEditing = editingRowId === item.rowId;

                                    if (isEditing) {
                                        return (
                                            <tr key={item.rowId} className="bg-blue-50/80 border-b">
                                                <td className="px-4 py-3 text-center">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        form={`form-${item.rowId}`}
                                                        name="product_name"
                                                        value={editValues.product_name}
                                                        onChange={(e) => setEditValues({ ...editValues, product_name: e.target.value })}
                                                        className="w-full px-2 py-1 border rounded bg-white"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        form={`form-${item.rowId}`}
                                                        name="product_type"
                                                        value={editValues.product_type}
                                                        onChange={(e) => setEditValues({ ...editValues, product_type: e.target.value })}
                                                        className="w-full px-2 py-1 border rounded bg-white"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        form={`form-${item.rowId}`}
                                                        name="product_code"
                                                        value={editValues.product_code}
                                                        onChange={(e) => setEditValues({ ...editValues, product_code: e.target.value })}
                                                        className="w-full px-2 py-1 border rounded bg-white"
                                                        disabled={!item.codeId}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <form id={`form-${item.rowId}`} onSubmit={handleUpdateSubmit}>
                                                        <input type="hidden" name="product_id" value={item.productId} />
                                                        {item.codeId && <input type="hidden" name="code_id" value={item.codeId} />}
                                                    </form>
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            type="submit"
                                                            form={`form-${item.rowId}`}
                                                            disabled={isPending}
                                                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-300"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingRowId(null)}
                                                            disabled={isPending}
                                                            className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={item.rowId} className="border-b hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 text-center">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{item.product_name}</td>
                                            <td className="px-4 py-3">{item.product_type}</td>
                                            <td className="px-4 py-3 font-mono">{item.product_code ?? "-"}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button
                                                        onClick={() => handleStartEdit(item)}
                                                        disabled={isPending}
                                                        className="text-blue-600 hover:text-blue-800 transition"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.productId, item.codeId)}
                                                        disabled={isPending}
                                                        className="text-red-600 hover:text-red-800 transition"
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
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
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