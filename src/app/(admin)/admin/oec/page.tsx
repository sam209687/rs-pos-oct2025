// src/app/(admin)/admin/oec/page.tsx
import { Button } from "@/components/ui/button";
import { OecTable } from "@/components/tables/oec-table";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function OecPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Oil Expeller Charges</h2>
        <div className="hidden md:flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/oec/add-oec">
              <PlusCircle className="mr-2 h-4 w-4" /> Add OEC
            </Link>
          </Button>
        </div>
      </div>
      <OecTable />
    </div>
  );
}