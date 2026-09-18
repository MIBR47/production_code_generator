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
        const shipping_cost = Number(formData.get("shipping_cost") || 0);
        const remarks = formData.get("remarks") as string;

        const rawSpkDate = formData.get("spk_date") as string;
        const rawExpectedDate = formData.get("expected_date") as string;

        if (!customer_id || items.length === 0 || !rawSpkDate) {
            return {
                success: false,
                message: "Data tidak lengkap (Customer, Item, atau Tanggal SPK wajib diisi)."
            };
        }

        const spkDateObj = new Date(rawSpkDate);
        const expectedDateObj = rawExpectedDate ? new Date(rawExpectedDate) : null;

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

        await prisma.$transaction(async (tx) => {
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

            const year = spkDateObj.getFullYear();
            const month = String(spkDateObj.getMonth() + 1).padStart(2, "0");

            const prefixSpk = spk_type === "E-Catalog" ? "E-SPK" : "R-SPK";
            const spkTypeCount = await tx.sale.count({
                where: { spk_type: spk_type },
            });
            const spkSeq = String(spkTypeCount + 1).padStart(4, "0");
            const generatedNoSpk = `${prefixSpk}/${year}/${month}/${spkSeq}`;

            const totalSalesCount = await tx.sale.count();
            const poSeq = String(totalSalesCount + 1).padStart(4, "0");
            const generatedNoPo = `PO/${year}/${month}/${poSeq}`;

            return await tx.sale.create({
                data: {
                    no_spk: generatedNoSpk,
                    no_po: generatedNoPo,
                    spk_date: spkDateObj,
                    expected_date: expectedDateObj,
                    spk_type,
                    customer_id,
                    sales_person,
                    ecatalog,
                    shipping_cost,
                    remarks,
                    total_amount: saleGrandTotal,
                    status: "On Progress",
                    sale_items: {
                        create: preparedSaleItems,
                    },
                },
            });
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

// 1. Update tingkat Sale (Tgl SPK, Sales Person, E-Catalog)
export async function updateSaleInlineAction(payload: {
    saleId: number;
    spk_date?: string;
    sales_person?: string;
    ecatalog?: string;
}) {
    try {
        const { saleId, spk_date, sales_person, ecatalog } = payload;

        await prisma.sale.update({
            where: { id: saleId },
            data: {
                ...(spk_date !== undefined && { spk_date: new Date(spk_date) }),
                ...(sales_person !== undefined && { sales_person }),
                ...(ecatalog !== undefined && { ecatalog }),
            },
        });

        revalidatePath("/sales");
        return { success: true, message: "Sale berhasil diperbarui." };
    } catch (error: any) {
        console.error("Error updating sale:", error);
        return { success: false, message: error?.message || "Gagal memperbarui Sale." };
    }
}

// 2. Update No PO BIS (Tingkat sale_additional)
export async function updatePoBisInlineAction(payload: {
    saleId: number;
    no_po_bis: string;
}) {
    try {
        const { saleId, no_po_bis } = payload;

        await prisma.sale_additional.upsert({
            where: { sale_id: saleId },
            update: { no_po_bis },
            create: {
                sale_id: saleId,
                no_po_bis,
            },
        });

        revalidatePath("/sales");
        return { success: true, message: "No PO BIS berhasil diperbarui." };
    } catch (error: any) {
        console.error("Error updating PO BIS:", error);
        return { success: false, message: error?.message || "Gagal memperbarui PO BIS." };
    }
}

// 3. Update Sale Item (QTY, Harga tanpa PPN / Unit Price, Discount) & Recalculate Totals
export async function updateSaleItemInlineAction(payload: {
    saleItemId: number;
    saleId: number;
    quantity?: number;
    unitPriceWithoutTax?: number; // Nilai ini langsung disimpan ke unit_price database
    discount?: number;
}) {
    try {
        const { saleItemId, saleId, quantity, unitPriceWithoutTax, discount } = payload;

        // Ambil data item saat ini
        const existingItem = await prisma.sale_item.findUnique({
            where: { id: saleItemId },
            include: { tax: true },
        });

        if (!existingItem) {
            return { success: false, message: "Item tidak ditemukan." };
        }

        const taxRate = existingItem.tax?.rate ? Number(existingItem.tax.rate) : 0;

        // 1. Nilai unit_price di DB = Harga Tanpa PPN
        const newUnitPrice = unitPriceWithoutTax !== undefined ? unitPriceWithoutTax : Number(existingItem.unit_price);
        const newQty = quantity !== undefined ? quantity : existingItem.quantity;
        const newDiscount = discount !== undefined ? discount : Number(existingItem.discount || 0);

        // 2. Subtotal = Total harga tanpa PPN (setelah diskon)
        const rawSubtotal = newQty * newUnitPrice;
        const discountAmount = (rawSubtotal * newDiscount) / 100;
        const finalSubtotal = rawSubtotal - discountAmount;

        // 3. Tax Price (Nilai Pajak Nominal)
        const taxPrice = (finalSubtotal * taxRate) / 100;

        // Update item di database
        await prisma.sale_item.update({
            where: { id: saleItemId },
            data: {
                quantity: newQty,
                unit_price: newUnitPrice,
                discount: newDiscount,
                subtotal: finalSubtotal,
                tax_price: taxPrice,
            },
        });

        // Hitung ulang total amount SPK (Penjumlahan seluruh subtotal item)
        const allItems = await prisma.sale_item.findMany({
            where: { sale_id: saleId },
        });

        const newTotalAmount = allItems.reduce((acc, item) => {
            return acc + Number(item.subtotal) + Number(item.tax_price);
        }, 0);

        await prisma.sale.update({
            where: { id: saleId },
            data: { total_amount: newTotalAmount },
        });

        revalidatePath("/sales");
        return { success: true, message: "Item berhasil diperbarui." };
    } catch (error: any) {
        console.error("Error updating sale item:", error);
        return { success: false, message: error?.message || "Gagal memperbarui item." };
    }
}

export async function updateSaleAction(saleId: number, formData: {
    no_spk: string;
    no_po: string;
    spk_type: string;
    status: string;
    sales_person: string;
    ecatalog: string;
    shipping_cost: number;
    remarks: string;
    spk_date: string;
    expected_date: string;
}) {
    try {
        await prisma.sale.update({
            where: { id: saleId },
            data: {
                no_spk: formData.no_spk,
                no_po: formData.no_po,
                spk_type: formData.spk_type,
                status: formData.status,
                sales_person: formData.sales_person,
                ecatalog: formData.ecatalog,
                shipping_cost: formData.shipping_cost,
                remarks: formData.remarks,
                spk_date: new Date(formData.spk_date),
                expected_date: formData.expected_date ? new Date(formData.expected_date) : null,
            },
        });

        // Revalidate cache halaman terkait (sesuaikan path rute Anda)
        revalidatePath("/spk");

        return { success: true, message: "Data SPK berhasil diperbarui." };
    } catch (error: any) {
        console.error("Error updating sale:", error);
        return { success: false, message: error.message || "Gagal memperbarui data SPK." };
    }
}