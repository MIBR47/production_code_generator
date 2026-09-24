"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
}

const groups = [
    {
        id: 1,
        name: "Sheet Plate SPCC",
        codePrefix: "SPCC",
        lastNumber: 12,
    },
    {
        id: 2,
        name: "Vinyl Cherokee",
        codePrefix: "VCH",
        lastNumber: 3,
    },
    {
        id: 3,
        name: "Hollow Galvanis",
        codePrefix: "HLG",
        lastNumber: 8,
    },
];

const uoms = [
    { id: 1, name: "Meter", symbol: "MTR" },
    { id: 2, name: "Roll", symbol: "ROLL" },
    { id: 3, name: "Sheet", symbol: "SHT" },
    { id: 4, name: "Pieces", symbol: "PCS" },
    { id: 5, name: "Batang", symbol: "BTG" },
];

export default function RawMaterialModal({
    open,
    onClose,
}: Props) {
    const [name, setName] = useState("");
    const [groupId, setGroupId] = useState<number | null>(null);

    const [uomId, setUomId] = useState<number | null>(null);
    const [purchaseUomId, setPurchaseUomId] =
        useState<number | null>(null);

    const [defaultPurchaseQty, setDefaultPurchaseQty] =
        useState("");

    const [itemType, setItemType] =
        useState<"STORABLE" | "CONSUMABLE">("STORABLE");

    const [tracking, setTracking] =
        useState<"NONE" | "LOT">("NONE");

    const [cost, setCost] = useState("");

    const selectedGroup = groups.find(
        (group) => group.id === groupId
    );

    // Hanya preview.
    // Reference final sebaiknya tetap dibuat backend.
    const referencePreview = useMemo(() => {
        if (!selectedGroup) return "";

        const nextNumber = selectedGroup.lastNumber + 1;

        return `${selectedGroup.codePrefix}${String(
            nextNumber
        ).padStart(4, "0")}`;
    }, [selectedGroup]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            group_id: groupId,

            // RAW MATERIAL sudah fixed karena halaman ini
            // khusus membuat raw material.
            category: "RAW_MATERIAL",

            item_type: itemType,

            uom_id: uomId,
            purchase_uom_id: purchaseUomId,

            default_purchase_qty:
                defaultPurchaseQty === ""
                    ? null
                    : Number(defaultPurchaseQty),

            cost: Number(cost || 0),

            tracking,
        };

        console.log(payload);

        // nanti:
        // await fetch("/api/items/raw-material", ...)
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Tambah Raw Material
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Tambahkan bahan baku baru untuk inventory dan
                            manufacturing.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 p-6">
                        {/* Nama */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Nama Material
                            </label>

                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Bahan Vinil Cherokee Force Hitam"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                            />
                        </div>

                        {/* Group + Reference */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Group
                                </label>

                                <select
                                    required
                                    value={groupId ?? ""}
                                    onChange={(e) =>
                                        setGroupId(Number(e.target.value))
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                >
                                    <option value="">Pilih group</option>

                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Reference
                                </label>

                                <input
                                    readOnly
                                    value={referencePreview}
                                    placeholder="Auto generated"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-600"
                                />

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Dibuat otomatis berdasarkan group.
                                </p>
                            </div>
                        </div>

                        {/* UOM */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Inventory UOM
                                </label>

                                <select
                                    required
                                    value={uomId ?? ""}
                                    onChange={(e) =>
                                        setUomId(Number(e.target.value))
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                                >
                                    <option value="">Pilih UOM</option>

                                    {uoms.map((uom) => (
                                        <option key={uom.id} value={uom.id}>
                                            {uom.name} ({uom.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Purchase UOM
                                </label>

                                <select
                                    value={purchaseUomId ?? ""}
                                    onChange={(e) =>
                                        setPurchaseUomId(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                                >
                                    <option value="">Sama dengan Inventory UOM</option>

                                    {uoms.map((uom) => (
                                        <option key={uom.id} value={uom.id}>
                                            {uom.name} ({uom.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Default qty */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Default Purchase Quantity
                            </label>

                            <input
                                type="number"
                                step="0.001"
                                value={defaultPurchaseQty}
                                onChange={(e) =>
                                    setDefaultPurchaseQty(e.target.value)
                                }
                                placeholder="Contoh: 50"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none"
                            />

                            <p className="mt-1.5 text-xs text-slate-400">
                                Estimasi isi Purchase UOM dalam Inventory UOM.
                            </p>
                        </div>

                        {/* Type + Tracking */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Item Type
                                </label>

                                <select
                                    value={itemType}
                                    onChange={(e) =>
                                        setItemType(
                                            e.target.value as
                                            | "STORABLE"
                                            | "CONSUMABLE"
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                >
                                    <option value="STORABLE">Storable</option>
                                    <option value="CONSUMABLE">
                                        Consumable
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Tracking
                                </label>

                                <select
                                    value={tracking}
                                    onChange={(e) =>
                                        setTracking(
                                            e.target.value as "NONE" | "LOT"
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                >
                                    <option value="NONE">None</option>
                                    <option value="LOT">Lot / Roll / Batch</option>
                                </select>
                            </div>
                        </div>

                        {/* Cost */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Cost
                            </label>

                            <div className="flex overflow-hidden rounded-lg border border-slate-200">
                                <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">
                                    Rp
                                </span>

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

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Simpan Raw Material
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}