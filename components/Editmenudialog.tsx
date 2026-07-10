"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Edit, ImagePlus, X, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
type StockStatus  = "tersedia" | "menipis" | "habis";
type KategoriMenu = "makanan" | "minuman";

interface Menu {
  id         : string;
  title      : string;
  description?: string | null;
  image_url  : string;
  stock      : StockStatus;
  categori   : KategoriMenu;
  price      : number;
}

interface FormData {
  title      : string;
  categori   : string;
  description: string;
  stock      : string;
  price      : string;
  image_url  : string;
}

interface FormErrors {
  title    ?: string;
  categori ?: string;
  stock    ?: string;
  price    ?: string;
  image_url?: string;
}

// ── Options ───────────────────────────────────────────────────────
const kategoriOptions = [
  { label: "Makanan", value: "makanan" },
  { label: "Minuman", value: "minuman" },
];

const stockOptions = [
  { label: "Tersedia", value: "tersedia" },
  { label: "Menipis",  value: "menipis"  },
  { label: "Habis",    value: "habis"    },
];

// ── Combobox ──────────────────────────────────────────────────────
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
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
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

// ── Dropzone Image ────────────────────────────────────────────────
interface ImageDropzoneProps {
  preview  : string | null;
  onDrop   : (file: File) => void;
  onRemove : () => void;
  error    ?: string;
}

function ImageDropzone({ preview, onDrop, onRemove, error }: ImageDropzoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onDrop(acceptedFiles[0]);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop  : handleDrop,
    accept  : { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize : 5 * 1024 * 1024,
  });

  if (preview) {
    return (
      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
        error && "border-destructive"
      )}
    >
      <input {...getInputProps()} />
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <ImagePlus className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isDragActive ? "Lepaskan gambar di sini" : "Drag & drop gambar"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">atau klik untuk memilih file</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — Maks. 5MB</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
interface EditMenuDialogProps {
  menu      : Menu;
  onSuccess ?: () => void;
}

export default function EditMenuDialog({ menu, onSuccess }: EditMenuDialogProps) {
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [preview, setPreview]     = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors]       = useState<FormErrors>({});

  const [form, setForm] = useState<FormData>({
    title      : "",
    categori   : "",
    description: "",
    stock      : "",
    price      : "",
    image_url  : "",
  });

  // ── Isi form dengan data menu yang ada saat dialog dibuka ───────
  useEffect(() => {
    if (open) {
      setForm({
        title      : menu.title,
        categori   : menu.categori,
        description: menu.description ?? "",
        stock      : menu.stock,
        price      : String(menu.price),
        image_url  : menu.image_url,
      });
      setPreview(menu.image_url || null);
      setImageFile(null);
      setErrors({});
    }
  }, [open, menu]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageDrop = (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image_url: undefined }));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setPreview(null);
  };

  const resetForm = () => {
    setForm({ title: "", categori: "", description: "", stock: "", price: "", image_url: "" });
    setPreview(null);
    setImageFile(null);
    setErrors({});
  };

  // ── Validasi ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title    = "Nama menu wajib diisi";
    if (!form.categori)     newErrors.categori = "Kategori wajib dipilih";
    if (!form.stock)        newErrors.stock    = "Stok wajib dipilih";
    if (!form.price)        newErrors.price    = "Harga wajib diisi";
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0)
                            newErrors.price    = "Harga harus berupa angka lebih dari 0";
    if (!preview)           newErrors.image_url = "Gambar wajib diupload";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Jika ada file baru di-upload, upload dulu ke storage
      let imageUrl = preview ?? menu.image_url;

      if (imageFile) {
        const fileExt  = imageFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const fd       = new FormData();
        fd.append("file",     imageFile);
        fd.append("fileName", fileName);

        const uploadRes  = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok || !uploadJson.success) {
          alert(uploadJson.message || "Gagal mengupload gambar");
          return;
        }

        imageUrl = uploadJson.url;
      }

      // ── Kirim PUT ke /api/menu?id=xxx ─────────────────────────
      const res = await fetch(`/api/menu?id=${menu.id}`, {
        method : "PUT",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          title      : form.title.trim(),
          image_url  : imageUrl,
          stock      : form.stock,
          categori   : form.categori,
          price      : Number(form.price),
          description: form.description.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "Gagal mengupdate menu");
        return;
      }

      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (err) {
      alert("Terjadi kesalahan saat mengupdate menu");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 border-border text-foreground hover:bg-muted"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Nama Menu <span className="text-destructive">*</span></Label>
            <Input
              id="edit-title"
              placeholder="Contoh: Nasi Goreng Spesial"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={cn(errors.title && "border-destructive")}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <Label>Kategori <span className="text-destructive">*</span></Label>
            <Combobox
              value={form.categori}
              onChange={(val) => handleChange("categori", val)}
              options={kategoriOptions}
              placeholder="Pilih kategori"
              error={errors.categori}
            />
            {errors.categori && <p className="text-xs text-destructive">{errors.categori}</p>}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">
              Deskripsi <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Tulis deskripsi menu..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <Label>Stok <span className="text-destructive">*</span></Label>
            <Combobox
              value={form.stock}
              onChange={(val) => handleChange("stock", val)}
              options={stockOptions}
              placeholder="Pilih status stok"
              error={errors.stock}
            />
            {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-price">Harga <span className="text-destructive">*</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
              <Input
                id="edit-price"
                inputMode="numeric"
                placeholder="0"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value.replace(/\D/g, ""))}
                className={cn("pl-9", errors.price && "border-destructive")}
              />
            </div>
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>

          {/* Image Dropzone */}
          <div className="space-y-1.5">
            <Label>Gambar Menu <span className="text-destructive">*</span></Label>
            <ImageDropzone
              preview={preview}
              onDrop={handleImageDrop}
              onRemove={handleImageRemove}
              error={errors.image_url}
            />
            {errors.image_url && <p className="text-xs text-destructive">{errors.image_url}</p>}
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
                <Edit className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}