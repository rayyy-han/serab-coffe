import { supabase } from "@/src/utils/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file     = formData.get("file")     as File;
    const fileName = formData.get("fileName") as string;

    if (!file || !fileName) {
      return NextResponse.json(
        { success: false, message: "File wajib diupload" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Tipe file tidak didukung. Gunakan JPG, PNG, atau WEBP" },
        { status: 400 }
      );
    }

    // Validasi ukuran file (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    // Upload ke Supabase Storage
    const { error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, buffer, {
        contentType : file.type,
        cacheControl: "3600",
        upsert      : false,
      });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Gagal mengupload gambar", error: error.message },
        { status: 500 }
      );
    }

    // Ambil public URL
    const { data: { publicUrl } } = supabase.storage
      .from("menu-images")
      .getPublicUrl(fileName);

    return NextResponse.json(
      { success: true, message: "Gambar berhasil diupload", url: publicUrl },
      { status: 200 }
    );

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}