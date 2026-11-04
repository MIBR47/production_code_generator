"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/src/generated/prisma/browser";
// import { PurchaseOrderSerialized, PurchaseOrderInput, PurchaseOrderActionResult, PurchaseOrderReceiptData, CreatePurchaseReceiptInput, PurchaseReceiptActionResult, PurchaseOrderAttachmentSerialized, PurchaseOrderAttachmentActionResult, } from "@/components/purchases/types";
import {
    PurchaseOrderSerialized, PurchaseOrderInput, PurchaseOrderActionResult,
    PurchaseOrderReceiptData, CreatePurchaseReceiptInput, PurchaseReceiptActionResult,
    PurchaseOrderAttachmentSerialized, PurchaseOrderAttachmentActionResult,
    CreatePurchasePaymentInput, PurchasePaymentData, PurchasePaymentActionResult,
} from "@/components/purchases/types";
import path from "path";
import { mkdir, unlink, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { canCancelPurchase, canConfirmPurchase, canEditPurchase, canReceivePurchase, } from "@/lib/purchases/status";
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
function serializePurchaseOrder(po: PurchaseOrderWithRelations): PurchaseOrderSerialized {
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
            default_purchase_qty: line.item.default_purchase_qty !== null
                ? Number(line.item.default_purchase_qty)
                : null,
        },
        uom: line.uom,
    }));
    const totalCents = items.reduce((sum, line) => sum + Math.round(line.subtotal * 100), 0);
    const paidCents = po.purchasePayments.reduce((sum, payment) => sum + Math.round(Number(payment.amount) * 100), 0);

    const paymentStatus = paidCents <= 0
        ? "UNPAID"
        : paidCents >= totalCents
            ? "PAID"
            : "PARTIALLY_PAID";
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
        total_amount: totalCents / 100,
        payment_summary: {
            total_amount: totalCents / 100,
            paid_amount: paidCents / 100,
            remaining_amount: Math.max(0, totalCents - paidCents) / 100,
            status: paymentStatus,
        },
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
    purchasePayments: {
        select: { amount: true },
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

export async function getPurchaseOrderById(id: number): Promise<PurchaseOrderSerialized | null> {
    if (!Number.isInteger(id) || id <= 0) return null;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: poInclude,
    });

    return purchaseOrder ? serializePurchaseOrder(purchaseOrder) : null;
}

