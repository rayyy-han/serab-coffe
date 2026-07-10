import { supabase } from "@/src/utils/supabase/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ── Ambil tanggal hari ini (awal & akhir) ─────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ── 1. History penjualan hari ini ─────────────────────────────
    const { data: historyData, error: historyError } = await supabase
      .from("history")
      .select(
        `
        id,
        history_type,
        quantity,
        menu (
          price
        )
      `,
      )
      .eq("history_type", "penjualan")
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString());

    if (historyError) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data history",
          error: historyError.message,
        },
        { status: 500 },
      );
    }

    // ── Kalkulasi total pesanan & total pembeli ───────────────────
    let totalPesananHariIni = 0;
    const totalPembeliHariIni = historyData.length;

    for (const item of historyData) {
      const menuRaw = item.menu;
      const menuObj = Array.isArray(menuRaw) ? menuRaw[0] : menuRaw;
      const price = typeof menuObj?.price === "number" ? menuObj.price : 0;
      totalPesananHariIni += price * item.quantity;
    }

    // ── 2. Total menu tersedia ────────────────────────────────────
    // ── 2. Total menu tersedia (hanya yang is_active = true) ──────────
    const { count: menuCount, error: menuError } = await supabase
      .from("menu")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true); // ← tambahan ini saja

    if (menuError) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data menu",
          error: menuError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          total_pesanan_hari_ini: totalPesananHariIni,
          total_pembeli_hari_ini: totalPembeliHariIni,
          menu_tersedia: menuCount ?? 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
