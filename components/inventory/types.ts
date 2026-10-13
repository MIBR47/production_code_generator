import {
    ItemCategory,
    ItemType,
    TrackingType,
} from "@/components/items/types";

export type InventoryStockSerialized = {
    item_id: number;
    reference: string;
    name: string;
    category: ItemCategory;
    item_type: ItemType;
    tracking: TrackingType;
    stock: number;

    group: {
        id: number;
        name: string;
    };

    uom: {
        id: number;
        name: string;
        symbol: string | null;
    };
};

export type StockMovementType =
    | "PURCHASE_IN"
    | "MANUFACTURING_OUT"
    | "MANUFACTURING_IN"
    | "ADJUSTMENT_IN"
    | "ADJUSTMENT_OUT"
    | "RETURN_IN"
    | "RETURN_OUT";

export type StockMovementSerialized = {
    id: number;
    item_id: number;
    lot_id: number | null;
    movement_type: StockMovementType;
    quantity: number;
    reference: string | null;
    remarks: string | null;
    movement_date: string;
    created_at: string;

    item: {
        id: number;
        reference: string;
        name: string;
    };

    lot: {
        id: number;
        lot_number: string;
    } | null;

    uom: {
        id: number;
        name: string;
        symbol: string | null;
    };
};