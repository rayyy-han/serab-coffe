import { CreateMenuDTO } from '@/src/types';
import { supabase } from '@/src/utils/supabase/supabase';
import { NextRequest, NextResponse } from 'next/server';


// ── GET: Ambil menu by ID ─────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID menu wajib diisi' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Data menu berhasil diambil', data },
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

