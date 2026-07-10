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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>

          {/* Kategori Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-border bg-card text-foreground"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {categoryLabel[activeCategory] ?? activeCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
                className="gap-2 border-border bg-card text-foreground"
              >
                <ArrowUpDown className="w-4 h-4" />
                Urutkan
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memuat data menu...</span>
          </div>
        )}

        {/* State: Error */}
        {!loading && error && (
          <div className="text-center py-20 space-y-3">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={fetchMenus}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* State: Empty */}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Tidak ada menu yang ditemukan.
          </div>
        )}

        {/* Grid Menu */}
        {!loading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((item) => {
              const Icon = getIconByKategori(item.categori);
              return (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                  {/* Image / Icon area */}
                  <div className="w-full h-28 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Icon
                        className="w-10 h-10 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-base">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm capitalize">
                      {item.description}
                    </p>
                  </div>

                  {/* Stok */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Stok:</span>
                    <StockBadge stock={item.stock} />
                  </div>

                  {/* Harga */}
                  <p className="text-primary font-bold text-lg">
                    {formatRupiah(item.price)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <EditMenuDialog menu={item} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          disabled={deletingId === item.id}
                          className="flex-1 gap-1.5 bg-destructive hover:bg-destructive/90 text-white"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash className="w-3.5 h-3.5" />
                          )}
                          {deletingId === item.id ? "Menghapus..." : "Hapus"}
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
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
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            Ya, hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
