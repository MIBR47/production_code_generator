"use server";

import { SupplierSerialized, CreateSupplierInput, SupplierActionResult, UpdateSupplierInput } from "@/components/suppliers/types";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { SupplierSerialized, CreateSupplierInput, SupplierActionResult, UpdateSupplierInput } from "@/components/suppliers/type";
// import {
//     CreateSupplierInput,
//     SupplierActionResult,
//     SupplierSerialized,
//     UpdateSupplierInput,
// } from "@/components/suppliers/types";

function serializeSupplier(supplier: any): SupplierSerialized {
    return {
        id: supplier.id,
        name: supplier.name,
        address: supplier.address,
        contact: supplier.contact,
        is_active: supplier.is_active,
        created_at: supplier.created_at,
        updated_at: supplier.updated_at,
    };
}

// ======================================================
// GET SUPPLIERS
// ======================================================

export async function getSuppliers(): Promise<SupplierSerialized[]> {
    const suppliers = await prisma.supplier.findMany({
        where: { is_active: true },
        orderBy: { name: "asc" },
    });

    return suppliers.map(serializeSupplier);
}

// ======================================================
// CREATE SUPPLIER
// ======================================================

export async function createSupplierAction(
    payload: CreateSupplierInput
): Promise<SupplierActionResult> {
    try {
        const name = payload.name.trim();

        if (!name) {
            return { success: false, message: "Nama supplier wajib diisi." };
        }

        const existing = await prisma.supplier.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });

        if (existing) {
            return { success: false, message: "Supplier dengan nama tersebut sudah tersedia." };
        }

        const supplier = await prisma.supplier.create({
            data: {
                name,
                address: payload.address?.trim() || null,
                contact: payload.contact?.trim() || null,
                is_active: true,
            },
        });

        revalidatePath("/suppliers");

        return {
            success: true,
            message: "Supplier berhasil ditambahkan.",
            supplier: serializeSupplier(supplier),
        };
    } catch (error: any) {
        console.error("Error creating supplier:", error);

        return {
            success: false,
            message: error?.message || "Gagal menambahkan supplier.",
        };
    }
}

// ======================================================
// UPDATE SUPPLIER
// ======================================================

export async function updateSupplierAction(
    payload: UpdateSupplierInput
): Promise<SupplierActionResult> {
    try {
        const name = payload.name.trim();

        if (!payload.id) {
            return { success: false, message: "Supplier tidak valid." };
        }

        if (!name) {
            return { success: false, message: "Nama supplier wajib diisi." };
        }

        const existing = await prisma.supplier.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
                NOT: {
                    id: payload.id,
                },
            },
        });

        if (existing) {
            return { success: false, message: "Nama supplier sudah digunakan." };
        }

        const supplier = await prisma.supplier.update({
            where: { id: payload.id },
            data: {
                name,
                address: payload.address?.trim() || null,
                contact: payload.contact?.trim() || null,
            },
        });

        revalidatePath("/suppliers");

        return {
            success: true,
            message: "Supplier berhasil diperbarui.",
            supplier: serializeSupplier(supplier),
        };
    } catch (error: any) {
        console.error("Error updating supplier:", error);

        return {
            success: false,
            message: error?.message || "Gagal memperbarui supplier.",
        };
    }
}

// ======================================================
// DEACTIVATE SUPPLIER
// ======================================================

export async function deactivateSupplierAction(
    id: number
): Promise<SupplierActionResult> {
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id },
        });

        if (!supplier) {
            return { success: false, message: "Supplier tidak ditemukan." };
        }

        if (!supplier.is_active) {
            return { success: false, message: "Supplier sudah tidak aktif." };
        }

        await prisma.supplier.update({
            where: { id },
            data: { is_active: false },
        });

        revalidatePath("/suppliers");

        return {
            success: true,
            message: "Supplier berhasil dinonaktifkan.",
        };
    } catch (error: any) {
        console.error("Error deactivating supplier:", error);

        return {
            success: false,
            message: error?.message || "Gagal menonaktifkan supplier.",
        };
    }
}