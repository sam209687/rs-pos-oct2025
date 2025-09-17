// src/components/uies/table/tableui.tsx
// (Assuming you have imports for Table, TableBody, TableCell, TableHead, TableHeader, TableRow from '@/components/ui/table')
// (Assuming you have cn utility)

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // Adjust path if different
import { cn } from '@/lib/utils'; // Adjust path if different
import React from 'react';

// Define a generic type for the table data item
interface ColumnDef<T> {
  key: keyof T | string; // Key in the data item, or a string for custom columns
  header: string;
  // Optional render function for custom cell content
  render?: (item: T) => React.ReactNode;
}

// Update TableUIProps to include renderRowWrapper
interface TableUIProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  renderActions?: (item: T) => React.ReactNode; // Function to render action buttons
  rowKey: keyof T | string; // A unique key for each row (e.g., '_id')
  // New prop: A function to wrap the TableRow, allowing external components to apply refs/classes
  renderRowWrapper?: (
    item: T,
    defaultCells: React.ReactNode // The default <td> elements rendered by TableUI
  ) => React.ReactElement;
}

export function TableUI<T extends { [key: string]: any }>({
  data,
  columns,
  renderActions,
  rowKey,
  renderRowWrapper, // Destructure the new prop
}: TableUIProps<T>) {
  return (
    <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            {columns.map((column, index) => (
              <TableHead key={column.key.toString() + index} className="text-gray-700 dark:text-gray-200">
                {column.header}
              </TableHead>
            ))}
            {renderActions && (
              <TableHead className="text-gray-700 dark:text-gray-200 text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (renderActions ? 1 : 0)} className="h-24 text-center text-gray-500 dark:text-gray-400">
                No data available.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              // Prepare default cells
              const defaultCells = (
                <>
                  {columns.map((column, colIndex) => (
                    <TableCell key={column.key.toString() + colIndex} className="text-gray-800 dark:text-gray-100">
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end space-x-2">
                        {renderActions(item)}
                      </div>
                    </TableCell>
                  )}
                </>
              );

              // Use renderRowWrapper if provided, otherwise render a default TableRow
              if (renderRowWrapper) {
                return renderRowWrapper(item, defaultCells);
              } else {
                return (
                  <TableRow key={item[rowKey]} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {defaultCells}
                  </TableRow>
                );
              }
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}