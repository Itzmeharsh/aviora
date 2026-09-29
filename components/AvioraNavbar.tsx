"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AvioraModeNav from "@/components/AvioraModeNav";

export default function AvioraNavbar() {
  const pathname = usePathname();
  const isThali = pathname.startsWith("/thali");

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        isThali
          ? "border-white/10 bg-[#0a0a0a]/90"
          : "border-black/10 bg-gray-300/150"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Aviora */}
        <Link
          href="/"
          className={`text-xl font-semibold tracking-tight ${
            isThali ? "text-white" : "text-[#172B4D]"
          }`}
        >
          Aviora
          <span
            className={isThali ? "text-amber-400" : "text-amber-500"}
          >
            .
          </span>
        </Link>

        {/* Tailor / Thali / Account */}
        <AvioraModeNav />
      </div>
    </nav>
  );
}