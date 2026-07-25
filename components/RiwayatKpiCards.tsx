"use client";

import { useEffect, useState } from "react";
import { Receipt, TrendingUp, ShoppingBag } from "lucide-react";

interface Summary {
  total_pesanan: number;
  total_pendapatan: number;
  total_item_terjual: number;
}

function formatRupiah(num: number) {
  return "Rp" + num.toLocaleString("id-ID");
}

export default function RiwayatKpiCards() {
  const [summary, setSummary] = useState<Summary>({
    total_pesanan: 0,
    total_pendapatan: 0,
    total_item_terjual: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/history/summary");
        const json = await res.json();
        if (json.success && json.data) {
          setSummary(json.data);
        }
      } catch {
        // fallback tetap 0
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
      {/* Total Pesanan */}
      <div className="shine-card kpi-float bg-card border border-border rounded-[12px] p-5 space-y-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Receipt className="w-4 h-4" />
          Total Pesanan
        </div>
        <p className="text-3xl font-bold text-foreground animate-value-pop">
          {loading ? "—" : summary.total_pesanan}
        </p>
      </div>

      {/* Total Pendapatan */}
      <div className="shine-card kpi-float bg-card border border-border rounded-[12px] p-5 space-y-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <TrendingUp className="w-4 h-4" />
          Total Pendapatan
        </div>
        <p className="text-3xl font-bold text-foreground animate-value-pop">
          {loading ? "—" : formatRupiah(summary.total_pendapatan)}
        </p>
      </div>

      {/* Total Item Terjual */}
      <div className="shine-card kpi-float bg-card border border-border rounded-[12px] p-5 space-y-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <ShoppingBag className="w-4 h-4" />
          Total Item Terjual
        </div>
        <p className="text-3xl font-bold text-foreground animate-value-pop">
          {loading ? "—" : `${summary.total_item_terjual} porsi`}
        </p>
      </div>
    </div>
  );
}
