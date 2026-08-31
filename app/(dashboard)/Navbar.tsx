"use client";

import { Menu, Bell } from "lucide-react";

import { Dispatch, SetStateAction } from "react";

export default function Navbar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>

        <h2 className="text-2xl font-bold">
          Dashboard
        </h2> */}
      </div>

      <div className="flex items-center gap-5">
        {/* <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell color="#0E5EA2" size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button> */}

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0E5EA2] font-bold text-white">
            A
          </div>

          <div>
            <p className="font-semibold text-[#0E5EA2]">
              Administrator
            </p>
            <p className="text-xs text-gray-500">
              ADMIN
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}