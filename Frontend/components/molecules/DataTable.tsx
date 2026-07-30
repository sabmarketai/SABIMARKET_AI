"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DataPagination } from "./DataPagination";

// ---------- Types ----------

export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig<T> = {
  key: keyof T;
  label: string;
  options: FilterOption[];
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  isLoading?: boolean;

  // pagination
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;

  // row selection
  selectable?: boolean;
  getRowId?: (row: T) => string | number; // defaults to row index if omitted
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;

  // search + column filters (controlled — hook these up to your query/state)
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig<T>[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;

  emptyMessage?: string;
  className?: string;
};

// ---------- Component ----------

export function DataTable<T>({
  columns,
  data,
  actions,
  isLoading,
  total,
  page,
  pageSize = 10,
  onPageChange,
  selectable = false,
  getRowId,
  selectedIds = [],
  onSelectionChange,
  searchable = false,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  emptyMessage = "No results found",
  className,
}: DataTableProps<T>) {
  const hasPagination =
    total !== undefined && page !== undefined && onPageChange !== undefined;
  const hasToolbar = searchable || (filters && filters.length > 0);

  const colSpan = columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0);

  const rowId = React.useCallback(
    (row: T, index: number): string | number =>
      getRowId ? getRowId(row) : index,
    [getRowId],
  );

  const allIds = React.useMemo(
    () => data.map((row, i) => rowId(row, i)),
    [data, rowId],
  );

  const allSelected =
    selectable &&
    data.length > 0 &&
    allIds.every((id) => selectedIds.includes(id));
  const someSelected =
    selectable && !allSelected && allIds.some((id) => selectedIds.includes(id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      const merged = new Set([...selectedIds, ...allIds]);
      onSelectionChange(Array.from(merged));
    }
  };

  const toggleRow = (id: string | number) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="max-w-xs"
            />
          )}
          {filters?.map((filter) => (
            <select
              key={String(filter.key)}
              value={filterValues?.[String(filter.key)] ?? ""}
              onChange={(e) =>
                onFilterChange?.(String(filter.key), e.target.value)
              }
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column, i) => (
                <TableHead key={i} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: colSpan }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center">
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-lg">—</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {emptyMessage}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const id = rowId(row, rowIndex);
                const isSelected = selectedIds.includes(id);
                return (
                  <TableRow
                    key={id}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => {
                      const value = row[column.accessor];
                      return (
                        <TableCell
                          key={colIndex}
                          className={cn("max-w-[200px]", column.className)}
                        >
                          <div className="truncate">
                            {column.render
                              ? column.render(value, row)
                              : (value as React.ReactNode)}
                          </div>
                        </TableCell>
                      );
                    })}
                    {actions && (
                      <TableCell className="text-right">
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {hasPagination && (
        <div className="py-2">
          <DataPagination
            page={page!}
            total={total!}
            pageSize={pageSize}
            onPageChange={onPageChange!}
          />
        </div>
      )}
    </div>
  );
}
