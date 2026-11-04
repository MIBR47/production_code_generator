import type { PurchaseOrderStatus } from "@/components/purchases/types";

export const PURCHASE_STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
    DRAFT: "Draft",
    CONFIRMED: "Confirmed",
    PARTIALLY_RECEIVED: "Partially Received",
    RECEIVED: "Received",
    CANCELLED: "Cancelled",
};

export function canEditPurchase(status: PurchaseOrderStatus) {
    return status === "DRAFT";
}

export function canConfirmPurchase(status: PurchaseOrderStatus) {
    return status === "DRAFT";
}

export function canReceivePurchase(status: PurchaseOrderStatus) {
    return status === "CONFIRMED" || status === "PARTIALLY_RECEIVED";
}

export function canCancelPurchase(status: PurchaseOrderStatus) {
    return status === "DRAFT" || status === "CONFIRMED";
}

export function isPurchaseReadOnly(status: PurchaseOrderStatus) {
    return status === "RECEIVED" || status === "CANCELLED";
}