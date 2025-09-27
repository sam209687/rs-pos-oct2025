"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { IBatch } from "@/lib/models/batch";
import { useBatchStore } from "@/store/batch.store";
import { useDebounce } from "@/hooks/use-debounce";
import { deleteBatch } from "@/actions/batch.actions";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

interface BatchTableProps {
  initialBatches: IBatch[];
}

export function BatchTable({ initialBatches }: BatchTableProps) {
  const { batches, setBatches } = useBatchStore();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBatches(initialBatches);
  }, [initialBatches, setBatches]);

  const filteredBatches = batches.filter((batch: IBatch) =>
    batch.batchNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    batch.vendorName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleDelete = (batchId: string) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      setDeletingId(batchId);
      startDeleteTransition(() => {
        deleteBatch(batchId).finally(() => setDeletingId(null));
      });
    }
  };

  const handleAddBatchClick = () => {
    startTransition(() => {
      // This will handle the page transition
    });
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Input
                placeholder="Search by batch number or vendor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Link href="/admin/batch/add-batch" onClick={handleAddBatchClick}>
                <Button disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Batch
                        </>
                    )}
                </Button>
            </Link>
        </div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[80px]">S/No</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredBatches.length > 0 ? (
                filteredBatches.map((batch: IBatch, index: number) => (
                <TableRow key={batch._id.toString()}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                    <TableCell>{batch.vendorName}</TableCell>
                    <TableCell>{batch.qty}</TableCell>
                    <TableCell>₹ {(batch.price ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/batch/edit/${batch._id}`}>
                           <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                           </Button>
                        </Link>
                        <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(batch._id.toString())}
                        disabled={isDeleting && deletingId === batch._id.toString()}
                        >
                        {isDeleting && deletingId === batch._id.toString() ? (
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
                <TableCell colSpan={6} className="h-24 text-center">
                    No batches found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}