"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { Prisma } from "@/src/generated/prisma/browser";
import { PurchaseOrderSerialized, PurchaseOrderInput, PurchaseOrderActionResult } from "@/components/pruchases/types";

function serializePurchaseOrder(
    po: PurchaseOrderWithRelations
): PurchaseOrderSerialized {
    const items = po.items.map((line) => ({
        id: line.id,
        item_id: line.item_id,
        quantity: Number(line.quantity),
        uom_id: line.uom_id,
        unit_price: Number(line.unit_price),
        subtotal: Number(line.subtotal),

        item: {
            ...line.item,
            cost: Number(line.item.cost),
            default_purchase_qty:
                line.item.default_purchase_qty !== null
                    ? Number(line.item.default_purchase_qty)
                    : null,
        },

        uom: line.uom,
    }));

    return {
        id: po.id,
        po_number: po.po_number,
        supplier_id: po.supplier_id,
        order_date: po.order_date.toISOString(),
        expected_date: po.expected_date?.toISOString() ?? null,
        status: po.status,
        remarks: po.remarks,
        created_at: po.created_at.toISOString(),
        updated_at: po.updated_at.toISOString(),
        supplier: po.supplier,
        items,
        total_amount: items.reduce((total: number, line) => total + line.subtotal, 0),
    };
}

const poInclude = {
    supplier: true,
    items: {
        include: {
            item: {
                include: {
                    group: true,
                    uom: true,
                    purchase_uom: true,
                },
            },
            uom: true,
        },
    },
} satisfies Prisma.PurchaseOrderInclude;

type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{
    include: typeof poInclude;
}>;

// ======================================================
// GET PURCHASE ORDERS
// ======================================================

export async function getPurchaseOrders(): Promise<PurchaseOrderSerialized[]> {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
        include: poInclude,
        orderBy: { created_at: "desc" },
    });

    return purchaseOrders.map(serializePurchaseOrder);
}

// ======================================================
// CREATE PURCHASE ORDER
// ======================================================

