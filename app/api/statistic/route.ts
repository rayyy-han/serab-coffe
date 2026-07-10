import { supabase } from '@/src/utils/supabase/supabase'
import { NextRequest, NextResponse } from 'next/server'


/**
 * =====================================================================================
 * GET /api/reports/monthly?month=2026-06
 * =====================================================================================
 * Menghasilkan data untuk "Laporan Bulanan":
 *   1. Ringkasan total: total transaksi, total pendapatan, item terjual, rata-rata transaksi
 *   2. Komposisi menu terlaris (top 3 + persentase, sisanya digabung jadi "Lainnya")
 *   3. Ringkasan bulanan: hari operasional, rata-rata/hari, menu paling laris,
 *      menu jarang dipesan, jam puncak
 *
 * ASUMSI PENTING (sesuaikan dengan kondisi database Anda):
 * -------------------------------------------------------------------------------------
 * 1. Karena tabel `history` tidak memiliki kolom order/transaction id terpisah,
 *    setiap BARIS di `history` dianggap sebagai SATU transaksi untuk satu menu,
 *    dengan `quantity` = jumlah item menu tsb yang terjual pada transaksi itu.
 *    -> total transaksi = COUNT(history.id)
 *    -> total item terjual = SUM(history.quantity)
 *    -> total pendapatan = SUM(history.quantity * menu.price)
 *
 * 2. `history_type_enum` diasumsikan punya nilai yang menandakan "penjualan"
 *    (berbeda dari misalnya restock/retur). Ganti konstanta SALE_TYPE di bawah
 *    sesuai nilai enum yang sebenarnya ada di database Anda.
 *
 * 3. "Jam puncak" dihitung sebagai window 3 jam berurutan dengan jumlah transaksi
 *    terbanyak (agar formatnya seperti "10:00 - 13:00").
 * =====================================================================================
 */

// TODO: sesuaikan dengan value enum history_type_enum yang merepresentasikan penjualan
const SALE_TYPE = 'penjualan'

interface HistoryRow {
  id: string
  id_menu: string
  quantity: number
  created_at: string
  menu: { id: string; title: string; price: number } | { id: string; title: string; price: number }[] | null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get('month') // format: 'YYYY-MM', mis. '2026-06'

