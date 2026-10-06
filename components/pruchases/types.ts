import { ItemSerialized } from "@/components/items/types";
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

export type PurchaseOrderItemSerialized = {
    id: number;
    item_id: number;
    quantity: number;
    uom_id: number;
    unit_price: number;
    subtotal: number;
    item: ItemSerialized;
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