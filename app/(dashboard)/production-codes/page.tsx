// "use client";

// import Input from "@/components/ui/Input";
// import { useState } from "react";

import { prisma } from "@/lib/prisma";
import ProductionCodeTable from "./ProductionCodeTable";

export default async function ProductioncodesPage() {

    // const [search, setSearch] = useState("");

    const productionData = await prisma.production_code.findMany({
        include: {
            product: true,
            product_code: true,
            customer: true,
            user: true,
        },
        orderBy: {
            created_at: "asc",
        },
    });

    const productsData = await prisma.product.findMany({
        include: {
            product_codes: true,
        },
        orderBy: {
            product_name: "asc",
        },
    });

    const customersData = await prisma.customer.findMany({
        orderBy: {
            name: "asc",
        },
    });


    return (
        // <div className="space-y-6">

        //     <div className="rounded-xl border bg-white shadow-sm overflow-hidden text-black">
        //         <div className="overflow-x-auto">
        //             {/* <productionUnitsTable data={filteredData} /> */}
        //             {/* <productionUnitsTable data={filteredData} /> */}
        //         </div>
        //     </div>
        // </div>
        // <div className="space-y-6">

        <ProductionCodeTable data={productionData} products={productsData} customers={customersData} />
        // </div>x
    );
}