import RiwayatClient from "@/components/Riwayatclient";
import { Receipt, TrendingUp, ShoppingBag } from "lucide-react";

// ── Tipe summary ──────────────────────────────────────────────────
interface Summary {
  total_pesanan   : number;
  total_pendapatan: number;
  total_pembelian : number;
}

// ── Format Rupiah ─────────────────────────────────────────────────
function formatRupiah(num: number) {
  return "Rp" + num.toLocaleString("id-ID");
}

// ── Fetch summary di server ───────────────────────────────────────
async function getSummary(): Promise<Summary> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXTAUTH_URL ?? "http://localhost:3000" : "http://localhost:3000"}/api/history/summary`,
      { cache: "no-store" } // selalu fresh
    );
    const json = await res.json();
    if (json.success) return json.data;
  } catch {
    // fallback jika fetch gagal
  }
  return { total_pesanan: 0, total_pendapatan: 0, total_pembelian: 0 };
}

// ── Server Component ──────────────────────────────────────────────
export default async function RiwayatPage() {
  const summary = await getSummary();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Pesanan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau dan catat aktivitas pesanan serta transaksi pelanggan
          </p>
        </div>

        {/* KPI Cards — dirender di server */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Receipt className="w-4 h-4" />
              Total Pesanan
            </div>
            <p className="text-3xl font-bold text-foreground">
              {summary.total_pesanan}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="w-4 h-4" />
              Total Pendapatan
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formatRupiah(summary.total_pendapatan)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ShoppingBag className="w-4 h-4" />
              Total Pembelian
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formatRupiah(summary.total_pembelian)}
            </p>
          </div>
        </div>

        {/* Search + Table — dihandle client component */}
        <RiwayatClient />

      </div>
    </div>
  );
}