"use server";

import { prisma } from "@/lib/prisma";
import {
    InventoryStockSerialized,
    StockMovementSerialized,
} from "@/components/inventory/types";

// ======================================================
// CURRENT STOCK
// ======================================================

export async function getInventoryStock(): Promise<InventoryStockSerialized[]> {
    const [items, stockData] = await Promise.all([
        prisma.item.findMany({
            where: {
                is_active: true,
                item_type: {
                    not: "SERVICE",
                },
            },
            include: {
                group: true,
                uom: true,
            },
            orderBy: {
                reference: "asc",
            },
        }),

        prisma.stockMovement.groupBy({
            by: ["item_id"],
            _sum: {
                quantity: true,
            },
        }),
    ]);

    const stockMap = new Map(
        stockData.map((stock) => [
            stock.item_id,
            Number(stock._sum.quantity ?? 0),
        ])
    );

    return items.map((item) => ({
        item_id: item.id,
        reference: item.reference,
        name: item.name,
        category: item.category,
        item_type: item.item_type,
        tracking: item.tracking,
        stock: stockMap.get(item.id) ?? 0,

        group: {
            id: item.group.id,
            name: item.group.name,
        },

        uom: {
            id: item.uom.id,
            name: item.uom.name,
            symbol: item.uom.symbol,
        },
    }));
}

// ======================================================
// STOCK MOVEMENTS
// ======================================================

export async function getStockMovements(): Promise<StockMovementSerialized[]> {
    const movements = await prisma.stockMovement.findMany({
        include: {
            item: {
                select: {
                    id: true,
                    reference: true,
                    name: true,
                },
            },
            lot: {
                select: {
                    id: true,
                    lot_number: true,
                },
            },
            uom: true,
        },
        orderBy: [
            { movement_date: "desc" },
            { id: "desc" },
        ],
    });

    return movements.map((movement) => ({
        id: movement.id,
        item_id: movement.item_id,
        lot_id: movement.lot_id,
        movement_type: movement.movement_type,
        quantity: Number(movement.quantity),
        reference: movement.reference,
        remarks: movement.remarks,
        movement_date: movement.movement_date.toISOString(),
        created_at: movement.created_at.toISOString(),
        item: movement.item,
        lot: movement.lot,
        uom: {
            id: movement.uom.id,
            name: movement.uom.name,
            symbol: movement.uom.symbol,
        },
    }));
}