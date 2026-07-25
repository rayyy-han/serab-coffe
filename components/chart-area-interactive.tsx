"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Transaction = {
  created_at: string;
  history_type: "penjualan" | "pembelian";
};

type ChartPoint = {
  date: string;
  penjualan: number;
};

const chartConfig = {
  penjualan: {
    label: "Penjualan",
    color: "oklch(0.58 0.12 55)",
  },
} satisfies ChartConfig;

function getDaysInRange(timeRange: string) {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - 1 - index));
    return date.toISOString().slice(0, 10);
  });
}

function createChartData(transactions: Transaction[], timeRange: string) {
  const dailyData = new Map<string, ChartPoint>();

  for (const date of getDaysInRange(timeRange)) {
    dailyData.set(date, { date, penjualan: 0 });
  }

  for (const transaction of transactions) {
    if (transaction.history_type === "penjualan" || !transaction.history_type) {
      const date = transaction.created_at.slice(0, 10);
      const point = dailyData.get(date);
      if (point) point.penjualan += 1;
    }
  }

  return Array.from(dailyData.values());
}

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch("/api/history");
        const result = await response.json();
        if (response.ok && result.success) {
          setTransactions(result.data);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const chartData = React.useMemo(
    () => createChartData(transactions, timeRange),
    [transactions, timeRange],
  );
  const totalPenjualan = chartData.reduce(
    (total, item) => total + item.penjualan,
    0,
  );
  const periodLabel = timeRange === "7d" ? "7 hari" : timeRange === "30d" ? "30 hari" : "3 bulan";

  return (
    <Card className="@container/card shine-card transition-all duration-300 hover:shadow-xl border-border/80">
      <CardHeader>
        <CardTitle>Grafik Penjualan</CardTitle>
        <CardDescription>
          {isLoading
            ? "Memuat data penjualan..."
            : `${totalPenjualan.toLocaleString("id-ID")} transaksi penjualan dalam ${periodLabel}`}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 bulan</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 hari</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 hari</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-36 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih periode transaksi"
            >
              <SelectValue placeholder="3 bulan" />
            </SelectTrigger>
            <SelectContent className="rounded-[8px]">
              <SelectItem value="90d">3 bulan</SelectItem>
              <SelectItem value="30d">30 hari</SelectItem>
              <SelectItem value="7d">7 hari</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-penjualan)" stopOpacity={0.48} />
                <stop offset="95%" stopColor="var(--color-penjualan)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="penjualan"
              type="monotone"
              fill="url(#fillSales)"
              stroke="var(--color-penjualan)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
