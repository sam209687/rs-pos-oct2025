// src/components/tables/CurrencyTable.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    // Set initial page size for responsiveness (e.g., show fewer rows on small screens)
    initialState: {
        pagination: {
            pageSize: 10, // Default page size
        },
    },
    state: {
      columnFilters,
    },
  });

  return (
    <div>
      {/* Responsive Header/Search Area */}
      {/* Search Input takes full width on small screens */}
      <div className="flex items-center py-4">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={
            (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          // 👇 CHANGE: Added w-full for mobile responsiveness
          className="w-full md:max-w-sm"
        />
      </div>
      
      {/* Responsive Table Wrapper */}
      {/* 👇 CHANGE: Added overflow-x-auto for horizontal scrolling */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // If you have a column that is purely aesthetic or less critical, 
                  // you can hide it here using a class like 'hidden sm:table-cell'.
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    // Similar to the header, you can conditionally hide cells here if needed.
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  // Note: colSpan={columns.length} ensures it spans all columns, 
                  // even if some are hidden via CSS, which is good practice.
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Responsive Pagination Controls */}
      {/* 👇 CHANGE: Changed layout to flex-col on small screens and justify-between for better button spacing */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
        
        {/* Optional: Add a small screen status indicator */}
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
             Page {table.getState().pagination.pageIndex + 1} of{" "}
             {table.getPageCount()}
        </div>

        {/* Pagination Buttons */}
        <div className="flex space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-24" // Ensures consistent width for better mobile layout
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-24" // Ensures consistent width for better mobile layout
            >
              Next
            </Button>
        </div>
      </div>
    </div>
  );
}