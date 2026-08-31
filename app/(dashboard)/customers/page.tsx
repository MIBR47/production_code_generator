import { prisma } from "@/lib/prisma";
import CustomerTable from "./CustomerTable";


export default async function CustomersPage() {

    const customerData = await prisma.customer.findMany({

        orderBy: {
            name: "asc",
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
            <CustomerTable data={customerData} />

        </div>
    );
}