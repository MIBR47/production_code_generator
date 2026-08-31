"use server";

import { prisma } from "@/lib/prisma"; // sesuaikan path Prisma client kamu
import { revalidatePath } from "next/cache";


export async function createUnitProduct(prevState: any, formData: FormData) {
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
        const recipient = formData.get("recipient") as string;
        const productionCode = formData.get("production_code") as string;

        // Gantilah user_id berikut dengan session user aktual kamu
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
                Item_code_recipient: recipient || null, // Dipetakan ke nama kolom Prisma
                status: "Tersimpan",
            },
        });

        revalidatePath("/production-units"); // Revalidate halaman agar data ter-update
        return { success: true, message: "Berhasil menyimpan data!" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal menyimpan data." };
    }
}

export async function updateUnitProduct(prevState: any, formData: FormData) {
    try {
        const id = formData.get("id");
        const batch = formData.get("batch") as string;
        const productionCode = formData.get("production_code") as string;
        const spk = formData.get("spk") as string;
        const remarks = formData.get("remarks") as string;
        const outDate = formData.get("out_date") as string;
        const recipient = formData.get("recipient") as string;

        if (!id) {
            return { success: false, message: "ID data tidak ditemukan." };
        }

        // Jalankan query update Prisma
        await prisma.production_code.update({
            where: { id: Number(id) },
            data: {
                batch: batch || null,
                production_code: productionCode,
                spk: spk || null,
                remarks: remarks || null,
                out_code_date: outDate ? new Date(outDate) : null,
                Item_code_recipient: recipient || null,
            },
        });

        revalidatePath("/production-units");
        return { success: true, message: "Data berhasil diperbarui!" };
    } catch (error) {
        console.error("Error updating unit product:", error);
        return { success: false, message: "Gagal memperbarui data." };
    }
}

// ---------------- DELETE / HAPUS ----------------
export async function deleteUnitProduct(id: number | string) {
    try {
        if (!id) {
            return { success: false, message: "ID data tidak valid." };
        }

        // Jalankan query delete Prisma
        await prisma.production_code.delete({
            where: { id: Number(id) },
        });

        revalidatePath("/production-units");
        return { success: true, message: "Data berhasil dihapus!" };
    } catch (error) {
        console.error("Error deleting unit product:", error);
        return { success: false, message: "Gagal menghapus data di database." };
    }
}