"use client";

import { useState, type FormEvent } from "react";
import {
  Eye, EyeOff, Coffee, Loader2, Leaf,
  KeyRound, CheckCircle2, X, ShieldCheck,
} from "lucide-react";

// ── Forgot Password Modal ──────────────────────────────────────────
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !newPassword || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak sesuai.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), newPassword }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message ?? "Terjadi kesalahan. Coba lagi.");
      }
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    background: "oklch(0.97 0.015 78 / 70%)",
    border: "1.5px solid oklch(0.72 0.045 65 / 55%)",
    color: "oklch(0.25 0.045 60)",
    fontFamily: "inherit",
  } as React.CSSProperties;

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1.5px solid oklch(0.42 0.085 55 / 80%)";
    e.target.style.boxShadow = "0 0 0 3px oklch(0.42 0.085 55 / 12%)";
    e.target.style.background = "oklch(0.99 0.010 78)";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1.5px solid oklch(0.72 0.045 65 / 55%)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "oklch(0.97 0.015 78 / 70%)";
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "oklch(0.15 0.03 58 / 55%)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal card */}
      <div
        className="w-full max-w-md relative"
        style={{
          background: "oklch(0.985 0.014 80 / 96%)",
          backdropFilter: "blur(24px)",
          border: "1px solid oklch(0.72 0.045 65 / 35%)",
          borderRadius: "28px",
          boxShadow: "0 20px 60px oklch(0.20 0.04 55 / 30%)",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: "linear-gradient(90deg, oklch(0.42 0.085 55), oklch(0.55 0.10 65), oklch(0.42 0.085 55))",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex items-center justify-center w-8 h-8 rounded-full transition-all"
          style={{
            color: "oklch(0.50 0.04 60)",
            background: "oklch(0.91 0.03 75 / 60%)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.84 0.04 65 / 80%)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.91 0.03 75 / 60%)"; }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 py-7">
          {step === "form" ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="flex items-center justify-center w-14 h-14 mb-4"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.42 0.085 55), oklch(0.35 0.07 52))",
                    borderRadius: "18px",
                    boxShadow: "0 4px 16px oklch(0.42 0.085 55 / 30%)",
                  }}
                >
                  <KeyRound className="w-7 h-7 text-white" />
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "oklch(0.25 0.045 60)", fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  Reset Password
                </h2>
                <p className="text-sm mt-1 text-center" style={{ color: "oklch(0.50 0.04 60)" }}>
                  Masukkan username dan password baru kamu
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4" noValidate>
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: "oklch(0.30 0.05 58)" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan username kamu"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-60"
                    style={{ ...inputStyle, borderRadius: "14px" }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: "oklch(0.30 0.05 58)" }}>
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 disabled:opacity-60"
                      style={{ ...inputStyle, borderRadius: "14px" }}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 transition-colors"
                      style={{ color: "oklch(0.55 0.045 60)" }}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {newPassword.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background: i < Math.min(Math.ceil(newPassword.length / 3), 4)
                              ? (newPassword.length < 8 ? "oklch(0.628 0.213 22.216)"
                                : newPassword.length < 12 ? "oklch(0.75 0.16 85)"
                                : "oklch(0.52 0.13 150)")
                              : "oklch(0.85 0.02 75)",
                          }}
                        />
                      ))}
                      <span className="text-xs ml-1" style={{ color: "oklch(0.50 0.04 60)" }}>
                        {newPassword.length < 8 ? "Lemah" : newPassword.length < 12 ? "Sedang" : "Kuat"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: "oklch(0.30 0.05 58)" }}>
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 disabled:opacity-60"
                      style={{
                        ...inputStyle,
                        borderRadius: "14px",
                        ...(confirmPassword.length > 0 && confirmPassword === newPassword
                          ? { borderColor: "oklch(0.52 0.13 150 / 60%)", boxShadow: "0 0 0 2px oklch(0.52 0.13 150 / 12%)" }
                          : {}),
                      }}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <div className="absolute inset-y-0 right-10 flex items-center">
                        {confirmPassword === newPassword ? (
                          <CheckCircle2 className="h-4 w-4" style={{ color: "oklch(0.52 0.13 150)" }} />
                        ) : null}
                      </div>
                    )}
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 transition-colors"
                      style={{ color: "oklch(0.55 0.045 60)" }}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 px-4 py-3 text-sm"
                    style={{
                      background: "oklch(0.95 0.04 22 / 20%)",
                      border: "1px solid oklch(0.628 0.213 22.216 / 30%)",
                      color: "oklch(0.45 0.15 22)",
                      borderRadius: "14px",
                    }}
                  >
                    <span className="mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.42 0.085 55), oklch(0.36 0.075 52))",
                    color: "oklch(0.99 0 0)",
                    borderRadius: "14px",
                    boxShadow: "0 4px 14px oklch(0.42 0.085 55 / 35%)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px oklch(0.42 0.085 55 / 45%)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px oklch(0.42 0.085 55 / 35%)";
                  }}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {isLoading ? "Memproses..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="flex items-center justify-center w-16 h-16 mb-5"
                style={{
                  background: "linear-gradient(135deg, oklch(0.52 0.13 150), oklch(0.40 0.10 148))",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px oklch(0.52 0.13 150 / 30%)",
                }}
              >
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "oklch(0.25 0.045 60)", fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                Password Direset! ✓
              </h2>
              <p className="text-sm mb-6" style={{ color: "oklch(0.50 0.04 60)" }}>
                Password kamu berhasil diperbarui. Silakan login menggunakan password baru.
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, oklch(0.42 0.085 55), oklch(0.36 0.075 52))",
                  color: "oklch(0.99 0 0)",
                  borderRadius: "14px",
                  boxShadow: "0 4px 14px oklch(0.42 0.085 55 / 35%)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              >
                <Coffee className="h-4 w-4" /> Kembali ke Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Username atau password salah.");
      }

      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    background: "oklch(0.97 0.015 78 / 70%)",
    border: "1.5px solid oklch(0.72 0.045 65 / 55%)",
    color: "oklch(0.25 0.045 60)",
    fontFamily: "inherit",
    borderRadius: "16px",
  } as React.CSSProperties;

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1.5px solid oklch(0.42 0.085 55 / 80%)";
    e.target.style.boxShadow = "0 0 0 3px oklch(0.42 0.085 55 / 12%)";
    e.target.style.background = "oklch(0.99 0.010 78)";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1.5px solid oklch(0.72 0.045 65 / 55%)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "oklch(0.97 0.015 78 / 70%)";
  };

  return (
    <>
      {/* Forgot password modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.96 0.018 80 / 45%), oklch(0.92 0.025 70 / 50%)),
            url("/coffee-beans-wallpaper.avif")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Floating login card */}
        <div
          className="w-full max-w-md mx-4"
          style={{
            background: "oklch(0.985 0.014 80 / 82%)",
            backdropFilter: "blur(24px)",
            border: "1px solid oklch(0.72 0.045 65 / 35%)",
            borderRadius: "32px",
            boxShadow: `
              0 8px 32px oklch(0.25 0.045 60 / 18%),
              0 2px 8px oklch(0.25 0.045 60 / 10%),
              inset 0 1px 0 oklch(0.99 0.01 80 / 60%)
            `,
            overflow: "hidden",
          }}
        >
          {/* Top decorative bar */}
          <div
            className="h-1.5 w-full"
            style={{
              background: "linear-gradient(90deg, oklch(0.42 0.085 55), oklch(0.55 0.10 65), oklch(0.42 0.085 55))",
            }}
          />

          <div className="px-8 pt-8 pb-9">
            {/* Brand */}
            <div className="flex flex-col items-center mb-7">
              <div
                className="relative flex items-center justify-center w-16 h-16 mb-4 shadow-md"
                style={{
                  background: "linear-gradient(135deg, oklch(0.42 0.085 55), oklch(0.35 0.07 52))",
                  borderRadius: "20px",
                  boxShadow: "0 4px 16px oklch(0.42 0.085 55 / 35%)",
                }}
              >
                <Leaf className="w-8 h-8 text-white" strokeWidth={2} />
                <div
                  className="absolute inset-0"
                  style={{ border: "1px solid oklch(0.72 0.09 75 / 40%)", borderRadius: "20px" }}
                />
              </div>

              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase mb-1"
                style={{ color: "oklch(0.52 0.085 60)" }}
              >
                Serab Coffee
              </p>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-poppins, sans-serif)", color: "oklch(0.25 0.045 60)" }}
              >
                Selamat Datang Kembali
              </h1>
              <p className="mt-1.5 text-sm text-center" style={{ color: "oklch(0.48 0.045 60)" }}>
                Masuk untuk mengelola kasir kamu
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: "oklch(0.72 0.045 65 / 45%)" }} />
              <Coffee className="w-4 h-4" style={{ color: "oklch(0.60 0.06 60)" }} />
              <div className="flex-1 h-px" style={{ background: "oklch(0.72 0.045 65 / 45%)" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-sm font-semibold" style={{ color: "oklch(0.30 0.05 58)" }}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-60"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold" style={{ color: "oklch(0.30 0.05 58)" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-medium transition-colors hover:underline underline-offset-2"
                    style={{ color: "oklch(0.42 0.085 55)" }}
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 disabled:opacity-60"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center px-4 transition-colors"
                    style={{ color: "oklch(0.55 0.045 60)" }}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 px-4 py-3 text-sm"
                  style={{
                    background: "oklch(0.95 0.04 22 / 20%)",
                    border: "1px solid oklch(0.628 0.213 22.216 / 30%)",
                    color: "oklch(0.45 0.15 22)",
                    borderRadius: "14px",
                  }}
                >
                  <span className="mt-0.5 text-base leading-none">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: isLoading
                    ? "oklch(0.42 0.085 55 / 70%)"
                    : "linear-gradient(135deg, oklch(0.42 0.085 55), oklch(0.36 0.075 52))",
                  color: "oklch(0.99 0 0)",
                  borderRadius: "16px",
                  boxShadow: isLoading ? "none" : "0 4px 14px oklch(0.42 0.085 55 / 35%)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px oklch(0.42 0.085 55 / 45%)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px oklch(0.42 0.085 55 / 35%)";
                }}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coffee className="h-4 w-4" />}
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs mt-6" style={{ color: "oklch(0.55 0.04 65)" }}>
              Sistem kasir &amp; manajemen Serab Coffee ☕
            </p>
          </div>
        </div>

        {/* Vignette overlay */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            zIndex: -1,
            background: "radial-gradient(ellipse at center, transparent 40%, oklch(0.20 0.03 58 / 30%) 100%)",
          }}
        />
      </div>
    </>
  );
}
