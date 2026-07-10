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
    let totalPesanan    = 0;
    let totalPendapatan = 0;
    let totalPembelian  = 0;

    for (const item of data) {
  const menu  = Array.isArray(item.menu) ? item.menu[0] : item.menu;
  const price = (menu as { price: number } | null)?.price ?? 0;
  const total = price * item.quantity;

  totalPesanan += 1;

  if (item.history_type === "penjualan") {
    totalPendapatan += total;
  } else if (item.history_type === "pembelian") {
    totalPembelian += total;
  }
}
    return NextResponse.json(
      {
        success: true,
        data: {
          total_pesanan   : totalPesanan,
          total_pendapatan: totalPendapatan,
          total_pembelian : totalPembelian,
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