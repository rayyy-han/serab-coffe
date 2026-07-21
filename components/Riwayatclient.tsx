"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TabelRiwayat from "@/components/TabelRiwayat";
import AddTransactionDialog from "@/components/Addtransactiondialog";

// ── Tipe data hasil fetch, disesuaikan dengan response API history ─
type HistoryItem = {
  id: string;
  id_menu: string;
  history_type: "pembelian" | "penjualan";
  quantity: number;
  menu: {
    id: string;
    title: string;
    price: number;
    image_url: string;
    categori: string;
    stock: string;
  };
};

export default function RiwayatClient() {
  const [search, setSearch]   = useState("");
  const [data, setData]       = useState<HistoryItem[]|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ── Fetch ke /api/history/filter berdasarkan nama menu ───────────
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim() !== "") {
        params.set("title", search.trim());
      }

      const res  = await fetch(`/api/history/filter?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Gagal mengambil data riwayat");
        setData([]);
        return;
      }

      setData(json.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Terjadi kesalahan saat menghubungi server");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Trigger pencarian saat menekan Enter di input ────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">

      {/* Search Bar + Tambah Transaksi */}
      <div className="flex items-center gap-3 justify-between w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Find Product Stocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {loading ? "Mencari..." : "Search"}
          </Button>
        </div>
        <AddTransactionDialog onSuccess={handleSearch} />
      </div>

      {/* Pesan error kalau fetch gagal */}
      {error && (
        <p className="text-sm text-destructive px-1">{error}</p>
      )}

      {/* Table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <TabelRiwayat data={data} loading={loading} />
      </div>

    </div>
  );
}