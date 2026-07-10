"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/src/utils/cn"

// ── Types ─────────────────────────────────────────────────────────
interface Menu {
  id       : string;
  title    : string;
  price    : number;
  stock    : string;
  categori : string;
}

interface FormData {
  menu_id         : string;
  history_type    : string;
  quantity        : string;
  price_per_portion: string;
}

interface FormErrors {
  menu_id         ?: string;
  history_type    ?: string;
  quantity        ?: string;
  price_per_portion?: string;
}

// ── Options ───────────────────────────────────────────────────────
const historyTypeOptions = [
  { label: "Pembelian", value: "pembelian" },
  { label: "Penjualan", value: "penjualan" },
];

// ── Combobox Menu ─────────────────────────────────────────────────
interface MenuComboboxProps {
  menus      : Menu[];
  value      : string;
  onChange   : (id: string, price: number) => void;
  loading    : boolean;
  error      ?: string;
}

function MenuCombobox({ menus, value, onChange, loading, error }: MenuComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = menus.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
        >
          {loading
            ? "Memuat data menu..."
            : selected
            ? selected.title
            : "Pilih menu"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari nama menu..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Memuat..." : "Menu tidak ditemukan."}
            </CommandEmpty>
            <CommandGroup>
              {menus.map((menu) => (
                <CommandItem
                  key={menu.id}
                  value={menu.title}
                  onSelect={() => {
                    onChange(menu.id === value ? "" : menu.id, menu.price);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === menu.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{menu.title}</span>
                    <span className="text-xs text-muted-foreground">
                      Rp {menu.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Combobox Generic ──────────────────────────────────────────────
interface ComboboxProps {
  value      : string;
  onChange   : (value: string) => void;
  options    : { label: string; value: string }[];
  placeholder: string;
  error      ?: string;
}

function Combobox({ value, onChange, options, placeholder, error }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Cari ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(val) => {
                    onChange(val === value ? "" : val);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Main Component ────────────────────────────────────────────────
interface AddTransactionDialogProps {
  onSuccess?: () => void;
}

export default function AddTransactionDialog({ onSuccess }: AddTransactionDialogProps) {
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menus, setMenus]         = useState<Menu[]>([]);
  const [errors, setErrors]       = useState<FormErrors>({});

  const [form, setForm] = useState<FormData>({
    menu_id          : "",
    history_type     : "",
    quantity         : "",
    price_per_portion: "0",
  });

  // ── Total otomatis ─────────────────────────────────────────────
  const totalHarga =
    (Number(form.quantity) || 0) * (Number(form.price_per_portion) || 0);

  // ── Fetch menu saat dialog dibuka ─────────────────────────────
  useEffect(() => {
    if (!open) return;

    const fetchMenus = async () => {
      setMenuLoading(true);
      try {
        const res  = await fetch("/api/menu");
        const json = await res.json();
        if (json.success) setMenus(json.data);
      } catch {
        setMenus([]);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenus();
  }, [open]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleMenuChange = (id: string, price: number) => {
    setForm((prev) => ({
      ...prev,
      menu_id          : id,
      price_per_portion: id ? String(price) : "0",
    }));
    if (errors.menu_id) setErrors((prev) => ({ ...prev, menu_id: undefined }));
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setForm({ menu_id: "", history_type: "", quantity: "", price_per_portion: "0" });
    setErrors({});
  };

  // ── Validasi ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.menu_id)       newErrors.menu_id      = "Menu wajib dipilih";
    if (!form.history_type)  newErrors.history_type = "Tipe transaksi wajib dipilih";
    if (!form.quantity)      newErrors.quantity     = "Jumlah porsi wajib diisi";
    else if (Number(form.quantity) <= 0)
                             newErrors.quantity     = "Jumlah porsi harus lebih dari 0";
    if (!form.price_per_portion || Number(form.price_per_portion) <= 0)
                             newErrors.price_per_portion = "Harga per porsi harus lebih dari 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/history", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          id_menu      : form.menu_id,
          history_type : form.history_type,
          quantity     : Number(form.quantity),
          price_per_portion: Number(form.price_per_portion),
          total_price  : totalHarga,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "Gagal menambahkan transaksi");
        return;
      }

      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch {
      alert("Terjadi kesalahan saat menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* 1. Pilih Menu */}
          <div className="space-y-1.5">
            <Label>Nama Menu <span className="text-destructive">*</span></Label>
            <MenuCombobox
              menus={menus}
              value={form.menu_id}
              onChange={handleMenuChange}
              loading={menuLoading}
              error={errors.menu_id}
            />
            {errors.menu_id && (
              <p className="text-xs text-destructive">{errors.menu_id}</p>
            )}
          </div>

          {/* 2. Tipe Transaksi */}
          <div className="space-y-1.5">
            <Label>Tipe Transaksi <span className="text-destructive">*</span></Label>
            <Combobox
              value={form.history_type}
              onChange={(val) => handleChange("history_type", val)}
              options={historyTypeOptions}
              placeholder="Pilih tipe transaksi"
              error={errors.history_type}
            />
            {errors.history_type && (
              <p className="text-xs text-destructive">{errors.history_type}</p>
            )}
          </div>

          {/* 3. Jumlah Porsi & Harga Per Porsi */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">
                Jumlah Porsi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                inputMode="numeric"
                placeholder="0"
                value={form.quantity}
                onChange={(e) =>
                  handleChange("quantity", e.target.value.replace(/\D/g, ""))
                }
                className={cn(errors.quantity && "border-destructive")}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price_per_portion">
                Harga Per Porsi <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="price_per_portion"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.price_per_portion}
                  onChange={(e) =>
                    handleChange(
                      "price_per_portion",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className={cn(
                    "pl-9",
                    errors.price_per_portion && "border-destructive"
                  )}
                />
              </div>
              {errors.price_per_portion && (
                <p className="text-xs text-destructive">
                  {errors.price_per_portion}
                </p>
              )}
            </div>
          </div>

          {/* 4. Total Harga (readonly, otomatis) */}
          <div className="space-y-1.5">
            <Label htmlFor="total">Total Harga</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <Input
                id="total"
                value={totalHarga.toLocaleString("id-ID")}
                readOnly
                className="pl-9 bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Jumlah porsi × harga per porsi
            </p>
          </div>

        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => { setOpen(false); resetForm(); }}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Simpan Transaksi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}