    const now = new Date()
    const [year, month] = monthParam
      ? monthParam.split('-').map(Number)
      : [now.getFullYear(), now.getMonth() + 1]

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Parameter 'month' tidak valid. Gunakan format YYYY-MM, contoh: 2026-06" },
        { status: 400 }
      )
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 1)) // awal bulan berikutnya (exclusive)

    // Ambil seluruh transaksi penjualan bulan ini beserta data menu terkait
    const { data: rows, error } = await supabase
      .from('history')
      .select(
        `
        id,
        id_menu,
        quantity,
        history_type,
        created_at,
        menu:menu!fk_history_menu (
          id,
          title,
          price
        )
      `
      )
      .eq('history_type', SALE_TYPE)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())

    if (error) throw error

    if (!rows || rows.length === 0) {
      return NextResponse.json(buildEmptyReport(year, month))
    }

    // ---------------------------------------------------------------------------------
    // 1. Ringkasan total
    // ---------------------------------------------------------------------------------
    let totalTransaksi = 0
    let totalPendapatan = 0
    let totalItemTerjual = 0

    const menuAgg = new Map<string, { title: string; qty: number }>()
    const operationalDays = new Set<string>()
    const hourCount = new Array(24).fill(0)

    for (const row of rows as unknown as HistoryRow[]) {
      const menu = Array.isArray(row.menu) ? row.menu[0] : row.menu
      const price = menu?.price ?? 0
      const qty = row.quantity ?? 0

      totalTransaksi += 1
      totalItemTerjual += qty
      totalPendapatan += qty * price

      // agregasi per menu untuk komposisi terlaris
      const existing = menuAgg.get(row.id_menu)
      if (existing) {
        existing.qty += qty
      } else {
        menuAgg.set(row.id_menu, { title: menu?.title ?? 'Tidak diketahui', qty })
      }

      // hari operasional (tanggal unik dengan minimal 1 transaksi)
      operationalDays.add(row.created_at.slice(0, 10))

      // distribusi jam untuk menentukan jam puncak
      const hour = new Date(row.created_at).getUTCHours()
      hourCount[hour] += 1
    }

    const rataRataTransaksi = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0
    const hariOperasional = operationalDays.size
    const rataRataPerHari = hariOperasional > 0 ? totalTransaksi / hariOperasional : 0

    // ---------------------------------------------------------------------------------
    // 2. Komposisi menu terlaris (top 3 + persentase, sisanya "Lainnya")
    // ---------------------------------------------------------------------------------
    const menuArray = Array.from(menuAgg.entries())
      .map(([id, v]) => ({ id, title: v.title, qty: v.qty }))
      .sort((a, b) => b.qty - a.qty)

    const totalQtyAllMenu = menuArray.reduce((sum, m) => sum + m.qty, 0)
    const top3 = menuArray.slice(0, 3)
    const top3QtySum = top3.reduce((sum, m) => sum + m.qty, 0)

    const komposisiMenuTerlaris = [
      ...top3.map((m) => ({
        title: m.title,
        qty: m.qty,
        percentage: totalQtyAllMenu > 0 ? round1((m.qty / totalQtyAllMenu) * 100) : 0,
      })),
      {
        title: 'Lainnya',
        qty: totalQtyAllMenu - top3QtySum,
        percentage:
          totalQtyAllMenu > 0 ? round1(((totalQtyAllMenu - top3QtySum) / totalQtyAllMenu) * 100) : 0,
      },
    ]

    // ---------------------------------------------------------------------------------
    // 3. Menu paling laris & paling jarang dipesan + jam puncak
    // ---------------------------------------------------------------------------------
    const menuPalingLaris = menuArray[0]?.title ?? '-'
    const menuJarangDipesan = menuArray[menuArray.length - 1]?.title ?? '-'
    const jamPuncak = getPeakHourRange(hourCount)

    return NextResponse.json({
      periode: `${monthName(month)} ${year}`,
      ringkasanTotal: {
        totalTransaksi,
        totalPendapatan,
        totalItemTerjual,
        rataRataTransaksi: Math.round(rataRataTransaksi),
      },
      komposisiMenuTerlaris,
      ringkasanBulanan: {
        hariOperasional,
        rataRataPerHari: Math.round(rataRataPerHari),
        menuPalingLaris,
        menuJarangDipesan,
        jamPuncak,
      },
    })
  } catch (err: any) {
    console.error('[GET /api/reports/monthly] Error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// =======================================================================================
// Helpers
// =======================================================================================

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function monthName(m: number) {
  const names = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return names[m - 1]
}

/** Cari window 3 jam berurutan dengan total transaksi terbanyak, mis. "10:00 - 13:00" */
function getPeakHourRange(hourCount: number[]) {
  let bestStart = 0
  let bestSum = -1
  for (let h = 0; h < 24; h++) {
    const sum = hourCount[h] + (hourCount[h + 1] ?? 0) + (hourCount[h + 2] ?? 0)
    if (sum > bestSum) {
      bestSum = sum
      bestStart = h
    }
  }
  const end = Math.min(bestStart + 3, 24)
  return `${pad(bestStart)}:00 - ${pad(end)}:00`
}

function buildEmptyReport(year: number, month: number) {
  return {
    periode: `${monthName(month)} ${year}`,
    ringkasanTotal: {
      totalTransaksi: 0,
      totalPendapatan: 0,
      totalItemTerjual: 0,
      rataRataTransaksi: 0,
    },
    komposisiMenuTerlaris: [],
    ringkasanBulanan: {
      hariOperasional: 0,
      rataRataPerHari: 0,
      menuPalingLaris: '-',
      menuJarangDipesan: '-',
      jamPuncak: '-',
    },
  }
}