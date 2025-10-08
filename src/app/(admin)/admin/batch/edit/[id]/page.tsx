// src/app/(admin)/admin/batch/edit/[id]/page.tsx
import { getBatchById } from "@/actions/batch.actions";
import { BatchForm } from "@/components/forms/batch-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface EditBatchPageProps {
  params: {
    id: string;
  };
}

const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export default async function EditBatchPage({ params }: EditBatchPageProps) {
  const { id } = params;
  const result = await getBatchById(id);

  if (!result.success || !result.data) {
    // If the batch is not found, redirect to the main batch page
    redirect("/admin/batch");
  }

  const initialData = result.data;

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Edit Batch" description="Update the details of this batch." />
      </div>
      <Separator />
      <Suspense fallback={<Loading />}>
        <BatchForm initialData={initialData} />
      </Suspense>
    </>
  );
}