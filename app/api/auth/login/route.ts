import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signToken, AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth";
import { supabase } from "@/src/utils/supabase/supabase";

export const runtime = "nodejs";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  let body: LoginBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Body request tidak valid." },
      { status: 400 }
    );
  }

  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username dan password wajib diisi." },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password")
    .eq("username", username)
    .single();

  // error.code "PGRST116" = tidak ada baris ditemukan (single() gagal match)
  // Pesan error sengaja disamakan antara "user tidak ada" dan "password salah"
  // supaya tidak bocorkan info username mana yang terdaftar
  if (error || !user || !user.password) {
    return NextResponse.json(
      { message: "Username atau password salah." },
      { status: 401 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      { message: "Username atau password salah." },
      { status: 401 }
    );
  }

  const token = signToken({ sub: user.id, username: user.username });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, authCookieOptions);

  return NextResponse.json(
    {
      message: "Login berhasil.",
      user: { id: user.id, username: user.username },
    },
    { status: 200 }
  );
}