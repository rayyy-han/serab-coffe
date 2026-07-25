import { Receipt, TrendingUp, ShoppingBag } from "lucide-react";
import RiwayatKpiCards from "@/components/RiwayatKpiCards";
import RiwayatClient from "@/components/Riwayatclient";

export const dynamic = "force-dynamic";

// ── Server Component ──────────────────────────────────────────────
export default function RiwayatPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6 animate-stagger">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Riwayat Pesanan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau dan catat aktivitas pesanan serta transaksi pelanggan
          </p>
        </div>

        {/* KPI Cards — client component agar bisa fetch di browser */}
        <RiwayatKpiCards />

        {/* Search + Table — dihandle client component */}
        <RiwayatClient />
      </div>
    </div>
  );
}