// ======================================================
// CREATE PURCHASE ORDER
// ======================================================
export async function createPurchaseOrderAction(payload: PurchaseOrderInput): Promise<PurchaseOrderActionResult> {
    try {
        if (!payload.supplier_id)
            return { success: false, message: "Supplier wajib dipilih." };
        if (!payload.order_date)
            return { success: false, message: "Tanggal PO wajib diisi." };
        if (!payload.items.length)
            return { success: false, message: "PO minimal memiliki 1 item." };
        for (const line of payload.items) {
            if (!line.item_id)
                return { success: false, message: "Item wajib dipilih." };
            if (line.quantity <= 0)
                return { success: false, message: "Quantity harus lebih dari 0." };
            if (line.unit_price < 0)
                return { success: false, message: "Harga item tidak valid." };
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
    }
    catch (error: any) {
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
export async function updatePurchaseOrderAction(id: number, payload: PurchaseOrderInput): Promise<PurchaseOrderActionResult> {
    try {
        const existing = await prisma.purchaseOrder.findUnique({
            where: { id },
        });
        if (!existing)
            return { success: false, message: "Purchase Order tidak ditemukan." };
        if (!canEditPurchase(existing.status)) {
            return {
                success: false,
                message: "Hanya Purchase Order DRAFT yang dapat diedit.",
            };
        }
        if (!payload.supplier_id)
            return { success: false, message: "Supplier wajib dipilih." };
        if (!payload.order_date)
            return { success: false, message: "Tanggal PO wajib diisi." };
        if (!payload.items.length)
            return { success: false, message: "PO minimal memiliki 1 item." };
        for (const line of payload.items) {
            if (!line.item_id)
                return { success: false, message: "Item wajib dipilih." };
            if (line.quantity <= 0)
                return { success: false, message: "Quantity harus lebih dari 0." };
            if (line.unit_price < 0)
                return { success: false, message: "Harga item tidak valid." };
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
    }
    catch (error: any) {
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
export async function confirmPurchaseOrderAction(id: number): Promise<PurchaseOrderActionResult> {
    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
        });
        if (!po) {
            return {
                success: false,
                message: "Purchase Order tidak ditemukan.",
            };
        }
        if (!canConfirmPurchase(po.status)) {
            return {
                success: false,
                message: "Hanya Purchase Order DRAFT yang dapat dikonfirmasi.",
            };
        }
        await prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: "CONFIRMED",
            },
        });
        revalidatePath("/purchases");
        return {
            success: true,
            message: "Purchase Order berhasil dikonfirmasi.",
        };
    }
    catch (error: any) {
        console.error("Error confirming purchase order:", error);
        return {
            success: false,
            message: error?.message ||
                "Gagal mengkonfirmasi Purchase Order.",
        };
    }
}
// ======================================================
// CANCEL PURCHASE ORDER
// ======================================================
export async function cancelPurchaseOrderAction(id: number): Promise<PurchaseOrderActionResult> {
    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: { purchasePayments: { select: { id: true } } },
        });


        if (!po) {
            return {
                success: false,
                message: "Purchase Order tidak ditemukan.",
            };
        }
        if (!canCancelPurchase(po.status)) {
            return {
                success: false,
                message: "Purchase Order dengan status ini tidak dapat dibatalkan.",
            };
        }

        if (po.purchasePayments.length > 0) {
            return {
                success: false,
                message: "Purchase Order yang sudah memiliki pembayaran tidak dapat dibatalkan.",
            };
        }

        await prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: "CANCELLED",
            },
        });
        revalidatePath("/purchases");
        return {
            success: true,
            message: "Purchase Order berhasil dibatalkan.",
        };
    }
    catch (error: any) {
        console.error("Error cancelling purchase order:", error);
        return {
            success: false,
            message: error?.message ||
                "Gagal membatalkan Purchase Order.",
        };
    }
}
// ======================================================
// GET PO FOR RECEIPT
// ======================================================
export async function getPurchaseOrderForReceipt(id: number): Promise<PurchaseOrderReceiptData | null> {
    const po: ReceiptPurchaseOrder | null = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: receiptPoInclude,
    });
    if (!po)
        return null;
    return {
        id: po.id,
        po_number: po.po_number,
        supplier_name: po.supplier.name,
        status: po.status,
        items: po.items.map((poItem) => {
            const alreadyReceived = poItem.receipt_items.reduce((total, receipt) => total + Number(receipt.received_purchase_qty), 0);
            return {
                id: poItem.id,
                item_id: poItem.item_id,
                ordered_qty: Number(poItem.quantity),
                already_received_qty: alreadyReceived,
                remaining_qty: Math.max(0, Number(poItem.quantity) - alreadyReceived),
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
                    default_purchase_qty: poItem.item.default_purchase_qty !== null
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
                received_purchase_qty: Number(receiptItem.received_purchase_qty),
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
}
;
// ======================================================
// CREATE PURCHASE RECEIPT
// ======================================================
export async function createPurchaseReceiptAction(payload: CreatePurchaseReceiptInput): Promise<PurchaseReceiptActionResult> {
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
            if (!po)
                throw new Error("Purchase Order tidak ditemukan.");
            if (!canReceivePurchase(po.status)) {
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
                incomingByPoItem.set(poItem.id, (incomingByPoItem.get(poItem.id) ?? 0) + line.received_purchase_qty);
            }
            // Jangan menerima lebih dari quantity PO.
            for (const poItem of po.items) {
                const alreadyReceived = poItem.receipt_items.reduce((total, receipt) => total + Number(receipt.received_purchase_qty), 0);
                const incoming = incomingByPoItem.get(poItem.id) ?? 0;
                const remaining = Number(poItem.quantity) - alreadyReceived;
                if (incoming > remaining + 0.0001) {
                    throw new Error(`${poItem.item.name} melebihi sisa PO. Sisa: ${remaining} ${poItem.uom.symbol ?? poItem.uom.name}`);
                }
            }
            // Cek duplicate Lot Number manual dalam request.
            const lotNumbers = payload.items
                .map((line) => line.lot_number?.trim())
                .filter((lot): lot is string => !!lot);
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
            const receiptNumber = `GR/${year}/${month}/${String(receipt.id).padStart(5, "0")}`;
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
                    const lotNumber = line.lot_number?.trim() ||
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
                const received = poItem.receipt_items.reduce((total, receipt) => total + Number(receipt.received_purchase_qty), 0);
                return received >= Number(poItem.quantity);
            });
            const anyReceived = updatedItems.some((poItem) => poItem.receipt_items.some((receipt) => Number(receipt.received_purchase_qty) > 0));
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
    }
    catch (error: any) {
        console.error("Error receiving purchase:", error);
        return {
            success: false,
            message: error?.message || "Gagal menerima barang.",
        };
    }
}
// ======================================================
// GET PURCHASE ORDER ATTACHMENTS
// ======================================================
export async function getPurchaseOrderAttachments(purchaseOrderId: number): Promise<PurchaseOrderAttachmentSerialized[]> {
    const attachments = await prisma.purchaseOrderAttachment.findMany({
        where: { purchase_order_id: purchaseOrderId },
        orderBy: { created_at: "desc" },
    });
    return attachments.map((attachment) => ({
        id: attachment.id,
        purchase_order_id: attachment.purchase_order_id,
        file_name: attachment.file_name,
        file_path: attachment.file_path,
        file_type: attachment.file_type,
        remarks: attachment.remarks,
        created_at: attachment.created_at.toISOString(),
    }));
}
// ======================================================
// UPLOAD PURCHASE ORDER ATTACHMENT
// ======================================================
export async function uploadPurchaseOrderAttachmentAction(formData: FormData): Promise<PurchaseOrderAttachmentActionResult> {
    try {
        const purchaseOrderId = Number(formData.get("purchase_order_id"));
        const remarks = String(formData.get("remarks") ?? "").trim() || null;
        if (!purchaseOrderId) {
            return {
                success: false,
                message: "Purchase Order tidak valid.",
            };
        }
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id: purchaseOrderId },
            select: {
                id: true,
                po_number: true,
            },
        });
        if (!purchaseOrder) {
            return {
                success: false,
                message: "Purchase Order tidak ditemukan.",
            };
        }
        const files = formData
            .getAll("files")
            .filter((value): value is File => value instanceof File && value.size > 0);
        if (!files.length) {
            return {
                success: false,
                message: "Pilih minimal satu file.",
            };
        }
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ];
        const maxFileSize = 10 * 1024 * 1024;
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return {
                    success: false,
                    message: `${file.name}: format file tidak didukung.`,
                };
            }
            if (file.size > maxFileSize) {
                return {
                    success: false,
                    message: `${file.name}: ukuran maksimal 10 MB.`,
                };
            }
        }
        const relativeDirectory = `/uploads/purchases/po-${purchaseOrderId}/attachments`;
        const uploadDirectory = path.join(process.cwd(), "public", relativeDirectory);
        await mkdir(uploadDirectory, {
            recursive: true,
        });
        for (const file of files) {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const storedName = `${Date.now()}-${randomUUID()}-${safeName}`;
            const absolutePath = path.join(uploadDirectory, storedName);
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(absolutePath, buffer);
            await prisma.purchaseOrderAttachment.create({
                data: {
                    purchase_order_id: purchaseOrderId,
                    file_name: file.name,
                    file_path: `${relativeDirectory}/${storedName}`,
                    file_type: file.type,
                    remarks,
                },
            });
        }
        revalidatePath("/purchases");
        return {
            success: true,
            message: "Attachment berhasil diunggah.",
        };
    }
    catch (error: any) {
        console.error("Error uploading Purchase Order attachment:", error);
        return {
            success: false,
            message: error?.message ||
                "Gagal mengunggah attachment.",
        };
    }
}
// ======================================================
// DELETE PURCHASE ORDER ATTACHMENT
// ======================================================
export async function deletePurchaseOrderAttachmentAction(attachmentId: number): Promise<PurchaseOrderAttachmentActionResult> {
    try {
        if (!attachmentId) {
            return {
                success: false,
                message: "Attachment tidak valid.",
            };
        }
        const attachment = await prisma.purchaseOrderAttachment.findUnique({
            where: { id: attachmentId },
        });
        if (!attachment) {
            return {
                success: false,
                message: "Attachment tidak ditemukan.",
            };
        }
        // Lokasi file di dalam folder public
        const relativePath = attachment.file_path.replace(/^[/\\]+/, "");
        const filePath = path.join(process.cwd(), "public", relativePath);
        // Proteksi supaya hanya file Purchase yang boleh dihapus
        const purchaseUploadDirectory = path.join(process.cwd(), "public", "uploads", "purchases");
        if (!filePath.startsWith(purchaseUploadDirectory + path.sep)) {
            return {
                success: false,
                message: "Lokasi attachment tidak valid.",
            };
        }
        // Hapus file fisik
        try {
            await unlink(filePath);
        }
        catch (error: any) {
            // Kalau file sudah tidak ada, tetap lanjut hapus database
            if (error?.code !== "ENOENT") {
                throw error;
            }
        }
        // Hapus record database
        await prisma.purchaseOrderAttachment.delete({
            where: { id: attachmentId },
        });
        revalidatePath("/purchases");
        return {
            success: true,
            message: "Attachment berhasil dihapus.",
        };
    }
    catch (error: any) {
        console.error("Error deleting Purchase Order attachment:", error);
        return {
            success: false,
            message: error?.message ||
                "Gagal menghapus attachment.",
        };
    }
}


