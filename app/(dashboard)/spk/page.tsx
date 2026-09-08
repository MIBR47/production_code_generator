import { prisma } from "@/lib/prisma";
import { SaleList } from "./SaleList";

export default async function SpkPage() {
    const [sales, customers, rawProducts, rawTaxes] = await Promise.all([
        prisma.sale.findMany({
            include: {
                customer: true,
                sale_items: { include: { product: true, tax: true } },
            },
            orderBy: { id: "desc" },
        }),
        prisma.customer.findMany({ select: { id: true, name: true } }),

        prisma.product.findMany({
            select: {
                id: true,
                product_name: true,
                product_prices: {
                    select: { price: true },
                    orderBy: { id: "desc" },
                    take: 1,
                },
            },
        }),

        prisma.tax.findMany({ select: { id: true, name: true, rate: true } }),
    ]);

    const products = rawProducts.map((p) => ({
        id: p.id,
        product_name: p.product_name,
        price: p.product_prices[0]?.price ? Number(p.product_prices[0].price) : 0,
    }));

    // Konversi Decimal pada rate tax menjadi number
    const taxes = rawTaxes.map((t) => ({
        ...t,
        rate: Number(t.rate), // Ubah Decimal ke number
    }));

    return (
        <SaleList
            sales={JSON.parse(JSON.stringify(sales))}
            customers={customers}
            products={products}
            taxes={taxes}
        />
    );
}