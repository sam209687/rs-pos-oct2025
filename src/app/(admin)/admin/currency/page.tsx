// src/app/(admin)/admin/currency/page.tsx
import { getCurrencies } from "@/actions/currency.actions";
// import { columns } from "@/app/(admin)/admin/currency/columns";
import { columns } from "./columns";
// import { DataTable } from "@/components/ui/data-table"; // Assuming you have a generic DataTable component
import { DataTable } from "@/components/tables/CurrencyTable";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CurrencyPage = async () => {
  const result = await getCurrencies();
  const data = result.success ? result.data : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Currency Settings"
          description="Manage your currency symbols and S/No."
        />
        <Button asChild>
          <Link href="/admin/currency/add">
            <Plus className="mr-2 h-4 w-4" /> Add Currency
          </Link>
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="currencySymbol" />
    </div>
  );
};

export default CurrencyPage;