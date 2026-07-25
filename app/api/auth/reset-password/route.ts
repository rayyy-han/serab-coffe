import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/src/utils/supabase/supabase";

export const runtime = "nodejs";

type ResetBody = {
  username?: string;
  newPassword?: string;
};

export async function POST(req: NextRequest) {
  let body: ResetBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Body request tidak valid." },
      { status: 400 }
    );
  }

  const username = body.username?.trim();
  const newPassword = body.newPassword;

  if (!username || !newPassword) {
    return NextResponse.json(
      { message: "Username dan password baru wajib diisi." },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { message: "Password baru minimal 8 karakter." },
      { status: 400 }
    );
  }

  // Cek apakah username terdaftar
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", username)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { message: "Username tidak ditemukan." },
      { status: 404 }
    );
  }

  // Hash password baru dan update
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", user.id);

  if (updateError) {
    console.error("Reset password error:", updateError);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mereset password." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Password berhasil direset. Silakan login dengan password baru." },
    { status: 200 }
  );
}
