export type StockStatus = 'tersedia' | 'menipis' | 'habis';
export type KategoriMenu = 'makanan' | 'minuman';
export type VariantMenu = 'ice' | 'hot' | 'both' | 'none';

export interface Menu {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  stock: StockStatus;
  categori: KategoriMenu;
  variant?: VariantMenu;
  price: number;
}

export interface CreateMenuDTO {
  title: string;
  description?: string | null;
  image_url: string;
  stock: StockStatus;
  categori: KategoriMenu;
  variant?: VariantMenu;
  price: number;
}