"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { IBatch } from "@/lib/models/batch";
import { IPopulatedProduct } from "@/lib/models/product";
import { useBatchStore, IPopulatedBatch } from "@/store/batch.store";
import { useDebounce } from "@/hooks/use-debounce";
import { deleteBatch } from "@/actions/batch.actions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { IPopulatedVariant } from "@/lib/models/variant";

// The IPopulatedBatch interface is now imported from the store.
// We'll define a temporary type for the prop to prevent a circular dependency.
type BatchTableProps = {
  initialBatches: IPopulatedBatch[];
};

export function BatchTable({ initialBatches }: BatchTableProps) {
  const { batches, setBatches } = useBatchStore();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isPending, startTransition] = useTransition();
  const [selectedBatchForReport, setSelectedBatchForReport] = useState<IPopulatedBatch | null>(null);

  useEffect(() => {
    setBatches(initialBatches);
  }, [initialBatches, setBatches]);

  const filteredBatches = batches.filter((batch: IPopulatedBatch) =>
    (batch.batchNumber?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase()) ||
    (batch.vendorName?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase()) ||
    (batch.product?.productName?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase())
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

  const handleOpenReport = (batch: IPopulatedBatch) => {
    setSelectedBatchForReport(batch);
  };

  const handlePrint = () => {
    if (!selectedBatchForReport) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    // We no longer need to call renderReport here, just ensure the styles are good
    const contentString = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Report</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 1rem; font-size: 14px; line-height: 1.5; }
            h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
            strong { font-weight: bold; }
            .space-y-2 > p + p { margin-top: 0.5rem; }
            .text-xl { font-size: 1.25rem; }
            .font-extrabold { font-weight: 800; }
            .rounded-md { border-radius: 0.375rem; }
            .border { border: 1px solid #e5e7eb; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb; }
            thead tr { background-color: #f9fafb; }
            .flex { display: flex; }
            .justify-end { justify-content: flex-end; }
            .gap-2 { gap: 0.5rem; }
            .p-6 { padding: 1.5rem; }
          </style>
        </head>
        <body>
          <div id="report-content">${document.getElementById("report-content")?.innerHTML}</div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(contentString);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const renderReport = () => {
    if (!selectedBatchForReport) return null;

    const { product, variant, vendorName, batchNumber, qty, price, oilExpelled, createdAt } = selectedBatchForReport;
    const date = new Date(createdAt).toLocaleDateString();

    const seedsConsumed = (qty && oilExpelled) ? qty / oilExpelled : 0;
    const purchasePricePerKg = (price && qty) ? price / qty : 0;
    
    // Round down to one decimal place for calculations
    const roundedSeedsConsumed = Math.floor(seedsConsumed * 10) / 10;
    
    // New calculation for Oil Price / Ltr
    const oilPricePerLtr = purchasePricePerKg * roundedSeedsConsumed;
    
    // Fallback if product or sellingPrice is null/undefined
    const sellingPricePerLtr = (product?.sellingPrice ?? 0) / 2;
    const priceOfSeedsConsumed = sellingPricePerLtr * roundedSeedsConsumed;
    
    // Additional charges are now on the variant
    const additionalCharges = (variant?.packingCharges ?? 0) + (variant?.laborCharges ?? 0) + (variant?.electricityCharges ?? 0) + (variant?.others1 ?? 0) + (variant?.others2 ?? 0);
    const finalSellingPrice = additionalCharges + priceOfSeedsConsumed;

    return (
      <div id="report-content" className="p-6">
        <h2 className="text-2xl font-bold mb-4">Detail Summary of this Batch</h2>
        <div className="space-y-2 mb-6">
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Vendor Name:</strong> {vendorName}</p>
          <p><strong>Product Name:</strong> {product?.productName}</p> {/* Use optional chaining */}
          <p><strong>Batch Number:</strong> <span className="text-xl font-extrabold">{batchNumber}</span></p>
        </div>
        <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto for table on small screens */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Qty Purchased</TableCell>
                <TableCell>{qty} kg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price</TableCell>
                <TableCell>₹ {price?.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Oil Expelled (In Ltr)</TableCell>
                <TableCell>{oilExpelled} Ltrs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Seeds consumed to produce per litre oil</TableCell>
                <TableCell>{seedsConsumed.toFixed(2)} kg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Purchase Price per kg</TableCell>
                <TableCell>₹ {purchasePricePerKg.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Oil Price / Ltr</TableCell>
                <TableCell>₹ {oilPricePerLtr.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Selling Price / Ltr</TableCell>
                <TableCell>₹ {sellingPricePerLtr.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price of ({roundedSeedsConsumed.toFixed(2)} kg)</TableCell>
                <TableCell>₹ {priceOfSeedsConsumed.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Final Selling Price</TableCell>
                <TableCell>₹ {finalSellingPrice.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {/* Buttons are outside the print area so they are not duplicated in the print content string */}
        {/* They are placed in the DialogContent wrapper which already contains print-related classes */}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Responsive Header:
        - On small screens (sm:), the items will stack (flex-col) and the search input will take full width (w-full).
        - On medium screens and up (md:), they will be side-by-side (md:flex-row) and space-between (justify-between).
      */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Input
          placeholder="Search by batch, vendor or product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // On mobile, take full width. On medium screens, limit the width.
          className="w-full md:max-w-sm"
        />
        <Link href="/admin/batch/add-batch" onClick={handleAddBatchClick} className="w-full md:w-auto">
          {/* Ensure the button also takes full width on small screens for better touch targets */}
          <Button disabled={isPending} className="w-full md:w-auto">
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

      {/* Responsive Table:
        - The `overflow-x-auto` wrapper ensures the table can be horizontally scrolled on small screens if it's too wide.
      */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Hide S/No on small screens to save space */}
              <TableHead className="w-[80px] hidden sm:table-cell">S/No</TableHead>
              {/* Always show Batch Number and Product Name */}
              <TableHead className="min-w-[120px]">Batch Number</TableHead>
              {/* Show Vendor Name on medium screens and up */}
              <TableHead className="hidden md:table-cell min-w-[150px]">Vendor Name</TableHead>
              <TableHead className="min-w-[150px]">Product Name</TableHead>
              {/* Show Quantity and Price on small screens, but give them a minimum width */}
              <TableHead className="min-w-[80px]">Quantity</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[100px]">Price</TableHead>
              {/* Actions column: always present, but ensure buttons are compact */}
              <TableHead className="text-right w-[120px] pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch: IPopulatedBatch, index: number) => (
                <TableRow key={batch._id.toString()}>
                  <TableCell className="hidden sm:table-cell">{index + 1}</TableCell>
                  <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                  <TableCell className="hidden md:table-cell">{batch.vendorName}</TableCell>
                  <TableCell>{batch.product?.productName}</TableCell>
                  <TableCell>
                    {batch.qty} kg
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">₹ {(batch.price ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right pr-4">
                    {/* Compact Action Buttons with `size="icon"` */}
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/batch/edit/${batch._id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(batch._id.toString())}
                        disabled={isDeleting && deletingId === batch._id.toString()}
                      >
                        {isDeleting && deletingId === batch._id.toString() ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenReport(batch)}
                        disabled={!batch.oilExpelled}
                        title={!batch.oilExpelled ? "Cannot generate report. Oil Expelled field is empty." : "Generate Report"}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No batches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Responsive Dialog:
        - sm:max-w-[800px] ensures it doesn't get too wide on large screens.
        - max-h-[90vh] and overflow-y-auto ensure it fits on smaller screens and is scrollable.
      */}
      <Dialog open={!!selectedBatchForReport} onOpenChange={(open) => !open && setSelectedBatchForReport(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Report</DialogTitle>
          </DialogHeader>
          <div className="no-print">
            <p className="text-sm text-muted-foreground">This is a summary of the batch details and key metrics.</p>
          </div>
          <Separator />
          {/* The report content is rendered here */}
          {renderReport()}
          {/* Place print/close buttons outside the renderReport function but inside DialogContent */}
          <div className="flex justify-end gap-2 mt-4 no-print">
            <Button onClick={handlePrint} className="no-print">Print</Button>
            <Button variant="outline" onClick={() => setSelectedBatchForReport(null)} className="no-print">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      <style jsx global>
        {`
          @media print {
            body > * {
              display: none !important;
            }
            #report-content, #report-content * {
              display: block !important;
            }
            /* Add some spacing for better print readability */
            #report-content {
              width: 100%;
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}