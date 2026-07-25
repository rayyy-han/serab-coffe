import { supabase } from "@/src/utils/supabase/supabase";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    // ── Ambil semua history beserta relasi menu ───────────────────
    const { data, error } = await supabase
      .from("history")
      .select(`
        history_type,
        quantity,
        menu (
          price
        )
      `);

    if (error) {
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data summary", error: error.message },
        { status: 500 }
      );
    }

    // ── Kalkulasi KPI ─────────────────────────────────────────────
    let totalPesanan     = 0;
    let totalPendapatan  = 0;
    let totalItemTerjual = 0;

    for (const item of data) {
      const menu  = Array.isArray(item.menu) ? item.menu[0] : item.menu;
      const price = (menu as { price: number } | null)?.price ?? 0;
      const qty   = item.quantity ?? 0;
      const total = price * qty;

      totalPesanan += 1;
      totalItemTerjual += qty;
      totalPendapatan += total;
    }
    return NextResponse.json(
      {
        success: true,
        data: {
          total_pesanan    : totalPesanan,
          total_pendapatan : totalPendapatan,
          total_item_terjual: totalItemTerjual,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}