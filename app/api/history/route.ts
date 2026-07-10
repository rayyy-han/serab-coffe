import { supabase } from "@/src/utils/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// ── GET: Ambil semua history ──────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const history_type = searchParams.get("history_type");
    const id_menu      = searchParams.get("id_menu");

    let query = supabase
      .from("history")
      .select(`
        id,
        id_menu,
        history_type,
        quantity,
        menu (
          id,
          title,
          price,
          image_url,
          categori,
          stock
        )
      `)
      .order("id", { ascending: false });

    if (history_type) {
      const validTypes = ["pembelian", "penjualan"];
      if (!validTypes.includes(history_type)) {
        return NextResponse.json(
          { success: false, message: `Tipe tidak valid. Gunakan: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
      query = query.eq("history_type", history_type);
    }

    if (id_menu) {
      query = query.eq("id_menu", id_menu);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data history", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Data history berhasil diambil",
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

// ── POST: Tambah history baru ─────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_menu, history_type, quantity } = body;

    // ── Validasi field wajib ──────────────────────────────────────
    if (!id_menu || !history_type || !quantity) {
      return NextResponse.json(
        { success: false, message: "Field id_menu, history_type, dan quantity wajib diisi" },
        { status: 400 }
      );
    }

    // ── Validasi enum history_type ────────────────────────────────
    const validTypes = ["pembelian", "penjualan"];
    if (!validTypes.includes(history_type)) {
      return NextResponse.json(
        { success: false, message: `Tipe tidak valid. Gunakan: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Validasi quantity ─────────────────────────────────────────
    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity harus berupa angka lebih dari 0" },
        { status: 400 }
      );
    }

    // ── Cek apakah menu ada ───────────────────────────────────────
    const { data: menuData, error: menuError } = await supabase
      .from("menu")
      .select("id, title, stock")
      .eq("id", id_menu)
      .single();

    if (menuError || !menuData) {
      return NextResponse.json(
        { success: false, message: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    // ── Insert ke tabel history ───────────────────────────────────
    const newHistory = {
      id          : uuidv4(),
      id_menu,
      history_type,
      quantity,
    };

    const { data, error } = await supabase
      .from("history")
      .insert(newHistory)
      .select(`
        id,
        id_menu,
        history_type,
        quantity,
        menu (
          id,
          title,
          price,
          image_url,
          categori,
          stock
        )
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal menambahkan history", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "History berhasil ditambahkan", data },
      { status: 201 }
    );

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}