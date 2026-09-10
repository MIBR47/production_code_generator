"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSaleAction(prevState: any, formData: FormData) {
    try {
        const rawItems = formData.get("items") as string;
        const items = JSON.parse(rawItems || "[]");

        const customer_id = Number(formData.get("customer_id"));
        const spk_type = formData.get("spk_type") as string;
        const sales_person = formData.get("sales_person") as string;
        const ecatalog = formData.get("ecatalog") as string;
        const remarks = formData.get("remarks") as string;

        // Ambil field tanggal baru dari FormData
        const rawSpkDate = formData.get("spk_date") as string;
        const rawExpectedDate = formData.get("expected_date") as string;

        if (!customer_id || items.length === 0 || !rawSpkDate) {
            return { success: false, message: "Data tidak lengkap (Customer, Item, atau Tanggal SPK wajib diisi)." };
        }

        // Format string tanggal menjadi objek Date
        const spkDateObj = new Date(rawSpkDate);
        const expectedDateObj = rawExpectedDate ? new Date(rawExpectedDate) : null;

        // Ambil data pajak dari DB untuk kalkulasi tax_price yang akurat
        const taxIds = items
            .map((i: any) => Number(i.tax_id))
            .filter((id: number) => !isNaN(id) && id > 0);

        const taxRecords = await prisma.tax.findMany({
            where: { id: { in: taxIds } },
        });

        const taxMap = new Map<number, number>();
        taxRecords.forEach((t) => {
            const rateNum = Number(t.rate);
            taxMap.set(t.id, rateNum > 1 ? rateNum / 100 : rateNum);
        });

        // 1. Hitung nilai item & grand total
        let saleGrandTotal = 0;

        const preparedSaleItems = items.map((i: any) => {
            const productId = Number(i.product_id);
            const taxId = i.tax_id ? Number(i.tax_id) : null;
            const quantity = Number(i.quantity) || 0;
            const unitPrice = Number(i.unit_price) || 0;

            const subtotal = quantity * unitPrice;
            const taxRate = taxId ? taxMap.get(taxId) || 0 : 0;
            const taxPrice = subtotal * taxRate;
            const itemTotal = subtotal + taxPrice;

            saleGrandTotal += itemTotal;

            return {
                product_id: productId,
                tax_id: taxId,
                quantity: quantity,
                unit_price: unitPrice,
                subtotal: subtotal,
                tax_price: taxPrice,
            };
        });

        // 2. Jalankan Prisma Transaction
        await prisma.$transaction(async (tx) => {
            // A. Update / buat harga produk terbaru jika berubah
            for (const item of items) {
                const productId = Number(item.product_id);
                const inputPrice = Number(item.unit_price);

                if (productId) {
                    const latestPriceRecord = await tx.product_price.findFirst({
                        where: { product_id: productId },
                        orderBy: { id: "desc" },
                    });

                    if (!latestPriceRecord || Number(latestPriceRecord.price) !== inputPrice) {
                        await tx.product_price.create({
                            data: {
                                product_id: productId,
                                price: inputPrice,
                            },
                        });
                    }
                }
            }

            // B. Generate Nomor SPK & PO Otomatis berdasarkan spk_date
            const year = spkDateObj.getFullYear();
            const month = String(spkDateObj.getMonth() + 1).padStart(2, "0");

            // 1. Hitung urutan SPK berdasarkan spk_type (E-Catalog vs Reguler)
            const prefixSpk = spk_type === "E-Catalog" ? "E-SPK" : "R-SPK";
            const spkTypeCount = await tx.sale.count({
                where: { spk_type: spk_type },
            });
            const spkSeq = String(spkTypeCount + 1).padStart(4, "0");
            const generatedNoSpk = `${prefixSpk}/${year}/${month}/${spkSeq}`;

            // 2. Hitung urutan PO berdasarkan TOTAL SELURUH SALES (tanpa pandang spk_type)
            const totalSalesCount = await tx.sale.count();
            const poSeq = String(totalSalesCount + 1).padStart(4, "0");
            const generatedNoPo = `PO/${year}/${month}/${poSeq}`;

            // C. Simpan data Sale beserta Sale_items
            const newSale = await tx.sale.create({
                data: {
                    no_spk: generatedNoSpk,
                    no_po: generatedNoPo,
                    spk_date: spkDateObj,
                    expected_date: expectedDateObj, // Kolom DB (sesuaikan nama field dengan schema Prisma)
                    spk_type,
                    customer_id,
                    sales_person,
                    ecatalog,
                    remarks,
                    total_amount: saleGrandTotal,
                    status: "On Progress",
                    sale_items: {
                        create: preparedSaleItems,
                    },
                },
            });

            return newSale;
        });

        revalidatePath("/sales");

        return { success: true, message: "SPK berhasil disimpan." };
    } catch (error: any) {
        console.error("Error creating sale:", error);
        return {
            success: false,
            message: error?.message || "Gagal menyimpan SPK.",
        };
    }
}