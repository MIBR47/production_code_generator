
import { SupplierSerialized } from "@/components/suppliers/types";

export type PurchaseOrderStatus =
    | "DRAFT"
    | "CONFIRMED"
    | "PARTIALLY_RECEIVED"
    | "RECEIVED"
    | "CANCELLED";

export type PurchaseOrderItemInput = {
    item_id: number;
    quantity: number;
    unit_price: number;
};

export type PurchaseOrderInput = {
    supplier_id: number;
    order_date: string;
    expected_date: string | null;
    remarks: string | null;
    items: PurchaseOrderItemInput[];
};

export type PurchaseItemSerialized = {
    id: number;
    name: string;
    reference: string;

    group_id: number;
    category: "RAW_MATERIAL" | "SUPPORTING_MATERIAL" | "SERVICE";
    item_type: "STORABLE" | "CONSUMABLE" | "SERVICE";

    uom_id: number;
    purchase_uom_id: number | null;

    default_purchase_qty: number | null;
    cost: number;

    tracking: "NONE" | "LOT";
    is_active: boolean;

    group: {
        id: number;
        name: string;
        code_prefix: string;
        last_number: number;
    };

    uom: {
        id: number;
        name: string;
        symbol: string | null;
    };

    purchase_uom: {
        id: number;
        name: string;
        symbol: string | null;
    } | null;
};

export type PurchaseOrderItemSerialized = {
    id: number;
    item_id: number;
    quantity: number;
    uom_id: number;
    unit_price: number;
    subtotal: number;
    item: PurchaseItemSerialized;
    uom: {
        id: number;
        name: string;
        symbol: string | null;
    };
};

export type PurchaseOrderSerialized = {
    id: number;
    po_number: string;
    supplier_id: number;
    order_date: string;
    expected_date: string | null;
    status: PurchaseOrderStatus;
    remarks: string | null;
    created_at: string;
    updated_at: string;
    supplier: SupplierSerialized;
    items: PurchaseOrderItemSerialized[];
    total_amount: number;
};

export type PurchaseOrderActionResult = {
    success: boolean;
    message: string;
    purchaseOrder?: PurchaseOrderSerialized;
};

export type PurchaseReceiptPOItem = {
    id: number;
    item_id: number;
    ordered_qty: number;
    already_received_qty: number;
    remaining_qty: number;
    purchase_uom: {
        id: number;
        name: string;
        symbol: string | null;
    };
    item: {
        id: number;
        name: string;
        reference: string;
        item_type: "STORABLE" | "CONSUMABLE" | "SERVICE";
        tracking: "NONE" | "LOT";
        default_purchase_qty: number | null;
        uom: {
            id: number;
            name: string;
            symbol: string | null;
        };
    };
};

export type PurchaseOrderReceiptData = {
    id: number;
    po_number: string;
    supplier_name: string;
    status: PurchaseOrderStatus;

    items: PurchaseReceiptPOItem[];

    receipts: PurchaseReceiptHistory[];
};

export type PurchaseReceiptLineInput = {
    purchase_order_item_id: number;
    received_purchase_qty: number;
    actual_qty: number;
    lot_number: string | null;
};

export type CreatePurchaseReceiptInput = {
    purchase_order_id: number;
    receipt_date: string;
    remarks: string | null;
    items: PurchaseReceiptLineInput[];
};

export type PurchaseReceiptActionResult = {
    success: boolean;
    message: string;
    receipt_number?: string;
};

export type PurchaseReceiptHistoryItem = {
    id: number;
    item_id: number;
    received_purchase_qty: number;
    actual_qty: number;

    item: {
        id: number;
        name: string;
        reference: string;
    };

    purchase_uom: {
        id: number;
        name: string;
        symbol: string | null;
    };

    uom: {
        id: number;
        name: string;
        symbol: string | null;
    };

    lots: {
        id: number;
        lot_number: string;
        initial_qty: number;
        remaining_qty: number;
    }[];
};
export type PurchaseReceiptHistory = {
    id: number;
    receipt_number: string;
    receipt_date: string;
    remarks: string | null;
    items: PurchaseReceiptHistoryItem[];
};