// ======================================================
// GET PURCHASE PAYMENT DATA
// ======================================================

export async function getPurchasePaymentData(purchaseOrderId: number): Promise<PurchasePaymentData | null> {
    if (!Number.isInteger(purchaseOrderId) || purchaseOrderId <= 0) return null;

    const po = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        select: {
            items: { select: { subtotal: true } },
            purchasePayments: {
                include: { attachments: true },
                orderBy: [{ payment_date: "desc" }, { id: "desc" }],
            },
        },
    });

    if (!po) return null;

    const totalCents = po.items.reduce((sum, item) => sum + Math.round(Number(item.subtotal) * 100), 0);
    const paidCents = po.purchasePayments.reduce((sum, payment) => sum + Math.round(Number(payment.amount) * 100), 0);

    const status = paidCents <= 0
        ? "UNPAID"
        : paidCents >= totalCents
            ? "PAID"
            : "PARTIALLY_PAID";

    return {
        summary: {
            total_amount: totalCents / 100,
            paid_amount: paidCents / 100,
            remaining_amount: Math.max(0, totalCents - paidCents) / 100,
            status,
        },
        payments: po.purchasePayments.map((payment) => ({
            id: payment.id,
            purchase_order_id: payment.purchase_order_id,
            payment_number: payment.payment_number,
            payment_date: payment.payment_date.toISOString(),
            amount: Number(payment.amount),
            payment_method: payment.payment_method,
            reference_number: payment.reference_number,
            remarks: payment.remarks,
            created_at: payment.created_at.toISOString(),
            attachments: payment.attachments.map((attachment) => ({
                id: attachment.id,
                purchase_payment_id: attachment.purchase_payment_id,
                file_name: attachment.file_name,
                file_path: attachment.file_path,
                file_type: attachment.file_type,
                remarks: attachment.remarks,
                created_at: attachment.created_at.toISOString(),
            })),
        })),
    };
}

