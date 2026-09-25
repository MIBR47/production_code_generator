"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { createItemAction } from "@/actions/items";
import { ItemCategory, ItemType, TrackingType, ItemGroupSerialized, UnitOfMeasureSerialized } from "./types";

interface Props {
    open: boolean;
    onClose: () => void;
    groups: ItemGroupSerialized[];
    uoms: UnitOfMeasureSerialized[];
    onCreated: () => Promise<void>;
}

export default function ItemModal({ open, onClose, groups, uoms, onCreated }: Props) {
    const [name, setName] = useState("");
    const [groupId, setGroupId] = useState<number | null>(null);
    const [category, setCategory] = useState<ItemCategory>("RAW_MATERIAL");
    const [itemType, setItemType] = useState<ItemType>("STORABLE");
    const [uomId, setUomId] = useState<number | null>(null);
    const [purchaseUomId, setPurchaseUomId] = useState<number | null>(null);
    const [defaultPurchaseQty, setDefaultPurchaseQty] = useState("");
    const [tracking, setTracking] = useState<TrackingType>("NONE");
    const [cost, setCost] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedGroup = groups.find((group) => group.id === groupId);
    const isService = category === "SERVICE";

    const referencePreview = useMemo(() => {
        if (!selectedGroup) return "";

        const nextNumber = selectedGroup.last_number + 1;
        return `${selectedGroup.code_prefix}${String(nextNumber).padStart(4, "0")}`;
    }, [selectedGroup]);

    const resetForm = () => {
        setName("");
        setGroupId(null);
        setCategory("RAW_MATERIAL");
        setItemType("STORABLE");
        setUomId(null);
        setPurchaseUomId(null);
        setDefaultPurchaseQty("");
        setTracking("NONE");
        setCost("");
        setError(null);
    };

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleCategoryChange = (value: ItemCategory) => {
        setCategory(value);

        if (value === "SERVICE") {
            setItemType("SERVICE");
            setTracking("NONE");
            setPurchaseUomId(null);
            setDefaultPurchaseQty("");
        } else if (itemType === "SERVICE") {
            setItemType("STORABLE");
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!name.trim()) return setError("Nama item wajib diisi.");
        if (!groupId) return setError("Group wajib dipilih.");
        if (!uomId) return setError("UOM wajib dipilih.");

        try {
            setIsSubmitting(true);

            const result = await createItemAction({
                name: name.trim(),
                group_id: groupId,
                category,
                item_type: itemType,
                uom_id: uomId,
                purchase_uom_id: isService ? null : purchaseUomId,
                default_purchase_qty: isService || defaultPurchaseQty === "" ? null : Number(defaultPurchaseQty),
                cost: cost === "" ? 0 : Number(cost),
                tracking: isService ? "NONE" : tracking,
            });

            if (!result.success) {
                setError(result.message);
                return;
            }

            resetForm();
            await onCreated();
            onClose();
        } catch (error) {
            console.error(error);
            setError("Terjadi kesalahan saat menyimpan item.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* HEADER */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Tambah Item</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Tambahkan raw material, supporting material, atau jasa.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 p-6">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* NAME + CATEGORY */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Nama Item</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Bahan Vinil Cherokee Force Hitam"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => handleCategoryChange(e.target.value as ItemCategory)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                >
                                    <option value="RAW_MATERIAL">Raw Material</option>
                                    <option value="SUPPORTING_MATERIAL">Supporting Material</option>
                                    <option value="SERVICE">Service</option>
                                </select>
                            </div>
                        </div>

                        {/* GROUP + REFERENCE */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Group</label>
                                <select
                                    value={groupId ?? ""}
                                    onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                >
                                    <option value="">Pilih Group</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Reference</label>
                                <input
                                    readOnly
                                    value={referencePreview}
                                    placeholder="Auto generated"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-600"
                                />
                                <p className="mt-1 text-xs text-slate-400">Reference final dibuat oleh server.</p>
                            </div>
                        </div>

                        {/* TYPE + TRACKING */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Item Type</label>
                                <select
                                    value={itemType}
                                    disabled={isService}
                                    onChange={(e) => setItemType(e.target.value as ItemType)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"
                                >
                                    <option value="STORABLE">Storable</option>
                                    <option value="CONSUMABLE">Consumable</option>
                                    <option value="SERVICE">Service</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Tracking</label>
                                <select
                                    value={tracking}
                                    disabled={isService}
                                    onChange={(e) => setTracking(e.target.value as TrackingType)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"
                                >
                                    <option value="NONE">None</option>
                                    <option value="LOT">Lot / Roll / Batch</option>
                                </select>
                            </div>
                        </div>

                        {/* UOM */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Inventory UOM</label>
                                <select
                                    value={uomId ?? ""}
                                    onChange={(e) => setUomId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                >
                                    <option value="">Pilih UOM</option>
                                    {uoms.map((uom) => (
                                        <option key={uom.id} value={uom.id}>
                                            {uom.name}{uom.symbol ? ` (${uom.symbol})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Purchase UOM</label>
                                <select
                                    value={purchaseUomId ?? ""}
                                    disabled={isService}
                                    onChange={(e) => setPurchaseUomId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"
                                >
                                    <option value="">Sama dengan Inventory UOM</option>
                                    {uoms.map((uom) => (
                                        <option key={uom.id} value={uom.id}>
                                            {uom.name}{uom.symbol ? ` (${uom.symbol})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* DEFAULT PURCHASE + COST */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {!isService && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Default Purchase Quantity
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={defaultPurchaseQty}
                                        onChange={(e) => setDefaultPurchaseQty(e.target.value)}
                                        placeholder="Contoh: 50"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                                    />
                                    <p className="mt-1 text-xs text-slate-400">Contoh: 1 ROLL biasanya 50 MTR.</p>
                                </div>
                            )}

                            <div className={isService ? "md:col-span-2" : ""}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Cost</label>
                                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                                    <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        placeholder="0"
                                        className="flex-1 px-3 py-2.5 text-sm outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleClose}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={17} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Item"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}