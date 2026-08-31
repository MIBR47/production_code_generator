"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
// import Sidebar from "@/components/Sidebar";
// import Navbar from "@/components/Navbar";

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

                <main className="flex-1 overflow-auto p-6 text-black">
                    {children}
                </main>
            </div>
        </div>
    );
}