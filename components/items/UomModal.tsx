"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";
import { createUomAction } from "@/actions/items";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => Promise<void>;
}

export default function UomModal({ open, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setName("");
        setSymbol("");
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

        if (!name.trim()) return setError("Nama UOM wajib diisi.");

        try {
            setIsSubmitting(true);

            const result = await createUomAction({
                name: name.trim(),
                symbol: symbol.trim() || null,
            });

            if (!result.success) return setError(result.message);

            resetForm();
            await onCreated();
            onClose();
        } catch (error) {
            console.error(error);
            setError("Terjadi kesalahan saat menambahkan UOM.");
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
                        <h2 className="font-semibold text-slate-900">Tambah UOM</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Tambahkan satuan baru untuk purchasing atau inventory.
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
                                Nama UOM
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Meter"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Symbol
                            </label>
                            <input
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                placeholder="Contoh: MTR"
                                maxLength={20}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-slate-400"
                            />
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