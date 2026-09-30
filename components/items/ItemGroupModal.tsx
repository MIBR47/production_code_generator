"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";
import { createItemGroupAction } from "@/actions/items";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => Promise<void>;
}

export default function ItemGroupModal({ open, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [codePrefix, setCodePrefix] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setName("");
        setCodePrefix("");
        setError(null);
    };

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) return setError("Nama group wajib diisi.");
        if (!codePrefix.trim()) return setError("Code prefix wajib diisi.");

        try {
            setIsSubmitting(true);

            const result = await createItemGroupAction({
                name: name.trim(),
                code_prefix: codePrefix.trim(),
            });

            if (!result.success) return setError(result.message);

            resetForm();
            await onCreated();
            onClose();
        } catch (error) {
            console.error(error);
            setError("Terjadi kesalahan saat menambahkan group.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-slate-900">Tambah Item Group</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Group digunakan untuk pengelompokan dan prefix reference.
                        </p>
                    </div>

                    <button type="button" onClick={handleClose} disabled={isSubmitting}>
                        <X size={19} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-5">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Nama Group
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Sheet Plate SPCC"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Code Prefix
                            </label>
                            <input
                                value={codePrefix}
                                onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                                placeholder="Contoh: SPCC"
                                maxLength={20}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-slate-400"
                            />
                            <p className="mt-1 text-xs text-slate-400">
                                Reference akan menjadi SPCC0001, SPCC0002, dst.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t px-5 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="rounded-lg border px-4 py-2 text-sm"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Simpan
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}