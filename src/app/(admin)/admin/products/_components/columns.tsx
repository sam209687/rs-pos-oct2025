// src/app/(admin)/admin/products/_components/columns.tsx
"use client"; // Make sure this is at the very top

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { IPopulatedProduct } from "@/lib/models/product"; // Use the populated product type
import { useRouter } from "next/navigation";

export const columns = (
  onDelete: (id: string) => Promise<void>,
  loading: boolean
): ColumnDef<IPopulatedProduct>[] => { // Use the populated product type
  const router = useRouter(); 
  return [
    {
      accessorKey: "productName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "category.name", // ✅ FIX: Use dot notation for the populated field
      header: "Category",
    },
    {
      accessorKey: "stockQuantity",
      header: "Stock Quantity",
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
      cell: ({ row }) => (
        <span>₹{row.original.totalPrice.toFixed(2)}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/products/edit?id=${row.original._id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(row.original._id)}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
};