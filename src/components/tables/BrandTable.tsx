"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { IBrand } from "@/lib/models/brand";
import { useBrandStore } from "@/store/brand.store";
import { useDebounce } from "@/hooks/use-debounce"; 

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface BrandTableProps {
  initialBrands: IBrand[];
}

export function BrandTable({ initialBrands }: BrandTableProps) {
  const { brands, setBrands, deleteBrand } = useBrandStore();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands, setBrands]);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleDelete = (brandId: string, imageUrl: string) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      setDeletingId(brandId);
      startDeleteTransition(() => {
        // Assuming deleteBrand is an async function that handles API call and state update
        deleteBrand(brandId, imageUrl).finally(() => setDeletingId(null));
      });
    }
  };

  return (
    <div className="space-y-4">
        {/* Responsive Search Input: Takes full width on small screens and limits width on larger screens */}
        <Input 
            placeholder="Search by brand name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:max-w-sm" // w-full on mobile, max-w-sm on md and up
        />
        
        {/* Responsive Table Wrapper: Allows horizontal scrolling if the table content exceeds screen width */}
        <div className="rounded-md border overflow-x-auto">
        <Table>
            <TableHeader>
            <TableRow>
                {/* S/No and Image hidden on very small screens for better fit */}
                <TableHead className="w-[60px] hidden sm:table-cell">S/No</TableHead>
                <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead> 
                <TableHead className="min-w-[150px]">Name</TableHead> {/* Ensure minimum width for the name */}
                {/* Action column is kept on the right, compact size */}
                <TableHead className="text-right w-[100px] pr-4">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredBrands.length > 0 ? (
                filteredBrands.map((brand, index) => (
                <TableRow key={brand._id.toString()}>
                    <TableCell className="hidden sm:table-cell">{index + 1}</TableCell>
                    {/* Image hidden on very small screens */}
                    <TableCell className="hidden sm:table-cell">
                    <Image
                        src={brand.imageUrl}
                        alt={brand.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                    />
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="text-right pr-4">
                    {/* Compact Action Buttons with size="icon" and reduced gap */}
                    <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                           <Link href={`/admin/brand/edit/${brand._id}`}>
                                <Pencil className="h-4 w-4" />
                           </Link>
                        </Button>
                        <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8" // Smaller size for mobile
                        onClick={() => handleDelete(brand._id.toString(), brand.imageUrl)}
                        disabled={isDeleting && deletingId === brand._id.toString()}
                        >
                        {isDeleting && deletingId === brand._id.toString() ? (
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
                {/* colSpan is reduced from 4 to 3 on mobile (sm:4) since 2 columns are hidden */}
                <TableCell colSpan={4} className="h-24 text-center sm:col-span-4">
                    No brands found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}