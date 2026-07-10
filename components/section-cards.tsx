import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, Users, UtensilsCrossed } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────
interface DashboardSummary {
  total_pesanan_hari_ini : number;
  total_pembeli_hari_ini : number;
  menu_tersedia          : number;
}

// ── Format Rupiah ─────────────────────────────────────────────────
function formatRupiah(num: number) {
  return "Rp" + num.toLocaleString("id-ID");
}

// ── Fetch summary di server ───────────────────────────────────────
async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000/";
    const res     = await fetch(`${baseUrl}/api/dashboard/summary`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.success) return json.data;
  } catch (err) {
    console.error("Gagal fetch summary:", err);
  }
  return {
    total_pesanan_hari_ini : 0,
    total_pembeli_hari_ini : 0,
    menu_tersedia          : 0,
  };
}

// ── Component ─────────────────────────────────────────────────────
export async function SectionCards() {
  const summary = await getDashboardSummary();

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">

      {/* Total Pesanan Hari Ini */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4" />
            Total Pesanan Hari Ini
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(summary.total_pesanan_hari_ini)}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Total Pembeli Hari Ini */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Total Pembeli Hari Ini
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.total_pembeli_hari_ini.toLocaleString("id-ID")}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Menu Tersedia */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4" />
            Menu Tersedia
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.menu_tersedia} menu
          </CardTitle>
        </CardHeader>
      </Card>

    </div>
  );
}