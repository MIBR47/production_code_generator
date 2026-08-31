"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
    Factory,
    Stethoscope,
    LogOut,
    ChevronLeft,
    ScanBarcode,
    BriefcaseMedical
} from "lucide-react";

const menus = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Products",
        href: "/products",
        icon: Package,
    },
    {
        title: "Customers",
        href: "/customers",
        icon: Factory,
    },
    {
        title: "Production Codes",
        href: "/production-codes",
        icon: BriefcaseMedical,
    },
    // {
    //     title: "Product Codes",
    //     href: "/product-codes",
    //     icon: ScanBarcode,
    // },
];

export default function Sidebar({
    collapsed,
    setCollapsed,
}: {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
}) {
    const pathname = usePathname();

    return (
        <aside
            className={`bg-[#0E5EA2] text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"
                } flex flex-col`}
        >
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700">
                {!collapsed && (
                    <h1 className="text-lg font-bold tracking-wide">
                        Production
                    </h1>
                )}

                <button onClick={() => setCollapsed(!collapsed)}>
                    <ChevronLeft
                        className={`transition ${collapsed ? "rotate-180" : ""
                            }`}
                    />
                </button>
            </div>

            <nav className="flex-1 p-3 space-y-2">
                {menus.map((menu) => {
                    const Icon = menu.icon;

                    const active = pathname === menu.href;

                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all
              ${active
                                    ? "bg-[#85BC49] text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <Icon size={22} />

                            {!collapsed && (
                                <span className="font-medium">
                                    {menu.title}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-700 p-3">
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-white hover:bg-red-500 hover:text-white transition">
                    <LogOut size={22} />

                    {!collapsed && "Logout"}
                </button>
            </div>
        </aside>
    );
}