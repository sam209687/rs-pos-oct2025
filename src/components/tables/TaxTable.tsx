"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ITax } from "@/lib/models/tax";
import { useTaxStore } from "@/store/tax.store";
import { useDebounce } from "@/hooks/use-debounce"; 

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface TaxTableProps {
  initialTaxes: ITax[];
}

export function TaxTable({ initialTaxes }: TaxTableProps) {
  const { taxes, setTaxes, deleteTax } = useTaxStore();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setTaxes(initialTaxes);
  }, [initialTaxes, setTaxes]);

  const filteredTaxes = taxes.filter((tax) =>
    tax.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    tax.hsn.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleDelete = (taxId: string) => {
    if (window.confirm("Are you sure you want to delete this tax?")) {
      setDeletingId(taxId);
      startDeleteTransition(() => {
        deleteTax(taxId).finally(() => setDeletingId(null));
      });
    }
  };

  return (
    <div className="space-y-4">
        <Input 
            placeholder="Search by tax name or HSN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[80px]">S/No</TableHead>
                <TableHead>Tax Name</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead>GST (%)</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredTaxes.length > 0 ? (
                filteredTaxes.map((tax, index) => (
                <TableRow key={tax._id.toString()}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>{tax.hsn}</TableCell>
                    <TableCell>{tax.gst}%</TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                           <Link href={`/admin/tax/edit/${tax._id.toString()}`}>
                                <Pencil className="h-4 w-4" />
                           </Link>
                        </Button>
                        <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(tax._id.toString())}
                        disabled={isDeleting && deletingId === tax._id.toString()}
                        >
                        {isDeleting && deletingId === tax._id.toString() ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No taxes found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}