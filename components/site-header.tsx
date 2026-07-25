"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SerabLogoIcon } from "@/components/serab-logo";
import { LayoutDashboard, Utensils, History, FileSpreadsheet, Store } from "lucide-react";

/**
 * Returns header title and icon according to current route
 */
function getPageHeaderInfo(pathname: string) {
  if (pathname === "/") {
    return {
      title: "Dashboard Utama",
      subtitle: "POS & Management System",
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-800" />,
    };
  }
  if (pathname.startsWith("/menu")) {
    return {
      title: "Kelola Menu & Stok",
      subtitle: "Katalog Produk & Harga",
      icon: <Utensils className="w-4 h-4 text-emerald-800" />,
    };
  }
  if (pathname.startsWith("/riwayat")) {
    return {
      title: "Riwayat Transaksi",
      subtitle: "Catatan Penjualan & Pesanan",
      icon: <History className="w-4 h-4 text-emerald-800" />,
    };
  }
  if (pathname.startsWith("/report")) {
    return {
      title: "Laporan Keuangan",
      subtitle: "Ringkasan Performa & KPI",
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-800" />,
    };
  }

  return {
    title: "Serab Coffee Operating System",
    subtitle: "Kasir & Manajemen Outlet",
    icon: <Store className="w-4 h-4 text-emerald-800" />,
  };
}

export function SiteHeader() {
  const pathname = usePathname();
  const pageInfo = getPageHeaderInfo(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
        {/* Left Section: Sidebar Trigger + Dynamic Route Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger className="-ml-1 text-foreground/80 hover:text-foreground" />
          <Separator
            orientation="vertical"
            className="mx-1.5 data-[orientation=vertical]:h-4 bg-border/60"
          />
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-900/10 border border-emerald-900/15 hidden sm:flex items-center justify-center">
              {pageInfo.icon}
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-tight">
                {pageInfo.title}
              </h1>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden xs:inline-block">
                {pageInfo.subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Brand Emblem Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#254B20]/10 border border-[#254B20]/20 shadow-xs">
          <SerabLogoIcon height={22} />
          <div className="flex flex-col text-left leading-none hidden sm:flex">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#254B20]">
              Serab Coffee
            </span>
            <span className="text-[9px] font-serif italic text-[#254B20]/75 tracking-wide">
              Brewery
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
