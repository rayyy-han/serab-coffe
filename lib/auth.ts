import jwt from "jsonwebtoken";

// Wajib di-set di .env.local, generate string acak yang panjang & rahasia
// contoh generate: openssl rand -base64 48
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET belum di-set di environment variables");
}

const JWT_EXPIRES_IN = "7d"; // sesuaikan durasi sesi sesuai kebutuhan

export const AUTH_COOKIE_NAME = "auth_token";

export type SessionPayload = {
  sub: string; // user id
  username: string;
};

export function signToken(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

// Opsi cookie standar dipakai bareng di route login & logout
export const authCookieOptions = {
  httpOnly: true, // tidak bisa diakses lewat document.cookie di browser -> aman dari XSS
  secure: process.env.NODE_ENV === "production", // hanya dikirim lewat HTTPS di production
  sameSite: "lax" as const, // proteksi dasar dari CSRF, tetap ikut saat navigasi biasa
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 hari, samakan dengan JWT_EXPIRES_IN
};