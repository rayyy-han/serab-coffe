"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TabelRiwayat from "@/components/TabelRiwayat";
import AddTransactionDialog from "@/components/Addtransactiondialog";

export default function RiwayatClient() {
  const [search, setSearch] = useState("");

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
              className="pl-9 bg-card border-border"
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6">
            Search
          </Button>
        </div>
        <AddTransactionDialog onSuccess={() => {}} />
      </div>

      {/* Table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <TabelRiwayat />
      </div>

    </div>
  );
}