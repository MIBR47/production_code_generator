export type ItemCategory =
    | "RAW_MATERIAL"
    | "SUPPORTING_MATERIAL"
    | "SERVICE";

export type ItemType =
    | "STORABLE"
    | "CONSUMABLE"
    | "SERVICE";

export type TrackingType =
    | "NONE"
    | "LOT";


export type ItemGroupSerialized = {
    id: number;
    name: string;
    code_prefix: string;
    last_number: number;
};


export type UnitOfMeasureSerialized = {
    id: number;
    name: string;
    symbol: string | null;
};


export type ItemSerialized = {
    id: number;

    name: string;
    reference: string;

    group_id: number;

    category: ItemCategory;
    item_type: ItemType;

    uom_id: number;
    purchase_uom_id: number | null;

    default_purchase_qty: number | null;

    cost: number;

    tracking: TrackingType;

    is_active: boolean;

    created_at: Date;
    updated_at: Date;

    group: ItemGroupSerialized;

    uom: UnitOfMeasureSerialized;

    purchase_uom: UnitOfMeasureSerialized | null;
};


export type CreateItemInput = {
    name: string;

    group_id: number;

    category: ItemCategory;

    item_type: ItemType;

    uom_id: number;

    purchase_uom_id: number | null;

    default_purchase_qty: number | null;

    cost: number;

    tracking: TrackingType;
};


export type ItemActionResult = {
    success: boolean;
    message: string;
    item?: ItemSerialized;
};