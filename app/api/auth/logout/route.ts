import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return NextResponse.json({ message: "Logout berhasil." }, { status: 200 });
}