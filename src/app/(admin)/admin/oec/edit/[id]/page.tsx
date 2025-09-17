// src/app/(admin)/admin/oec/edit/[id]/page.tsx
import { notFound } from "next/navigation";
import { getOecById } from "@/actions/oec.actions";
import { OecForm } from "@/components/forms/oec-form";

interface EditOecPageProps {
  params: {
    id: string;
  };
}

export default async function EditOecPage({ params }: EditOecPageProps) {
  const { id } = params;
  const result = await getOecById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const initialData = result.data;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit OEC</h2>
      </div>
      <OecForm initialData={initialData} />
    </div>
  );
}