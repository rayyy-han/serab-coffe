import { CreateMenuDTO } from '@/src/types';
import { supabase } from '@/src/utils/supabase/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body: CreateMenuDTO = await request.json();

    // ── Validasi field wajib ──────────────────────────────────────
    const { title, image_url, stock, categori, price, description } = body;

    if (!title || !image_url || !stock || !categori || !price) {
      return NextResponse.json(
        { success: false, message: 'Field title, image_url, stock, categori, dan price wajib diisi' },
        { status: 400 }
      );
    }

    // ── Validasi nilai enum stock ─────────────────────────────────
    const validStock = ['tersedia', 'menipis', 'habis'];
    if (!validStock.includes(stock)) {
      return NextResponse.json(
        { success: false, message: `Stock tidak valid. Gunakan: ${validStock.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Validasi nilai enum kategori ──────────────────────────────
    const validKategori = ['makanan', 'minuman'];
    if (!validKategori.includes(categori)) {
      return NextResponse.json(
        { success: false, message: `Kategori tidak valid. Gunakan: ${validKategori.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Validasi price ────────────────────────────────────────────
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Price harus berupa angka dan lebih dari 0' },
        { status: 400 }
      );
    }

    // ── Insert ke Supabase ────────────────────────────────────────
    const newMenu = {
      id: uuidv4(),
      title,
      description: description ?? null,
      image_url,
      stock,
      categori,
      price,
    };

    const { data, error } = await supabase
      .from('menu')
      .insert(newMenu)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal menambahkan menu', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Menu berhasil ditambahkan', data },
      { status: 201 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const kategori = searchParams.get('kategori');
    const stock    = searchParams.get('stock');
    const search   = searchParams.get('search');

    let query = supabase
      .from('menu')
      .select('*')
      .eq('is_active', true)            // ← hanya ambil yang aktif
      .order('title', { ascending: true });

    if (kategori) {
      const validKategori = ['makanan', 'minuman'];
      if (!validKategori.includes(kategori)) {
        return NextResponse.json(
          { success: false, message: `Kategori tidak valid. Gunakan: ${validKategori.join(', ')}` },
          { status: 400 }
        );
      }
      query = query.eq('categori', kategori);
    }

    if (stock) {
      const validStock = ['tersedia', 'menipis', 'habis'];
      if (!validStock.includes(stock)) {
        return NextResponse.json(
          { success: false, message: `Stock tidak valid. Gunakan: ${validStock.join(', ')}` },
          { status: 400 }
        );
      }
      query = query.eq('stock', stock);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data menu', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success : true,
        message : 'Data menu berhasil diambil',
        total   : data.length,
        data,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');  // ← ambil id dari query parameter

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Query parameter id wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah menu ada
    const { data: existingMenu, error: findError } = await supabase
      .from('menu')
      .select('id')
      .eq('id', id)
      .single();

    if (findError || !existingMenu) {
      return NextResponse.json(
        { success: false, message: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    const body: Partial<CreateMenuDTO> = await request.json();
    const { title, image_url, stock, categori, price, description } = body;

    // Validasi enum stock jika dikirim
    if (stock !== undefined) {
      const validStock = ['tersedia', 'menipis', 'habis'];
      if (!validStock.includes(stock)) {
        return NextResponse.json(
          { success: false, message: `Stock tidak valid. Gunakan: ${validStock.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validasi enum kategori jika dikirim
    if (categori !== undefined) {
      const validKategori = ['makanan', 'minuman'];
      if (!validKategori.includes(categori)) {
        return NextResponse.json(
          { success: false, message: `Kategori tidak valid. Gunakan: ${validKategori.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validasi price jika dikirim
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json(
        { success: false, message: 'Price harus berupa angka dan lebih dari 0' },
        { status: 400 }
      );
    }

    // Susun field yang akan diupdate (hanya yang dikirim)
    const updatedFields: Partial<CreateMenuDTO> = {};
    if (title       !== undefined) updatedFields.title       = title;
    if (description !== undefined) updatedFields.description = description;
    if (image_url   !== undefined) updatedFields.image_url   = image_url;
    if (stock       !== undefined) updatedFields.stock       = stock;
    if (categori    !== undefined) updatedFields.categori    = categori;
    if (price       !== undefined) updatedFields.price       = price;

    if (Object.keys(updatedFields).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada field yang diupdate' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('menu')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengupdate menu', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Menu berhasil diupdate', data },
      { status: 200 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
// ── DELETE: Hapus menu by Query Parameter (?id=xxx) ───────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Query parameter id wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah menu ada dan masih aktif
    const { data: existingMenu, error: findError } = await supabase
      .from('menu')
      .select('id')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (findError || !existingMenu) {
      return NextResponse.json(
        { success: false, message: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    // Soft delete — set is_active = false
    const { error } = await supabase
      .from('menu')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal menghapus menu', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Menu berhasil dihapus' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}