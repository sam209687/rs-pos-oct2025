import { getInvoices } from "@/actions/invoice.actions";
import { InvoiceTable } from "@/components/invoice/InvoiceTable";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// This is an async Server Component, which is correct.
// It should NOT have "use client" at the top.
export default async function AdminInvoicePage() {
  const result = await getInvoices();
  
  // Ensure invoices is always an array, even if the fetch fails
  const invoices = result.success && Array.isArray(result.data) ? result.data : [];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href="/admin/pos">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Invoice
          </Link>
        </Button>
      </div>
      {/* It passes the server-fetched data to the "use client" component */}
      <InvoiceTable initialInvoices={invoices} />
    </div>
  );
}