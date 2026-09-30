"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DraftItem } from "@/components/production-codes/types";

interface Props {
    draft: DraftItem;
    formAction: (payload: FormData) => void;
    onDraftChange: (
        tempId: string,
        field: keyof DraftItem,
        value: string | number | boolean
    ) => void;
    onRemoveDraft: (tempId: string) => void;
    onSubmitStart: (tempId: string) => void;
    onDuplicateDraft: (draft: DraftItem) => void;
}

export function DraftTableRow({
    draft,
    formAction,
    onDraftChange,
    onRemoveDraft,
    onSubmitStart,
    onDuplicateDraft,
}: Props) {
    const formattedProductionNumber = String(draft.productionNumber).padStart(4, "0");
    const productionCode = `${draft.productCode}-${draft.batch ?? ""}${formattedProductionNumber}`;

    const updateField = (
        field: keyof DraftItem,
        value: string | number | boolean
    ) => {
        onDraftChange(draft.tempId, field, value);
    };

    return (
        <tr className="bg-amber-50/80 border-b-2 border-amber-300">
            <td className="px-4 py-3 text-center font-bold text-amber-700">
                npm
            </td>

            <td className="px-4 py-3 text-center font-bold text-amber-700">
                Draft
            </td>

            <td className="px-4 py-3 font-medium">{draft.productName}</td>
            <td className="px-4 py-3">{draft.productType}</td>
            <td className="px-4 py-3">{draft.productCode}</td>

            <td className="px-2 py-2">
                <Input
                    type="text"
                    placeholder="Batch (e.g. VI26)..."
                    value={draft.batch}
                    onChange={(e) => updateField("batch", e.target.value)}
                    className="h-8 min-w-[100px] bg-white font-mono text-xs"
                />
            </td>

            <td className="px-4 py-3 font-mono font-semibold text-amber-900">
                {formattedProductionNumber}
            </td>

            <td className="px-4 py-3 font-mono text-xs font-bold text-amber-800">
                {productionCode}
            </td>

            <td className="px-4 py-3">{draft.customerName}</td>

            <td className="px-2 py-2">
                <Input
                    type="text"
                    placeholder="SPK..."
                    value={draft.spk}
                    onChange={(e) => updateField("spk", e.target.value)}
                    className="h-8 min-w-[90px] bg-white text-xs"
                />
            </td>

            <td className="px-2 py-2">
                <Input
                    type="text"
                    placeholder="Keterangan..."
                    value={draft.remarks}
                    onChange={(e) => updateField("remarks", e.target.value)}
                    className="h-8 min-w-[120px] bg-white text-xs"
                />
            </td>

            <td className="px-2 py-2">
                <Input
                    type="date"
                    value={draft.outDate}
                    onChange={(e) => updateField("outDate", e.target.value)}
                    className="h-8 w-36 bg-white text-xs"
                />
            </td>

            <td className="px-2 py-2">
                <Input
                    type="text"
                    placeholder="Penerima..."
                    value={draft.item_code_recipient}
                    onChange={(e) =>
                        updateField("item_code_recipient", e.target.value)
                    }
                    className="h-8 min-w-[100px] bg-white text-xs"
                />
            </td>

            <td className="px-4 py-3 text-center">
                <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-100 text-amber-800"
                >
                    Draft
                </Badge>
            </td>

            <td className="px-4 py-3 text-center">
                <form
                    action={formAction}
                    onSubmit={() => onSubmitStart(draft.tempId)}
                    className="inline-flex gap-1"
                >
                    <input type="hidden" name="product_id" value={draft.productId} />
                    <input
                        type="hidden"
                        name="product_code_id"
                        value={draft.productCodeId}
                    />
                    <input
                        type="hidden"
                        name="customer_id"
                        value={draft.customerId}
                    />
                    <input
                        type="hidden"
                        name="production_number"
                        value={draft.productionNumber}
                    />
                    <input
                        type="hidden"
                        name="production_code"
                        value={productionCode}
                    />
                    <input type="hidden" name="batch" value={draft.batch} />
                    <input type="hidden" name="spk" value={draft.spk} />
                    <input type="hidden" name="remarks" value={draft.remarks} />
                    <input type="hidden" name="out_date" value={draft.outDate} />
                    <input
                        type="hidden"
                        name="item_code_recipient"
                        value={draft.item_code_recipient}
                    />

                    <Button
                        type="submit"
                        size="sm"
                        className="h-7 bg-emerald-600 px-2.5 text-xs text-white hover:bg-emerald-700"
                    >
                        Simpan
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => onDuplicateDraft(draft)}
                        className="h-7 bg-amber-600 px-2.5 text-xs text-white hover:bg-amber-700"
                    >
                        Duplikat
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveDraft(draft.tempId)}
                        className="h-7 px-2.5 text-xs"
                    >
                        Batal
                    </Button>
                </form>
            </td>
        </tr>
    );
}