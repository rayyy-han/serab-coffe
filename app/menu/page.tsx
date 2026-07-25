"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  Edit,
  Coffee,
  Wine,
  Sandwich,
  Cookie,
  Cake,
  Milk,
  Trash,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddMenuDialog from "@/components/AddmenuDialog";
import EditMenuDialog from "@/components/Editmenudialog";

// ── Types ─────────────────────────────────────────────────────────
type StockStatus = "tersedia" | "menipis" | "habis";
type KategoriMenu = "makanan" | "minuman";

interface Menu {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  stock: StockStatus;
  categori: KategoriMenu;
  variant?: string;
  price: number;
}

// ── Constants ─────────────────────────────────────────────────────
const categories = ["Semua", "makanan", "minuman"];
const sortOptions = ["Nama A-Z", "Harga Terendah", "Harga Tertinggi"];

const categoryLabel: Record<string, string> = {
  makanan: "Makanan",
  minuman: "Minuman",
  Semua: "Semua",
};

// ── Helpers ───────────────────────────────────────────────────────
function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID");
}

function getIconByKategori(kategori: KategoriMenu) {
  return kategori === "makanan" ? Sandwich : Coffee;
}

function StockBadge({ stock }: { stock: StockStatus }) {
  const config = {
    tersedia: {
      label: "Tersedia",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    menipis: {
      label: "Menipis",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    habis: {
      label: "Habis",
      className: "bg-red-100 text-red-600 border-red-200",
    },
  };

  const { label, className } = config[stock];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

function VariantBadge({ variant }: { variant?: string }) {
  if (!variant || variant === "none") return null;
  const config: Record<string, { label: string; className: string }> = {
    ice: {
      label: "🧊 Ice",
      className: "bg-cyan-100 text-cyan-700 border-cyan-200",
    },
    hot: {
      label: "☕ Hot",
      className: "bg-orange-100 text-orange-700 border-orange-200",
    },
    both: {
      label: "🧊☕ Ice / Hot",
      className: "bg-purple-100 text-purple-700 border-purple-200",
    },
  };
  const item = config[variant];
  if (!item) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${item.className}`}
    >
      {item.label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("Nama A-Z");

  // ── Delete menu ─────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "Gagal menghapus menu");
        return;
      }

      setMenus((prev) => prev.filter((menu) => menu.id !== id));
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus menu");
    } finally {
      setDeletingId(null);
    }
  };
  // ── Fetch data dari API ─────────────────────────────────────────
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (activeCategory !== "Semua") params.set("kategori", activeCategory);
      if (search) params.set("search", search);

      const res = await fetch(`/api/menu?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Gagal mengambil data menu");
        return;
      }

      setMenus(json.data);
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // ── Sort di sisi client ─────────────────────────────────────────
  const sorted = [...menus].sort((a, b) => {
    if (sortBy === "Harga Terendah") return a.price - b.price;
    if (sortBy === "Harga Tertinggi") return b.price - a.price;
    return a.title.localeCompare(b.title);
  });

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Menu</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola semua item menu yang tersedia di Serab Coffee
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: "12px" }}
              className="pl-9 bg-card border-border rounded-[12px] shadow-xs focus:ring-primary/20"
            />
          </div>

          {/* Kategori Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                style={{ borderRadius: "12px" }}
                className="gap-2 border-border bg-card text-foreground rounded-[12px] shadow-xs hover:bg-accent/50 px-4"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                {categoryLabel[activeCategory] ?? activeCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-[12px]">
              {categories.map((cat) => (
                <DropdownMenuItem
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={
                    activeCategory === cat ? "font-semibold text-primary" : ""
                  }
                >
                  {categoryLabel[cat]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Urutkan Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                style={{ borderRadius: "12px" }}
                className="gap-2 border-border bg-card text-foreground rounded-[12px] shadow-xs hover:bg-accent/50 px-4"
              >
                <ArrowUpDown className="w-4 h-4 text-primary" />
                Urutkan
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-[12px]">
              {sortOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={sortBy === opt ? "font-semibold text-primary" : ""}
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tambah Menu */}
          <AddMenuDialog />
        </div>

        {/* State: Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Memuat data menu...</span>
          </div>
        )}

        {/* State: Error */}
        {!loading && error && (
          <div className="text-center py-20 space-y-3">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" style={{ borderRadius: "12px" }} className="rounded-[12px] px-5" onClick={fetchMenus}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* State: Empty */}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-[18px] border border-dashed border-border p-8">
            Tidak ada menu yang ditemukan.
          </div>
        )}

        {/* Grid Menu */}
        {!loading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
            {sorted.map((item) => {
              const Icon = getIconByKategori(item.categori);
              return (
                <div
                  key={item.id}
                  style={{ borderRadius: "18px" }}
                  className="shine-card group bg-card/90 backdrop-blur-md border border-border/70 p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="space-y-3.5">
                    {/* Image / Icon area */}
                    <div
                      style={{ borderRadius: "12px" }}
                      className="w-full h-44 bg-muted/60 flex items-center justify-center overflow-hidden relative shadow-inner"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          style={{ borderRadius: "12px" }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Icon
                          className="w-12 h-12 text-muted-foreground/60"
                          strokeWidth={1.5}
                        />
                      )}

                      {/* Overlay Category Tag */}
                      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-[8px] uppercase tracking-wider border border-white/20">
                        {item.categori}
                      </div>
                    </div>

                    {/* Header Info */}
                    <div>
                      <h3 className="font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2 min-h-[2rem] leading-relaxed">
                        {item.description || "Tidak ada deskripsi"}
                      </p>
                    </div>

                    {/* Stok & Varian */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Stok:</span>
                      <StockBadge stock={item.stock} />
                      <VariantBadge variant={item.variant} />
                    </div>
                  </div>

                  {/* Footer: Harga & Action Buttons */}
                  <div className="space-y-3 pt-2 border-t border-border/40">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Harga</span>
                      <p className="text-primary font-extrabold text-xl tracking-tight">
                        {formatRupiah(item.price)}
                      </p>
                    </div>

                    {/* Actions: Edit & Hapus Buttons (Tumpul Membulat / 12px Radius Selaras) */}
                    <div className="flex items-center gap-2.5">
                      <EditMenuDialog
                        menu={item}
                        triggerClassName="h-10 rounded-[12px] font-semibold border-border/80 hover:border-primary/50 hover:bg-primary/10 text-foreground transition-all duration-200 px-4"
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            disabled={deletingId === item.id}
                            style={{ borderRadius: "12px" }}
                            className="flex-1 h-10 rounded-[12px] gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white font-semibold border border-red-500/20 hover:border-red-500 transition-all duration-200 shadow-none hover:shadow-md px-4"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                            {deletingId === item.id ? "Menghapus..." : "Hapus"}
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="rounded-[16px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus menu ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Menu{" "}
                              <span className="font-medium text-foreground">
                                {item.title}
                              </span>{" "}
                              akan dihapus secara permanen dan tidak dapat
                              dikembalikan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel style={{ borderRadius: "9999px" }} className="rounded-full">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              style={{ borderRadius: "9999px" }}
                              className="rounded-full bg-destructive hover:bg-destructive/90 text-white"
                            >
                              Ya, hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
