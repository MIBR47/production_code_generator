import { prisma } from "@/lib/prisma";
import ProductionCodeTable from "@/components/production-codes/ProductionCodeTable";

export default async function ProductionCodesPage() {
    const [productionData, productsData, customersData] = await Promise.all([
        prisma.production_code.findMany({
            include: {
                product: true,
                product_code: true,
                customer: true,
                user: true,
            },
            orderBy: {
                created_at: "asc",
            },
        }),

        prisma.product.findMany({
            include: {
                product_codes: true,
            },
            orderBy: {
                product_name: "asc",
            },
        }),

        prisma.customer.findMany({
            orderBy: {
                name: "asc",
            },
        }),
    ]);

    return (
        <ProductionCodeTable
            data={productionData}
            products={productsData}
            customers={customersData}
        />
    );
}