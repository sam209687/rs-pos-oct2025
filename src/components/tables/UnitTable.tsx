"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { IUnit } from "@/lib/models/unit";
import { useUnitStore } from "@/store/unit.store";
import { useDebounce } from "@/hooks/use-debounce"; 

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface UnitTableProps {
  initialUnits: IUnit[];
}

export function UnitTable({ initialUnits }: UnitTableProps) {
  const { units, setUnits, deleteUnit } = useUnitStore();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setUnits(initialUnits);
  }, [initialUnits, setUnits]);

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleDelete = (unitId: string) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setDeletingId(unitId);
      startDeleteTransition(() => {
        deleteUnit(unitId).finally(() => setDeletingId(null));
      });
    }
  };

  return (
    <div className="space-y-4">
        <Input 
            placeholder="Search by unit name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[80px]">S/No</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredUnits.length > 0 ? (
                filteredUnits.map((unit, index) => (
                <TableRow key={unit._id.toString()}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                           <Link href={`/admin/unit/edit/${unit._id.toString()}`}>
                                <Pencil className="h-4 w-4" />
                           </Link>
                        </Button>
                        <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(unit._id.toString())}
                        disabled={isDeleting && deletingId === unit._id.toString()}
                        >
                        {isDeleting && deletingId === unit._id.toString() ? (
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
                    No units found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}