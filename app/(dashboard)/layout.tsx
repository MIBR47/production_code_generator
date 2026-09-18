"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />

                <main className="flex-1 overflow-auto p-6 text-black bg-[#E5E8EA]">
                    {children}
                </main>
            </div>
        </div>
    );
}