export async function createPurchaseOrderAction(
    payload: PurchaseOrderInput
): Promise<PurchaseOrderActionResult> {
    try {
        if (!payload.supplier_id) return { success: false, message: "Supplier wajib dipilih." };
        if (!payload.order_date) return { success: false, message: "Tanggal PO wajib diisi." };
        if (!payload.items.length) return { success: false, message: "PO minimal memiliki 1 item." };

        for (const line of payload.items) {
            if (!line.item_id) return { success: false, message: "Item wajib dipilih." };
            if (line.quantity <= 0) return { success: false, message: "Quantity harus lebih dari 0." };
            if (line.unit_price < 0) return { success: false, message: "Harga item tidak valid." };
        }

        const purchaseOrder = await prisma.$transaction(async (tx) => {
            const itemIds = [...new Set(payload.items.map((line) => line.item_id))];

            const items = await tx.item.findMany({
                where: {
                    id: { in: itemIds },
                    is_active: true,
                },
            });

            if (items.length !== itemIds.length) {
                throw new Error("Terdapat item yang tidak ditemukan atau sudah tidak aktif.");
            }

            const itemMap = new Map(items.map((item) => [item.id, item]));

            // Temporary number dulu agar bisa mendapatkan ID database.
            const temporaryNumber = `TEMP-${crypto.randomUUID()}`;

            const created = await tx.purchaseOrder.create({
                data: {
                    po_number: temporaryNumber,
                    supplier_id: payload.supplier_id,
                    order_date: new Date(payload.order_date),
                    expected_date: payload.expected_date ? new Date(payload.expected_date) : null,
                    remarks: payload.remarks?.trim() || null,
                    status: "DRAFT",
                    items: {
                        create: payload.items.map((line) => {
                            const item = itemMap.get(line.item_id)!;

                            // Purchase UOM kalau tersedia.
                            // Kalau tidak, gunakan Inventory UOM.
                            const purchaseUomId = item.purchase_uom_id ?? item.uom_id;
                            const subtotal = line.quantity * line.unit_price;

                            return {
                                item_id: line.item_id,
                                quantity: line.quantity,
                                uom_id: purchaseUomId,
                                unit_price: line.unit_price,
                                subtotal,
                            };
                        }),
                    },
                },
            });

            const date = new Date(payload.order_date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const poNumber = `PO/${year}/${month}/${String(created.id).padStart(5, "0")}`;

            return tx.purchaseOrder.update({
                where: { id: created.id },
                data: { po_number: poNumber },
                include: poInclude,
            });
        });

        revalidatePath("/purchases");

        return {
            success: true,
            message: "Purchase Order berhasil dibuat.",
            purchaseOrder: serializePurchaseOrder(purchaseOrder),
        };
    } catch (error: any) {
        console.error("Error creating purchase order:", error);

        return {
            success: false,
            message: error?.message || "Gagal membuat Purchase Order.",
        };
    }
}

// ======================================================
// UPDATE PURCHASE ORDER
// HANYA DRAFT
// ======================================================

export async function updatePurchaseOrderAction(
    id: number,
    payload: PurchaseOrderInput
): Promise<PurchaseOrderActionResult> {
    try {
        const existing = await prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!existing) return { success: false, message: "Purchase Order tidak ditemukan." };

        if (existing.status !== "DRAFT") {
            return {
                success: false,
                message: "Hanya Purchase Order berstatus DRAFT yang dapat diedit.",
            };
        }

        if (!payload.supplier_id) return { success: false, message: "Supplier wajib dipilih." };
        if (!payload.items.length) return { success: false, message: "PO minimal memiliki 1 item." };

        const purchaseOrder = await prisma.$transaction(async (tx) => {
            const itemIds = [...new Set(payload.items.map((line) => line.item_id))];

            const items = await tx.item.findMany({
                where: {
                    id: { in: itemIds },
                    is_active: true,
                },
            });

            if (items.length !== itemIds.length) {
                throw new Error("Terdapat item yang tidak ditemukan atau sudah tidak aktif.");
            }

            const itemMap = new Map(items.map((item) => [item.id, item]));

            await tx.purchaseOrderItem.deleteMany({
                where: { purchase_order_id: id },
            });

            return tx.purchaseOrder.update({
                where: { id },
                data: {
                    supplier_id: payload.supplier_id,
                    order_date: new Date(payload.order_date),
                    expected_date: payload.expected_date ? new Date(payload.expected_date) : null,
                    remarks: payload.remarks?.trim() || null,
                    items: {
                        create: payload.items.map((line) => {
                            const item = itemMap.get(line.item_id)!;

                            return {
                                item_id: line.item_id,
                                quantity: line.quantity,
                                uom_id: item.purchase_uom_id ?? item.uom_id,
                                unit_price: line.unit_price,
                                subtotal: line.quantity * line.unit_price,
                            };
                        }),
                    },
                },
                include: poInclude,
            });
        });

        revalidatePath("/purchases");

        return {
            success: true,
            message: "Purchase Order berhasil diperbarui.",
            purchaseOrder: serializePurchaseOrder(purchaseOrder),
        };
    } catch (error: any) {
        console.error("Error updating purchase order:", error);

        return {
            success: false,
            message: error?.message || "Gagal memperbarui Purchase Order.",
        };
    }
}

// ======================================================
// CONFIRM PURCHASE ORDER
// ======================================================

export async function confirmPurchaseOrderAction(
    id: number
): Promise<PurchaseOrderActionResult> {
    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!po) return { success: false, message: "Purchase Order tidak ditemukan." };

        if (po.status !== "DRAFT") {
            return {
                success: false,
                message: "Hanya PO DRAFT yang dapat dikonfirmasi.",
            };
        }

        await prisma.purchaseOrder.update({
            where: { id },
            data: { status: "CONFIRMED" },
        });

        revalidatePath("/purchases");

        return {
            success: true,
            message: "Purchase Order berhasil dikonfirmasi.",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Gagal mengkonfirmasi Purchase Order.",
        };
    }
}

// ======================================================
// CANCEL PURCHASE ORDER
// ======================================================

export async function cancelPurchaseOrderAction(
    id: number
): Promise<PurchaseOrderActionResult> {
    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!po) return { success: false, message: "Purchase Order tidak ditemukan." };

        if (po.status === "RECEIVED" || po.status === "PARTIALLY_RECEIVED") {
            return {
                success: false,
                message: "PO yang sudah menerima barang tidak dapat dibatalkan.",
            };
        }

        if (po.status === "CANCELLED") {
            return {
                success: false,
                message: "Purchase Order sudah dibatalkan.",
            };
        }

        await prisma.purchaseOrder.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        revalidatePath("/purchases");

        return {
            success: true,
            message: "Purchase Order berhasil dibatalkan.",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Gagal membatalkan Purchase Order.",
        };
    }
}