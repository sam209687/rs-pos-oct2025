"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ICategory } from "@/lib/models/category";
import { useCategoryStore } from "@/store/category.store";
import { useDebounce } from "@/hooks/use-debounce"; 

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface CategoryTableProps {
  initialCategories: ICategory[];
}

export function CategoryTable({ initialCategories }: CategoryTableProps) {
  const { categories, setCategories, deleteCategory } = useCategoryStore();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories, setCategories]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleDelete = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setDeletingId(categoryId);
      startDeleteTransition(() => {
        deleteCategory(categoryId).finally(() => setDeletingId(null));
      });
    }
  };

  return (
    <div className="space-y-4">
        <Input 
            placeholder="Search by category name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[80px]">S/No</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                <TableRow key={category._id.toString()}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                           <Link href={`/admin/category/edit/${category._id.toString()}`}>
                                <Pencil className="h-4 w-4" />
                           </Link>
                        </Button>
                        <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(category._id.toString())}
                        disabled={isDeleting && deletingId === category._id.toString()}
                        >
                        {isDeleting && deletingId === category._id.toString() ? (
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
                <TableCell colSpan={3} className="h-24 text-center">
                    No categories found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}