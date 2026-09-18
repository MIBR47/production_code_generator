"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// CREATE CUSTOMER
export async function createCustomer(
    prevState: { success: boolean; message: string },
    formData: FormData
) {
    try {
        const name = formData.get("name") as string;

        if (!name || name.trim() === "") {
            return {
                success: false,
                message: "Nama customer wajib diisi.",
            };
        }

        await prisma.customer.create({
            data: {
                name: name.trim(),
            },
        });

        revalidatePath("/customers");
        return {
            success: true,
            message: "Customer berhasil ditambahkan.",
        };
    } catch (error) {
        console.error("Error creating customer:", error);
        return {
            success: false,
            message: "Gagal menambahkan customer.",
        };
    }
}

// UPDATE CUSTOMER
export async function updateCustomer(formData: FormData) {
    try {
        const id = Number(formData.get("id"));
        const name = formData.get("name") as string;

        if (!id || !name || name.trim() === "") {
            return {
                success: false,
                message: "Data customer tidak valid.",
            };
        }

        await prisma.customer.update({
            where: { id },
            data: { name: name.trim() },
        });

        revalidatePath("/customers");
        return {
            success: true,
            message: "Data customer berhasil diperbarui.",
        };
    } catch (error) {
        console.error("Error updating customer:", error);
        return {
            success: false,
            message: "Gagal memperbarui data customer.",
        };
    }
}

// DELETE CUSTOMER
export async function deleteCustomer(id: number) {
    try {
        await prisma.customer.delete({
            where: { id },
        });

        revalidatePath("/customers");
        return {
            success: true,
            message: "Customer berhasil dihapus.",
        };
    } catch (error) {
        console.error("Error deleting customer:", error);
        return {
            success: false,
            message: "Gagal menghapus customer.",
        };
    }
}