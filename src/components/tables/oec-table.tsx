"use client";

import { useEffect } from "react";
import { DataTable } from "../ui/data-table";
import { Loader2 } from "lucide-react";
import { columns } from "@/app/(admin)/admin/oec/columns";
import { useOecStore } from "@/store/oecStore";

export function OecTable() {
  const { oecs, isLoading, fetchOecs } = useOecStore();

  useEffect(() => {
    fetchOecs();
  }, [fetchOecs]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <DataTable columns={columns} data={oecs} searchKey="productName" />;
}