// ======================================================
// CREATE PURCHASE PAYMENT
// ======================================================

export async function createPurchasePaymentAction(payload: CreatePurchasePaymentInput): Promise<PurchasePaymentActionResult> {
    try {
        const purchaseOrderId = Number(payload.purchase_order_id);
        if (!Number.isInteger(purchaseOrderId) || purchaseOrderId <= 0) {
            return { success: false, message: "Purchase Order tidak valid." };
        }

        const paymentDate = new Date(payload.payment_date);
        if (!payload.payment_date || Number.isNaN(paymentDate.getTime())) {
            return { success: false, message: "Tanggal pembayaran tidak valid." };
        }

        const amount = Number(payload.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return { success: false, message: "Nominal pembayaran harus lebih dari 0." };
        }

        const amountCents = Math.round(amount * 100);
        if (Math.abs(amount * 100 - amountCents) > 0.00001) {
            return { success: false, message: "Nominal pembayaran maksimal 2 angka desimal." };
        }

        const paymentNumber = await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findUnique({
                where: { id: purchaseOrderId },
                select: {
                    id: true,
                    status: true,
                    items: { select: { subtotal: true } },
                    purchasePayments: { select: { amount: true } },
                },
            });

            if (!po) throw new Error("Purchase Order tidak ditemukan.");

            const canPay = po.status === "CONFIRMED" ||
                po.status === "PARTIALLY_RECEIVED" ||
                po.status === "RECEIVED";

            if (!canPay) {
                throw new Error("Purchase Order dengan status ini belum dapat menerima pembayaran.");
            }

            const totalCents = po.items.reduce((sum, item) => sum + Math.round(Number(item.subtotal) * 100), 0);
            const paidCents = po.purchasePayments.reduce((sum, payment) => sum + Math.round(Number(payment.amount) * 100), 0);
            const remainingCents = totalCents - paidCents;

            if (remainingCents <= 0) throw new Error("Purchase Order sudah lunas.");
            if (amountCents > remainingCents) {
                throw new Error(`Pembayaran melebihi sisa tagihan. Sisa: Rp ${new Intl.NumberFormat("id-ID").format(remainingCents / 100)}`);
            }

            const created = await tx.purchasePayment.create({
                data: {
                    purchase_order_id: po.id,
                    payment_number: `TEMP-${randomUUID()}`,
                    payment_date: paymentDate,
                    amount: (amountCents / 100).toFixed(2),
                    payment_method: payload.payment_method?.trim() || null,
                    reference_number: payload.reference_number?.trim() || null,
                    remarks: payload.remarks?.trim() || null,
                },
            });

            const year = paymentDate.getFullYear();
            const month = String(paymentDate.getMonth() + 1).padStart(2, "0");
            const number = `PAY/${year}/${month}/${String(created.id).padStart(5, "0")}`;

            await tx.purchasePayment.update({
                where: { id: created.id },
                data: { payment_number: number },
            });

            return number;
        }, { isolationLevel: "Serializable" });

        revalidatePath("/purchases");

        return { success: true, message: "Pembayaran berhasil dicatat.", payment_number: paymentNumber };
    } catch (error: any) {
        console.error("Error creating purchase payment:", error);
        const message = error?.code === "P2034"
            ? "Ada pembayaran lain yang sedang diproses. Muat ulang data lalu coba kembali."
            : error?.message || "Gagal mencatat pembayaran.";

        return { success: false, message };
    }
}