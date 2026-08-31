import { prisma } from "@/lib/prisma";
import ProductTable from "./ProductTable";


type Products = {
    id: number;
    product_name: string;
    // product_code: string;
    product_type: string;
};
export const dynamic = "force-dynamic";


export default async function ProductsPage() {

    const productData = await prisma.product.findMany({
        include: {
            product_codes: true,

        },
        orderBy: {
            product_name: "asc",
        },
    });

    // const [search, setSearch] = useState("");

    // const filteredData = productData.filter((item) =>
    //     item.product_name
    //         .toLowerCase()
    //         .includes(search.toLowerCase())
    // );
    return (
        <div className="space-y-6">
            <ProductTable data={productData} />

        </div>
    );
}