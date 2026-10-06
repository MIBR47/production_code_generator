"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { updateSupplierAction, createSupplierAction } from "@/actions/suppliers";
import { SupplierSerialized } from "./types";
// import { createSupplierAction, updateSupplierAction } from "@/actions/suppliers";
// import { SupplierSerialized } from "./types";

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
    supplier?: SupplierSerialized | null;
}

export default function SupplierModal({ open, onClose, onSaved, supplier }: Props) {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEdit = !!supplier;

    const resetForm = () => {
        setName("");
        setContact("");
        setAddress("");
        setError(null);
    };

    useEffect(() => {
        if (!open) return;

        if (supplier) {
            setName(supplier.name);
            setContact(supplier.contact ?? "");
            setAddress(supplier.address ?? "");
            setError(null);
        } else {
            resetForm();
        }
    }, [open, supplier]);

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) return setError("Nama supplier wajib diisi.");

        try {
            setIsSubmitting(true);

            const payload = {
                name: name.trim(),
                contact: contact.trim() || null,
                address: address.trim() || null,
            };

            const result = isEdit
                ? await updateSupplierAction({
                    id: supplier.id,
                    ...payload,
                })
                : await createSupplierAction(payload);

            if (!result.success) {
                setError(result.message);
                return;
            }

            resetForm();
            await onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            setError("Terjadi kesalahan saat menyimpan supplier.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isEdit ? "Edit Supplier" : "Tambah Supplier"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {isEdit ? "Perbarui informasi supplier." : "Tambahkan supplier baru untuk purchasing."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Nama Supplier</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: PT Krakatau Steel"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Contact</label>
                            <input
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                placeholder="Contoh: 081234567890 / Budi"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Alamat</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                placeholder="Alamat supplier..."
                                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={17} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                isEdit ? "Simpan Perubahan" : "Simpan Supplier"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}