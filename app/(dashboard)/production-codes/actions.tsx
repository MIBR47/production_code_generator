"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProductionCode(prevState: any, formData: FormData) {
    try {
        const productId = Number(formData.get("product_id"));
        const productCodeId = Number(formData.get("product_code_id"));
        const customerId = Number(formData.get("customer_id"));

        const rawProdNumber = Number(formData.get("production_number")) || 1;
        const productionNumberStr = String(rawProdNumber).padStart(4, "0");

        const batch = formData.get("batch") as string;
        const spk = formData.get("spk") as string;
        const remarks = formData.get("remarks") as string;
        const outDateStr = formData.get("out_date") as string;

        // Mengambil nilai item_code_recipient (fallback ke recipient jika form masih menggunakan key lama)
        const itemCodeRecipient = (formData.get("item_code_recipient") || formData.get("recipient")) as string;
        const productionCode = formData.get("production_code") as string;

        const statusString = (!outDateStr || outDateStr.trim() === "") && (!itemCodeRecipient || itemCodeRecipient.trim() === "")
            ? "In Progress"
            : "Done";

        // Gantilah user_id berikut dengan session user aktual
        const userId = 1;

        await prisma.production_code.create({
            data: {
                product_id: productId,
                product_code_id: productCodeId,
                customer_id: customerId,
                user_id: userId,
                batch: batch || null,
                production_number: productionNumberStr,
                production_code: productionCode,
                spk: spk || null,
                remarks: remarks || null,
                out_code_date: outDateStr ? new Date(outDateStr) : null,
                item_code_recipient: itemCodeRecipient || null,
                status: statusString,
            },
        });

        revalidatePath("/production-units");
        return { success: true, message: "Berhasil menyimpan data!" };
    } catch (error) {
        console.error("Error creating production code:", error);
        return { success: false, message: "Gagal menyimpan data." };
    }
}

export async function updateProductionCode(prevState: any, formData: FormData) {
    try {
        const id = formData.get("id");
        const batch = formData.get("batch") as string;
        const productionCode = formData.get("production_code") as string;
        const spk = formData.get("spk") as string;
        const remarks = formData.get("remarks") as string;
        const outDate = formData.get("out_date") as string;

        // Mengambil nilai item_code_recipient
        const itemCodeRecipient = (formData.get("item_code_recipient") || formData.get("recipient")) as string;

        const statusString = (!outDate || outDate.trim() === "") && (!itemCodeRecipient || itemCodeRecipient.trim() === "")
            ? "In Progress"
            : "Done";

        if (!id) {
            return { success: false, message: "ID data tidak ditemukan." };
        }

        await prisma.production_code.update({
            where: { id: Number(id) },
            data: {
                batch: batch || null,
                production_code: productionCode,
                spk: spk || null,
                remarks: remarks || null,
                out_code_date: outDate ? new Date(outDate) : null,
                item_code_recipient: itemCodeRecipient || null,
                status: statusString,
            },
        });

        revalidatePath("/production-units");
        return { success: true, message: "Data berhasil diperbarui!" };
    } catch (error) {
        console.error("Error updating production code:", error);
        return { success: false, message: "Gagal memperbarui data." };
    }
}

// ---------------- DELETE / HAPUS ----------------
export async function deleteProductionCode(id: number | string) {
    try {
        if (!id) {
            return { success: false, message: "ID data tidak valid." };
        }

        await prisma.production_code.delete({
            where: { id: Number(id) },
        });

        revalidatePath("/production-units");
        return { success: true, message: "Data berhasil dihapus!" };
    } catch (error) {
        console.error("Error deleting production code:", error);
        return { success: false, message: "Gagal menghapus data di database." };
    }
}