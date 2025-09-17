import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming Shadcn table components

interface DataTableUIProps<TData, TValue> {
  columns: { header: string; accessorKey: keyof TData | string; cell?: (props: { row: TData }) => React.ReactNode }[];
  data: TData[];
  caption?: string;
}

export function DataTableUI<TData, TValue>({ columns, data, caption }: DataTableUIProps<TData, TValue>) {
  return (
    <div className="rounded-md border">
      <Table>
        {caption && <caption className="p-4 text-center">{caption}</caption>}
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
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