"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import {
    CreateItemInput,
    ItemActionResult,
    ItemGroupSerialized,
    ItemSerialized,
    UnitOfMeasureSerialized,
} from "@/components/items/types";


// ======================================================
// HELPER SERIALIZE ITEM
// ======================================================
//
// Prisma Decimal jangan langsung dikirim ke Client Component.
// Ubah menjadi number terlebih dahulu.
//
function serializeItem(item: any): ItemSerialized {
    return {
        id: item.id,

        name: item.name,
        reference: item.reference,

        group_id: item.group_id,

        category: item.category,
        item_type: item.item_type,

        uom_id: item.uom_id,
        purchase_uom_id: item.purchase_uom_id,

        default_purchase_qty:
            item.default_purchase_qty !== null
                ? Number(item.default_purchase_qty)
                : null,

        cost: Number(item.cost),

        tracking: item.tracking,

        is_active: item.is_active,

        created_at: item.created_at,
        updated_at: item.updated_at,

        group: {
            id: item.group.id,
            name: item.group.name,
            code_prefix: item.group.code_prefix,
            last_number: item.group.last_number,
        },

        uom: {
            id: item.uom.id,
            name: item.uom.name,
            symbol: item.uom.symbol,
        },

        purchase_uom: item.purchase_uom
            ? {
                id: item.purchase_uom.id,
                name: item.purchase_uom.name,
                symbol: item.purchase_uom.symbol,
            }
            : null,
    };
}


// ======================================================
// GET ALL ITEMS
// ======================================================

export async function getItems(): Promise<ItemSerialized[]> {
    const items = await prisma.item.findMany({
        where: {
            is_active: true,
        },

        include: {
            group: true,
            uom: true,
            purchase_uom: true,
        },

        orderBy: {
            reference: "asc",
        },
    });

    return items.map(serializeItem);
}


// ======================================================
// GET ITEM GROUPS
// ======================================================

export async function getItemGroups(): Promise<ItemGroupSerialized[]> {
    const groups = await prisma.itemGroup.findMany({
        where: {
            is_active: true,
        },

        orderBy: {
            name: "asc",
        },
    });

    return groups.map((group) => ({
        id: group.id,
        name: group.name,
        code_prefix: group.code_prefix,
        last_number: group.last_number,
    }));
}


// ======================================================
// GET UOM
// ======================================================

export async function getUnitOfMeasures(): Promise<UnitOfMeasureSerialized[]> {
    const uoms = await prisma.unitOfMeasure.findMany({
        where: {
            is_active: true,
        },

        orderBy: {
            name: "asc",
        },
    });

    return uoms.map((uom) => ({
        id: uom.id,
        name: uom.name,
        symbol: uom.symbol,
    }));
}


// ======================================================
// CREATE ITEM
// ======================================================

export async function createItemAction(
    payload: CreateItemInput
): Promise<ItemActionResult> {
    try {

        // ==================================================
        // VALIDATION
        // ==================================================

        if (!payload.name.trim()) {
            return {
                success: false,
                message: "Nama item wajib diisi.",
            };
        }

        if (!payload.group_id) {
            return {
                success: false,
                message: "Item Group wajib dipilih.",
            };
        }

        if (!payload.uom_id) {
            return {
                success: false,
                message: "Unit of Measure wajib dipilih.",
            };
        }


        // SERVICE otomatis menggunakan konfigurasi service.
        const isService =
            payload.category === "SERVICE";


        // ==================================================
        // TRANSACTION
        // ==================================================

        const createdItem = await prisma.$transaction(
            async (tx) => {

                // ------------------------------------------
                // GENERATE REFERENCE
                // ------------------------------------------
                //
                // Contoh database:
                //
                // Vinyl Cherokee
                // code_prefix = VCH
                // last_number = 3
                //
                // Update:
                // last_number = 4
                //
                // Result:
                // VCH0004
                //

                const group = await tx.itemGroup.update({
                    where: {
                        id: payload.group_id,
                    },

                    data: {
                        last_number: {
                            increment: 1,
                        },
                    },

                    select: {
                        id: true,
                        code_prefix: true,
                        last_number: true,
                    },
                });


                const reference =
                    `${group.code_prefix}${String(group.last_number).padStart(4, "0")}`;


                // ------------------------------------------
                // CREATE ITEM
                // ------------------------------------------

                return await tx.item.create({
                    data: {
                        name: payload.name.trim(),

                        reference,

                        group_id: payload.group_id,

                        category: payload.category,

                        item_type:
                            isService
                                ? "SERVICE"
                                : payload.item_type,

                        uom_id: payload.uom_id,

                        purchase_uom_id:
                            isService
                                ? null
                                : payload.purchase_uom_id ?? payload.uom_id,

                        default_purchase_qty:
                            isService
                                ? null
                                : payload.default_purchase_qty,

                        cost:
                            payload.cost || 0,

                        tracking:
                            isService
                                ? "NONE"
                                : payload.tracking,

                        is_active: true,
                    },

                    include: {
                        group: true,
                        uom: true,
                        purchase_uom: true,
                    },
                });
            }
        );


        // Refresh halaman /items.
        revalidatePath("/items");


        return {
            success: true,
            message: "Item berhasil disimpan.",
            item: serializeItem(createdItem),
        };

    } catch (error: any) {

        console.error(
            "Error creating item:",
            error
        );

        return {
            success: false,
            message:
                error?.message ||
                "Gagal menyimpan item.",
        };
    }
}