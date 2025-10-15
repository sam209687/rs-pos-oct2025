import { auth } from "@/lib/auth";
import { getInvoices } from "@/actions/invoice.actions";
import { InvoiceTable } from "@/components/invoice/InvoiceTable";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function CashierInvoicePage() {
  // 1. Fetch the session on the server to check the user's role.
  const session = await auth();

  // 2. Protect the route to ensure only cashiers can access it.
  if (!session || session.user.role !== 'cashier') {
    redirect('/auth');
  }

  // 3. Fetch all invoices using your existing server action.
  const result = await getInvoices();
  const invoices = result.success && Array.isArray(result.data) ? result.data : [];

  // 4. Render the reusable InvoiceTable component with the fetched data.
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href="/cashier/pos">
            <PlusCircle className="h-4 w-4 mr-2" />
            Go to POS
          </Link>
        </Button>
      </div>
      <InvoiceTable initialInvoices={invoices} />
    </div>
  );
}