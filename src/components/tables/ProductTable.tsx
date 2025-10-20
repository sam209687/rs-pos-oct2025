// src/components/tables/ProductTable.tsx
"use client";

import * as React from "react";
import Link from "next/link"; // Added Link
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
import { Loader2, Plus } from "lucide-react"; // Added Loader2 and Plus

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
  
  // 👇 ADDED: State for the button's loading/pending transition
  const [isPending, startTransition] = React.useTransition();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  // Handler for the "Add Product" button click
  const handleAddProductClick = () => {
    startTransition(() => {
      // Logic for client-side navigation or action start
    });
  };

  return (
    <div>
      {/* 👇 MODIFIED: Header Area for Search and Button */}
      {/* Uses flex-col on small screens, flex-row on medium screens, and justify-between for spacing */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between py-4 gap-4">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={
            (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          // Responsive width for search input
          className="w-full md:max-w-sm"
        />

        {/* 👇 ADDED: Add Product Button with Loading State */}
        <Link 
            href="/admin/product/add-product" // Assumed route
            onClick={handleAddProductClick}
            className="w-full md:w-auto" // Ensures full width on mobile
        >
          <Button disabled={isPending} className="w-full md:w-auto">
            {/* Conditional rendering for loading state */}
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </>
            )}
          </Button>
        </Link>
      </div>
      
      {/* 👇 MODIFIED: Table Wrapper for Responsiveness (overflow-x-auto) */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    // Added min-w-[100px] to header cell for better column distribution
                    <TableHead key={header.id} className="min-w-[100px]">
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
                    // Added min-w-[100px] to body cell
                    <TableCell key={cell.id} className="min-w-[100px]">
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

      {/* 👇 MODIFIED: Responsive Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
        
        {/* Page status indicator added for context */}
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
              className="w-24" // Consistent button width for mobile
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-24" // Consistent button width for mobile
            >
              Next
            </Button>
        </div>
      </div>
    </div>
  );
}