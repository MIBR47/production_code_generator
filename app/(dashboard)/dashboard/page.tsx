import {
    Package,
    Users,
    Factory,
    Boxes,
} from "lucide-react";

const cards = [
    {
        title: "Products",
        value: 128,
        icon: Package,
    },
    {
        title: "Customers",
        value: 54,
        icon: Users,
    },
    {
        title: "Production Units",
        value: 6,
        icon: Factory,
    },
    {
        title: "Orders",
        value: 245,
        icon: Boxes,
    },
];
export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#0E5EA2]">
                    Dashboard
                </h1>

                <p className="text-gray-500 mt-2">
                    Selamat datang di Production Management System.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-lg transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold text-[#0E5EA2]">
                                        {card.value}
                                    </h2>
                                </div>

                                <div className="rounded-xl bg-blue-100 p-3">
                                    <Icon
                                        size={28}
                                        className="text-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <h3 className="text-lg text-[#0E5EA2] font-semibold">
                    Activity
                </h3>

                <p className="mt-3 text-gray-500">
                    Belum ada aktivitas terbaru.
                </p>
            </div>
        </div>
    );
}