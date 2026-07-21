import { supabase } from "@/src/utils/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";

// ── GET: Cari history berdasarkan nama menu ───────────────────────
// Endpoint disarankan: /api/history/search?title=nasi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title       = searchParams.get("title");
    const history_type = searchParams.get("history_type");

    // ── Validasi wajib: title harus ada ───────────────────────────
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Query 'title' wajib diisi untuk pencarian" },
        { status: 400 }
      );
    }

    // ── Validasi opsional: history_type ───────────────────────────
    const validTypes = ["pembelian", "penjualan"];
    if (history_type && !validTypes.includes(history_type)) {
      return NextResponse.json(
        { success: false, message: `Tipe tidak valid. Gunakan: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Query dengan inner join ke menu, filter title pakai ilike ──
    // "menu!inner" wajib dipakai agar filter pada kolom relasi (menu.title) berfungsi
    let query = supabase
      .from("history")
      .select(`
        id,
        id_menu,
        history_type,
        quantity,
        menu!inner (
          id,
          title,
          price,
          image_url,
          categori,
          stock
        )
      `)
      .ilike("menu.title", `%${title}%`)
      .order("id", { ascending: false });

    if (history_type) {
      query = query.eq("history_type", history_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mencari data history", error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `Tidak ditemukan riwayat pesanan untuk menu "${title}"`,
          total  : 0,
          data   : [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Data history berhasil ditemukan",
        total  : data.length,
        data,
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