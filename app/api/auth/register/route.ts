import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "@/src/utils/supabase/supabase";


export const runtime = "nodejs";

type RegisterBody = {
  username?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  let body: RegisterBody;

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
console.log(typeof body, body.username, body.password);
  if (!username || !password) {
    return NextResponse.json(
      { message: "Username dan password wajib diisi." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password minimal 8 karakter." },
      { status: 400 }
    );
  }

  // Cek username sudah dipakai atau belum
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { message: "Username sudah digunakan." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: randomUUID(),
    username,
    password: hashedPassword,
  };

  const { data, error } = await supabase
    .from("users")
    .insert(newUser)
    .select("id, username")
    .single();

  if (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Registrasi berhasil.", user: data },
    { status: 201 }
  );
}