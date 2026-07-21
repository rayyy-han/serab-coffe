"use client";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // npm install file-saver

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Download,
  PieChart,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";

// ── Tipe data sesuai response GET /api/statistic ────────────────────────────
interface StatisticResponse {
  periode: string;
  ringkasanTotal: {
    totalTransaksi: number;
    totalPendapatan: number;
    totalItemTerjual: number;
    rataRataTransaksi: number;
  };
  komposisiMenuTerlaris: {
    title: string;
    qty: number;
    percentage: number;
  }[];
  ringkasanBulanan: {
    hariOperasional: number;
    rataRataPerHari: number;
    menuPalingLaris: string;
    menuJarangDipesan: string;
    jamPuncak: string;
  };
}

// ── Palet warna donut (4 slot: 3 menu teratas + "Lainnya") ──────────────────
const DONUT_COLORS = [
  "red",
  "#2596be",
  "#24bfb2",
  "#d1f022",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Ambil parameter month (YYYY-MM) berdasarkan tanggal saat ini di browser */
function getCurrentMonthParam() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatRupiah(value: number) {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}Jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function buildChartConfig(items: { title: string }[]): ChartConfig {
  const config: ChartConfig = {};
  items.forEach((item, index) => {
    config[`menu${index}`] = {
      label: item.title,
      color: DONUT_COLORS[index] ?? DONUT_COLORS[DONUT_COLORS.length - 1],
    };
  });
  return config;
}

// ── Page Component ───────────────────────────────────────────────────────────
export default function ReportPage() {
  const [data, setData] = useState<StatisticResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatistic() {
      try {
        setLoading(true);
        setError(null);

        const month = getCurrentMonthParam(); // dihitung dari tanggal saat pengambilan
        const res = await fetch(`/api/statistic?month=${month}`);

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? `Gagal memuat data (status ${res.status})`,
          );
        }

        const json: StatisticResponse = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    }

    fetchStatistic();
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat laporan...
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-sm text-destructive text-center">
          Gagal memuat laporan{error ? `: ${error}` : ""}.
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Transaksi",
      value: formatNumber(data.ringkasanTotal.totalTransaksi),
    },
    {
      label: "Total Pendapatan",
      value: formatRupiah(data.ringkasanTotal.totalPendapatan),
    },
    {
      label: "Item Terjual",
      value: formatNumber(data.ringkasanTotal.totalItemTerjual),
    },
    {
      label: "Rata-rata Transaksi",
      value: formatRupiah(data.ringkasanTotal.rataRataTransaksi),
    },
  ];

  const ringkasan = [
    { label: "Hari Operasional", value: `30 hari` },
    {
      label: "Rata-rata/hari",
      value: `${data.ringkasanBulanan.rataRataPerHari} transaksi`,
    },
    {
      label: "Menu paling laris",
      value: data.ringkasanBulanan.menuPalingLaris,
    },
    {
      label: "Menu jarang pesan",
      value: data.ringkasanBulanan.menuJarangDipesan,
    },
    { label: "Jam puncak", value: data.ringkasanBulanan.jamPuncak },
  ];

  const chartConfig = buildChartConfig(data.komposisiMenuTerlaris);
  const menuData = data.komposisiMenuTerlaris.map((item, index) => ({
    name: item.title,
    value: item.percentage,
    fill: `var(--color-menu${index})`,
  }));
  const handleExport = async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Sistem Kasir";
    wb.created = new Date();

    const HEADER_FILL: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2E75B6" },
    };
    const SUBHEADER_FILL: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E7F5" },
    };
    const TITLE_FILL: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };
    const WHITE_BOLD: Partial<ExcelJS.Font> = {
      name: "Arial",
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 12,
    };
    const THIN_BORDER: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FFB7B7B7" } },
      left: { style: "thin", color: { argb: "FFB7B7B7" } },
      bottom: { style: "thin", color: { argb: "FFB7B7B7" } },
      right: { style: "thin", color: { argb: "FFB7B7B7" } },
    };

    // ================= SHEET 1: RINGKASAN =================
    const wsRingkasan = wb.addWorksheet("Ringkasan", {
      views: [{ showGridLines: false }],
    });
    wsRingkasan.columns = [{ width: 30 }, { width: 24 }];

    // Judul
    wsRingkasan.mergeCells("A1:B1");
    const title = wsRingkasan.getCell("A1");
    title.value = `LAPORAN PENJUALAN - ${data.periode.toUpperCase()}`;
    title.font = {
      name: "Arial",
      bold: true,
      size: 16,
      color: { argb: "FFFFFFFF" },
    };
    title.fill = TITLE_FILL;
    title.alignment = { horizontal: "center", vertical: "middle" };
    wsRingkasan.getRow(1).height = 28;

    // Section: Ringkasan Total
    wsRingkasan.mergeCells("A3:B3");
    wsRingkasan.getCell("A3").value = "RINGKASAN TOTAL";
    wsRingkasan.getCell("A3").font = WHITE_BOLD;
    wsRingkasan.getCell("A3").fill = HEADER_FILL;
    wsRingkasan.getCell("A3").alignment = { vertical: "middle", indent: 1 };
    wsRingkasan.getRow(3).height = 20;

    const headerRow = wsRingkasan.addRow(["Metrik", "Nilai"]);
    headerRow.eachCell((cell) => {
      cell.font = { name: "Arial", bold: true };
      cell.fill = SUBHEADER_FILL;
      cell.border = THIN_BORDER;
    });

    const totalRows: [string, number, string][] = [
      ["Total Transaksi", data.ringkasanTotal.totalTransaksi, "#,##0"],
      [
        "Total Pendapatan (Rp)",
        data.ringkasanTotal.totalPendapatan,
        '"Rp"#,##0',
      ],
      ["Total Item Terjual", data.ringkasanTotal.totalItemTerjual, "#,##0"],
      [
        "Rata-rata per Transaksi (Rp)",
        data.ringkasanTotal.rataRataTransaksi,
        '"Rp"#,##0',
      ],
    ];

    totalRows.forEach(([label, value, fmt]) => {
      const row = wsRingkasan.addRow([label, value]);
      row.getCell(1).font = { name: "Arial" };
      row.getCell(2).font = { name: "Arial" };
      row.getCell(2).numFmt = fmt;
      row.eachCell((cell) => (cell.border = THIN_BORDER));
    });

    // Section: Ringkasan Bulanan
    wsRingkasan.addRow([]);
    const sectionRowIdx = wsRingkasan.lastRow!.number + 1;
    wsRingkasan.mergeCells(`A${sectionRowIdx}:B${sectionRowIdx}`);
    wsRingkasan.getCell(`A${sectionRowIdx}`).value = "RINGKASAN BULANAN";
    wsRingkasan.getCell(`A${sectionRowIdx}`).font = WHITE_BOLD;
    wsRingkasan.getCell(`A${sectionRowIdx}`).fill = HEADER_FILL;
    wsRingkasan.getCell(`A${sectionRowIdx}`).alignment = {
      vertical: "middle",
      indent: 1,
    };
    wsRingkasan.getRow(sectionRowIdx).height = 20;

    const headerRow2 = wsRingkasan.addRow(["Metrik", "Nilai"]);
    headerRow2.eachCell((cell) => {
      cell.font = { name: "Arial", bold: true };
      cell.fill = SUBHEADER_FILL;
      cell.border = THIN_BORDER;
    });

    const monthlyRows: [string, string | number][] = [
      ["Hari Operasional", data.ringkasanBulanan.hariOperasional],
      ["Rata-rata Transaksi per Hari", data.ringkasanBulanan.rataRataPerHari],
      ["Menu Paling Laris", data.ringkasanBulanan.menuPalingLaris],
      ["Menu Jarang Dipesan", data.ringkasanBulanan.menuJarangDipesan],
      ["Jam Puncak Penjualan", data.ringkasanBulanan.jamPuncak],
    ];

    monthlyRows.forEach(([label, value]) => {
      const row = wsRingkasan.addRow([label, value]);
      row.eachCell((cell) => {
        cell.font = { name: "Arial" };
        cell.border = THIN_BORDER;
      });
    });

    // ================= SHEET 2: MENU TERLARIS =================
    const wsMenu = wb.addWorksheet("Menu Terlaris", {
      views: [{ showGridLines: false }],
    });
    wsMenu.columns = [{ width: 32 }, { width: 18 }, { width: 18 }];

    wsMenu.mergeCells("A1:C1");
    const menuTitle = wsMenu.getCell("A1");
    menuTitle.value = `KOMPOSISI MENU TERLARIS - ${data.periode.toUpperCase()}`;
    menuTitle.font = {
      name: "Arial",
      bold: true,
      size: 16,
      color: { argb: "FFFFFFFF" },
    };
    menuTitle.fill = TITLE_FILL;
    menuTitle.alignment = { horizontal: "center", vertical: "middle" };
    wsMenu.getRow(1).height = 28;

    const menuHeaderRow = wsMenu.addRow([
      "Nama Menu",
      "Qty Terjual",
      "Persentase (%)",
    ]);
    menuHeaderRow.eachCell((cell) => {
      cell.font = WHITE_BOLD;
      cell.fill = HEADER_FILL;
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    wsMenu.getRow(menuHeaderRow.number).height = 20;

    data.komposisiMenuTerlaris.forEach((m) => {
      const row = wsMenu.addRow([m.title, m.qty, m.percentage / 100]);
      row.getCell(1).font = { name: "Arial" };
      row.getCell(2).font = { name: "Arial" };
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(3).font = { name: "Arial" };
      row.getCell(3).numFmt = "0.0%";
      row.getCell(3).alignment = { horizontal: "center" };
      row.eachCell((cell) => (cell.border = THIN_BORDER));
    });

    // Baris total pakai formula, bukan angka statis
    const firstDataRow = menuHeaderRow.number + 1;
    const lastDataRow = wsMenu.lastRow!.number;
    const totalRow = wsMenu.addRow([
      "Total",
      { formula: `SUM(B${firstDataRow}:B${lastDataRow})` },
      { formula: `SUM(C${firstDataRow}:C${lastDataRow})` },
    ]);
    totalRow.eachCell((cell) => {
      cell.font = { name: "Arial", bold: true };
      cell.fill = SUBHEADER_FILL;
      cell.border = THIN_BORDER;
    });
    totalRow.getCell(2).alignment = { horizontal: "center" };
    totalRow.getCell(3).numFmt = "0.0%";
    totalRow.getCell(3).alignment = { horizontal: "center" };

    // ================= EXPORT FILE =================
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Laporan_Penjualan_${data.periode}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Laporan Bulanan
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Rekap performa {data.periode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-card border-border text-foreground"
            >
              <CalendarDays className="w-4 h-4" />
              {data.periode}
            </Button>
            <Button
              onClick={handleExport}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label} className="bg-card border-border">
              <CardContent className="p-4 space-y-1">
                <p className="text-2xl font-bold text-foreground leading-tight">
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Bottom Section: Donut + Ringkasan ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Komposisi Menu Terlaris */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <PieChart className="w-4 h-4 text-primary" />
                Komposisi Menu Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-4">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[240px] w-full"
              >
                <RechartsPieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <span className="text-xs">
                            {chartConfig[name as keyof typeof chartConfig]
                              ?.label ?? name}
                            : <strong>{value}%</strong>
                          </span>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={menuData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    strokeWidth={2}
                    stroke="var(--card)"
                  >
                    {menuData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={
                      <ChartLegendContent
                        nameKey="name"
                        className="text-xs flex-col items-start gap-1"
                      />
                    }
                  />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Ringkasan Bulanan */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClipboardList className="w-4 h-4 text-primary" />
                Ringkasan Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {ringkasan.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Export Footer ── */}
      </div>
    </div>
  );
}
