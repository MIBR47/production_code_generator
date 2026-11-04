"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, BriefcaseMedical, ShoppingCart, Boxes,
    ScanBarcode, Stethoscope, Package, Users, Factory,
    LogOut, ChevronLeft,
} from "lucide-react";

const menus = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "SPK", href: "/spk", icon: BriefcaseMedical },
    { title: "Purchases", href: "/purchases", icon: ShoppingCart },
    { title: "Inventory", href: "/inventory", icon: Boxes },
    { title: "Production Codes", href: "/production-codes", icon: ScanBarcode },
    { title: "Products", href: "/products", icon: Stethoscope },
    { title: "Items", href: "/items", icon: Package },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Suppliers", href: "/suppliers", icon: Factory },
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
        <aside className={`flex shrink-0 flex-col bg-[#0E5EA2] text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
            {/* HEADER */}
            <div className={`flex h-16 items-center border-b border-white/15 ${collapsed ? "justify-center" : "justify-between px-5"}`}>
                {!collapsed && <h1 className="text-lg font-bold tracking-wide">Production</h1>}

                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="rounded-lg p-2 transition hover:bg-white/10"
                >
                    <ChevronLeft size={20} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* MENU */}
            <nav className="flex-1 space-y-2 overflow-y-auto p-3">
                {menus.map((menu) => {
                    const Icon = menu.icon;
                    const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            title={collapsed ? menu.title : undefined}
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center rounded-xl py-3 text-sm transition-all ${collapsed ? "justify-center px-3" : "gap-3 px-4"
                                } ${active
                                    ? "bg-[#85BC49] text-white"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <Icon size={22} />
                            {!collapsed && <span className="font-medium">{menu.title}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* LOGOUT */}
            <div className="border-t border-white/15 p-3">
                <button
                    type="button"
                    title={collapsed ? "Logout" : undefined}
                    className={`flex w-full items-center rounded-xl py-3 text-white transition hover:bg-red-500 ${collapsed ? "justify-center px-3" : "gap-3 px-4"
                        }`}
                >
                    <LogOut size={22} />
                    {!collapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
}