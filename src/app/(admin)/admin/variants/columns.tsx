// src/app/(admin)/admin/variants/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { deleteVariant, generateVariantQRCode } from "@/actions/variant.actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { IPopulatedVariant } from "@/lib/models/variant";

export const columns: ColumnDef<IPopulatedVariant>[] = [
  {
    accessorKey: "productName", // ✅ CORRECTED: Use the top-level 'productName'
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return row.original.product.productName;
    }
  },
  {
    accessorKey: "variantColor",
    header: "Color",
    cell: ({ row }) => {
      return row.original.variantColor;
    }
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return formatted;
    },
  },
  {
    accessorKey: "variantVolume",
    header: "Volume",
    cell: ({ row }) => {
      return `${row.original.variantVolume} ${row.original.unit.name}`;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [isPending, startTransition] = useTransition();
      const router = useRouter();

      const onDelete = async (id: string) => {
        startTransition(async () => {
          const result = await deleteVariant(id);
          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        });
      };
      
      const onGenerateQRCode = async (id: string) => {
        startTransition(async () => {
          const result = await generateVariantQRCode(id);
          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <span className="h-4 w-4">...</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/admin/variants/edit/${row.original._id}`)}
              disabled={isPending}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onGenerateQRCode(row.original._id)}
              disabled={isPending}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original._id)}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];