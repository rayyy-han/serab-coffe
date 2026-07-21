import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Belum login." }, { status: 401 });
  }

  const session = verifyToken(token);

  if (!session) {
    return NextResponse.json(
      { message: "Sesi tidak valid atau kedaluwarsa." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: { id: session.sub, username: session.username },
  });
}