"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { Prisma } from "@/src/generated/prisma/browser";
import { PurchaseOrderSerialized, PurchaseOrderInput, PurchaseOrderActionResult, PurchaseOrderReceiptData, CreatePurchaseReceiptInput, PurchaseReceiptActionResult } from "@/components/purchases/types";



const receiptPoInclude = {
    supplier: true,

    items: {
        include: {
            item: {
                include: {
                    uom: true,
                    purchase_uom: true,
                },
            },

            uom: true,
            receipt_items: true,
        },
    },

    receipts: {
        include: {
            items: {
                include: {
                    item: true,
                    uom: true,
                    lots: true,

                    purchase_order_item: {
                        include: {
                            uom: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            receipt_date: "desc",
        },

    },
} satisfies Prisma.PurchaseOrderInclude;

type ReceiptPurchaseOrder = Prisma.PurchaseOrderGetPayload<{
    include: typeof receiptPoInclude;
}>;

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

// ======================================================
// GET PO FOR RECEIPT
// ======================================================

export async function getPurchaseOrderForReceipt(
    id: number
): Promise<PurchaseOrderReceiptData | null> {
    const po: ReceiptPurchaseOrder | null = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: receiptPoInclude,
    });

    if (!po) return null;

    return {
        id: po.id,
        po_number: po.po_number,
        supplier_name: po.supplier.name,
        status: po.status,

        items: po.items.map((poItem) => {
            const alreadyReceived = poItem.receipt_items.reduce(
                (total, receipt) =>
                    total + Number(receipt.received_purchase_qty),
                0
            );

            return {
                id: poItem.id,
                item_id: poItem.item_id,
                ordered_qty: Number(poItem.quantity),
                already_received_qty: alreadyReceived,
                remaining_qty: Math.max(
                    0,
                    Number(poItem.quantity) - alreadyReceived
                ),

                purchase_uom: {
                    id: poItem.uom.id,
                    name: poItem.uom.name,
                    symbol: poItem.uom.symbol,
                },

                item: {
                    id: poItem.item.id,
                    name: poItem.item.name,
                    reference: poItem.item.reference,
                    item_type: poItem.item.item_type,
                    tracking: poItem.item.tracking,

                    default_purchase_qty:
                        poItem.item.default_purchase_qty !== null
                            ? Number(poItem.item.default_purchase_qty)
                            : null,

                    uom: {
                        id: poItem.item.uom.id,
                        name: poItem.item.uom.name,
                        symbol: poItem.item.uom.symbol,
                    },
                },
            };
        }),

        receipts: po.receipts.map((receipt) => ({
            id: receipt.id,
            receipt_number: receipt.receipt_number,
            receipt_date: receipt.receipt_date.toISOString(),
            remarks: receipt.remarks,

            items: receipt.items.map((receiptItem) => ({
                id: receiptItem.id,
                item_id: receiptItem.item_id,
                received_purchase_qty: Number(
                    receiptItem.received_purchase_qty
                ),
                actual_qty: Number(receiptItem.actual_qty),

                item: {
                    id: receiptItem.item.id,
                    name: receiptItem.item.name,
                    reference: receiptItem.item.reference,
                },

                purchase_uom: {
                    id: receiptItem.purchase_order_item.uom.id,
                    name: receiptItem.purchase_order_item.uom.name,
                    symbol: receiptItem.purchase_order_item.uom.symbol,
                },

                uom: {
                    id: receiptItem.uom.id,
                    name: receiptItem.uom.name,
                    symbol: receiptItem.uom.symbol,
                },

                lots: receiptItem.lots.map((lot) => ({
                    id: lot.id,
                    lot_number: lot.lot_number,
                    initial_qty: Number(lot.initial_qty),
                    remaining_qty: Number(lot.remaining_qty),
                })),
            })),
        })),
    };
};


// ======================================================
// CREATE PURCHASE RECEIPT
// ======================================================

export async function createPurchaseReceiptAction(
    payload: CreatePurchaseReceiptInput
): Promise<PurchaseReceiptActionResult> {
    try {
        if (!payload.purchase_order_id) {
            return { success: false, message: "Purchase Order tidak valid." };
        }

        if (!payload.receipt_date) {
            return { success: false, message: "Tanggal penerimaan wajib diisi." };
        }

        if (!payload.items.length) {
            return { success: false, message: "Tidak ada barang yang diterima." };
        }

        const result = await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findUnique({
                where: { id: payload.purchase_order_id },
                include: receiptPoInclude,
            });

            if (!po) throw new Error("Purchase Order tidak ditemukan.");

            if (!["CONFIRMED", "PARTIALLY_RECEIVED"].includes(po.status)) {
                throw new Error("Purchase Order belum dapat menerima barang.");
            }

            const poItemMap = new Map(po.items.map((poItem) => [poItem.id, poItem]));

            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            const incomingByPoItem = new Map<number, number>();

            for (const line of payload.items) {
                const poItem = poItemMap.get(line.purchase_order_item_id);

                if (!poItem) {
                    throw new Error("Terdapat item yang tidak termasuk dalam PO.");
                }

                if (line.received_purchase_qty <= 0) {
                    throw new Error("Quantity penerimaan harus lebih dari 0.");
                }

                if (line.actual_qty <= 0) {
                    throw new Error(`Actual Qty ${poItem.item.name} harus lebih dari 0.`);
                }

                // if (poItem.item.tracking === "LOT" && !line.lot_number?.trim()) {
                //     throw new Error(`Lot Number untuk ${poItem.item.name} wajib diisi.`);
                // }
                const manualLotNumbers = payload.items
                    .filter((line) => line.lot_number?.trim())
                    .map((line) => line.lot_number!.trim());

                if (new Set(manualLotNumbers).size !== manualLotNumbers.length) {
                    throw new Error("Terdapat Lot Number yang sama.");
                }

                if (manualLotNumbers.length) {
                    const existingLots = await tx.itemLot.findMany({
                        where: { lot_number: { in: manualLotNumbers } },
                        select: { lot_number: true },
                    });

                    if (existingLots.length) {
                        throw new Error(`Lot Number ${existingLots[0].lot_number} sudah digunakan.`);
                    }
                }
                incomingByPoItem.set(
                    poItem.id,
                    (incomingByPoItem.get(poItem.id) ?? 0) + line.received_purchase_qty
                );
            }

            // Jangan menerima lebih dari quantity PO.
            for (const poItem of po.items) {
                const alreadyReceived = poItem.receipt_items.reduce(
                    (total, receipt) => total + Number(receipt.received_purchase_qty),
                    0
                );

                const incoming = incomingByPoItem.get(poItem.id) ?? 0;
                const remaining = Number(poItem.quantity) - alreadyReceived;

                if (incoming > remaining + 0.0001) {
                    throw new Error(
                        `${poItem.item.name} melebihi sisa PO. Sisa: ${remaining} ${poItem.uom.symbol ?? poItem.uom.name}`
                    );
                }
            }

            // Cek duplicate lot dalam request.
            const lotNumbers = payload.items
                .filter((line) => line.lot_number)
                .map((line) => line.lot_number!.trim());

            if (new Set(lotNumbers).size !== lotNumbers.length) {
                throw new Error("Terdapat Lot Number yang sama.");
            }

            if (lotNumbers.length) {
                const existingLots = await tx.itemLot.findMany({
                    where: { lot_number: { in: lotNumbers } },
                    select: { lot_number: true },
                });

                if (existingLots.length) {
                    throw new Error(`Lot Number ${existingLots[0].lot_number} sudah digunakan.`);
                }
            }

            // ------------------------------------------
            // CREATE RECEIPT HEADER
            // ------------------------------------------

            const receipt = await tx.purchaseReceipt.create({
                data: {
                    receipt_number: `TEMP-${crypto.randomUUID()}`,
                    purchase_order_id: po.id,
                    receipt_date: new Date(payload.receipt_date),
                    remarks: payload.remarks?.trim() || null,
                },
            });

            const date = new Date(payload.receipt_date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");

            const receiptNumber =
                `GR/${year}/${month}/${String(receipt.id).padStart(5, "0")}`;

            await tx.purchaseReceipt.update({
                where: { id: receipt.id },
                data: { receipt_number: receiptNumber },
            });

            // ------------------------------------------
            // CREATE RECEIPT ITEMS + LOT + STOCK
            // ------------------------------------------

            for (const line of payload.items) {
                const poItem = poItemMap.get(line.purchase_order_item_id)!;

                const receiptItem = await tx.purchaseReceiptItem.create({
                    data: {
                        purchase_receipt_id: receipt.id,
                        purchase_order_item_id: poItem.id,
                        item_id: poItem.item_id,
                        received_purchase_qty: line.received_purchase_qty,
                        actual_qty: line.actual_qty,

                        // actual_qty selalu pakai Inventory UOM.
                        uom_id: poItem.item.uom_id,
                    },
                });



                let lotId: number | null = null;


                // --------------------------------------
                // LOT
                // --------------------------------------

                if (poItem.item.tracking === "LOT") {
                    const lotNumber =
                        line.lot_number?.trim() ||
                        `${poItem.item.reference}-LOT-${String(receiptItem.id).padStart(6, "0")}`;

                    const lot = await tx.itemLot.create({
                        data: {
                            item_id: poItem.item_id,
                            purchase_receipt_item_id: receiptItem.id,
                            lot_number: lotNumber,
                            initial_qty: line.actual_qty,
                            remaining_qty: line.actual_qty,
                        },
                    });

                    lotId = lot.id;
                }

                // --------------------------------------
                // STOCK MOVEMENT
                // Service tidak masuk inventory.
                // --------------------------------------

                if (poItem.item.item_type !== "SERVICE") {
                    await tx.stockMovement.create({
                        data: {
                            item_id: poItem.item_id,
                            lot_id: lotId,
                            movement_type: "PURCHASE_IN",
                            quantity: line.actual_qty,
                            uom_id: poItem.item.uom_id,
                            reference: receiptNumber,
                            remarks: `Receipt ${po.po_number}`,
                        },
                    });
                }
            }

            // ------------------------------------------
            // UPDATE PO STATUS
            // ------------------------------------------

            const updatedItems = await tx.purchaseOrderItem.findMany({
                where: {
                    purchase_order_id: po.id,
                },
                include: {
                    receipt_items: true,
                },
            });

            const allReceived = updatedItems.every((poItem) => {
                const received = poItem.receipt_items.reduce(
                    (total, receipt) => total + Number(receipt.received_purchase_qty),
                    0
                );

                return received >= Number(poItem.quantity);
            });

            const anyReceived = updatedItems.some((poItem) =>
                poItem.receipt_items.some(
                    (receipt) => Number(receipt.received_purchase_qty) > 0
                )
            );

            await tx.purchaseOrder.update({
                where: { id: po.id },
                data: {
                    status: allReceived
                        ? "RECEIVED"
                        : anyReceived
                            ? "PARTIALLY_RECEIVED"
                            : "CONFIRMED",
                },
            });

            return receiptNumber;
        });

        revalidatePath("/purchases");

        return {
            success: true,
            message: "Barang berhasil diterima.",
            receipt_number: result,
        };
    } catch (error: any) {
        console.error("Error receiving purchase:", error);

        return {
            success: false,
            message: error?.message || "Gagal menerima barang.",
        };
    }
}