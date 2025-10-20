"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 

interface DataTableUIProps<TData, TValue> {
  columns: { header: string; accessorKey: keyof TData | string; cell?: (props: { row: TData }) => React.ReactNode }[];
  data: TData[];
  caption?: string;
  // Optional prop to set a minimum width for the table content on small screens, 
  // useful if you know the content will be wide.
  minWidth?: string; 
}

export function DataTableUI<TData, TValue>({ columns, data, caption, minWidth = 'min-w-[600px]' }: DataTableUIProps<TData, TValue>) {
  return (
    // 👇 CHANGE 1: Added overflow-x-auto to the wrapper for horizontal scrolling
    <div className="rounded-md border overflow-x-auto">
      {/* 👇 CHANGE 2: Added conditional min-width to the Table element itself 
                       to ensure it doesn't shrink too much on mobile. */}
      <Table style={{ minWidth: minWidth }}> 
        {caption && <caption className="p-4 text-center">{caption}</caption>}
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              // 👇 CHANGE 3: Added minimum width to the header cell to improve column stability
              <TableHead key={index} className="min-w-[100px]">
                  {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  // 👇 CHANGE 4: Added minimum width to the body cell
                  <TableCell key={colIndex} className="min-w-[100px]"> 
                    {column.cell ? column.cell({ row }) : (row[column.accessorKey as keyof TData] as string)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}