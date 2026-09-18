"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(
    prevState: { success: boolean; message: string },
    formData: FormData
) {
    try {
        const product_name = formData.get("product_name") as string;
        const product_type = formData.get("product_type") as string;

        if (!product_name || !product_type) {
            return { success: false, message: "Semua field wajib diisi." };
        }

        await prisma.product.create({
            data: { product_name, product_type },
        });

        revalidatePath("/products");
        return { success: true, message: "Produk berhasil ditambahkan." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal menambahkan produk." };
    }
}

export async function createProductCode(
    prevState: { success: boolean; message: string },
    formData: FormData
) {
    try {
        const product_id = Number(formData.get("product_id"));
        const product_code = formData.get("product_code") as string;

        if (!product_code || !product_id) {
            return { success: false, message: "Semua field wajib diisi." };
        }

        await prisma.product_code.create({
            data: { product_id, product_code },
        });

        revalidatePath("/products");
        return { success: true, message: "Kode produk berhasil ditambahkan." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Gagal menambahkan kode produk." };
    }
}

// UPDATE PRODUK & KODE PRODUK
export async function updateProduct(formData: FormData) {
    try {
        const productId = Number(formData.get("product_id"));
        const codeId = formData.get("code_id") ? Number(formData.get("code_id")) : null;
        const product_name = formData.get("product_name") as string;
        const product_type = formData.get("product_type") as string;
        const product_code = formData.get("product_code") as string;

        if (!productId || !product_name || !product_type) {
            return { success: false, message: "Data produk tidak lengkap." };
        }

        // Update Data Produk utama
        await prisma.product.update({
            where: { id: productId },
            data: { product_name, product_type },
        });

        // Update Kode Produk jika spesifik dipilih
        if (codeId && product_code) {
            await prisma.product_code.update({
                where: { id: codeId },
                data: { product_code },
            });
        }

        revalidatePath("/products");
        return { success: true, message: "Produk berhasil diperbarui!" };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, message: "Gagal memperbarui produk." };
    }
}

// DELETE PRODUK / KODE PRODUK
export async function deleteProductItem(productId: number, codeId?: number | null) {
    try {
        // Jika ada codeId, hapus kode produk spesifik saja
        if (codeId) {
            await prisma.product_code.delete({
                where: { id: codeId },
            });
        } else {
            // Jika tidak ada codeId, hapus seluruh produk berserta dependensinya
            await prisma.product_code.deleteMany({
                where: { product_id: productId },
            });

            await prisma.product.delete({
                where: { id: productId },
            });
        }

        revalidatePath("/products");
        return { success: true, message: "Data berhasil dihapus." };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: "Gagal menghapus data." };
    }
}