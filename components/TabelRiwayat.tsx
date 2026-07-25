"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Loader2,
} from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "./ui/table";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import z from "zod";
import { columns, DraggableRow, schema } from "./data-table";

// ── Props: data & loading opsional. Kalau data null/undefined, ────
// komponen ini fetch data default sendiri (/api/history)
type TabelRiwayatProps = {
  data?: unknown[] | null;
  loading?: boolean;
  onDataChange?: () => void | Promise<void>;
};

export default function TabelRiwayat({
  data: rawDataProp,
  loading: loadingProp,
  onDataChange,
}: TabelRiwayatProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  // ── Data default: dipakai kalau props "data" tidak dikirim (null/undefined) ─
  const usingDefaultData = rawDataProp === null || rawDataProp === undefined;

  const [defaultData, setDefaultData] = useState<unknown[]>([]);
  const [defaultLoading, setDefaultLoading] = useState(true);
  const [defaultError, setDefaultError] = useState<string | null>(null);
  const [historyToDelete, setHistoryToDelete] = useState<{
    id: string;
    menuTitle: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDefaultHistory = useCallback(async () => {
    setDefaultLoading(true);
    setDefaultError(null);
    try {
      const res = await fetch("/api/history");
      const json = await res.json();

      if (!res.ok || !json.success) {
        setDefaultError(json.message || "Gagal mengambil data history");
        return;
      }

      setDefaultData(json.data);
    } catch {
      setDefaultError("Terjadi kesalahan saat mengambil data");
    } finally {
      setDefaultLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usingDefaultData) {
      fetchDefaultHistory();
    }
  }, [usingDefaultData, fetchDefaultHistory]);

  // ── Sumber data & loading efektif: props kalau ada, default kalau tidak ─
  const effectiveRawData = usingDefaultData ? defaultData : (rawDataProp as unknown[]);
  const effectiveLoading = usingDefaultData ? defaultLoading : !!loadingProp;
  const effectiveError = usingDefaultData ? defaultError : null;

  const refreshHistory = async () => {
    if (onDataChange) {
      await onDataChange();
      return;
    }
    await fetchDefaultHistory();
  };

  const handleDeleteHistory = async () => {
    if (!historyToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/history?id=${historyToDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Gagal menghapus data transaksi");
        return;
      }

      setHistoryToDelete(null);
      await refreshHistory();
    } catch {
      alert("Terjadi kesalahan saat menghapus data transaksi");
    } finally {
      setDeleting(false);
    }
  };

  // ── Validasi data dengan schema zod ───────────────────────────────
  const [data, setData] = useState<z.infer<typeof schema>[]>([]);

  const parsedData = useMemo(() => {
    return effectiveRawData
      .map((item: unknown) => {
        const result = schema.safeParse(item);
        return result.success ? result.data : null;
      })
      .filter(Boolean) as z.infer<typeof schema>[];
  }, [effectiveRawData]);

  // ── Grouping: gabungkan transaksi dengan menu yang sama ───────────
  // Transaksi yang memiliki id_menu & history_type yang sama akan dijumlahkan quantity-nya
  const groupedData = useMemo(() => {
    const map = new Map<string, z.infer<typeof schema>>();

    for (const item of parsedData) {
      // key: id_menu + history_type agar penjualan & pembelian tetap terpisah
      const key = `${item.id_menu}__${item.history_type}`;
      if (map.has(key)) {
        const existing = map.get(key)!;
        map.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        map.set(key, { ...item });
      }
    }

    return Array.from(map.values());
  }, [parsedData]);

  // ── Sinkronkan hasil grouped ke state lokal ────────────────────────
  useEffect(() => {
    setData(groupedData);
  }, [groupedData]);

  // ── Drag & drop ─────────────────────────────────────────────────
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onDeleteHistory: (id: string, menuTitle: string) => setHistoryToDelete({ id, menuTitle }),
    },
  });

  // ── Render: Loading ─────────────────────────────────────────────
  if (effectiveLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Memuat data riwayat...</span>
      </div>
    );
  }

  // ── Render: Error (hanya berlaku untuk fetch data default) ──────
  if (effectiveError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-destructive text-sm">{effectiveError}</p>
        <Button variant="outline" onClick={fetchDefaultHistory}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  // ── Render: Tabel ───────────────────────────────────────────────
  return (
    <>
      <div className="overflow-hidden rounded-[8px] border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Belum ada riwayat transaksi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <AlertDialog
        open={Boolean(historyToDelete)}
        onOpenChange={(open) => !open && !deleting && setHistoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data transaksi ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Data riwayat untuk <span className="font-medium text-foreground">{historyToDelete?.menuTitle}</span>{" "}
              akan dihapus permanen dari tabel transaksi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleDeleteHistory}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Menghapus..." : "Hapus permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
