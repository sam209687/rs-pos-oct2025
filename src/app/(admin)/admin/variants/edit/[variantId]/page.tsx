// src/app/(admin)/admin/variants/edit/[variantId]/page.tsx
import { getVariantById } from "@/actions/variant.actions";
import VariantForm from "@/components/forms/variant-form";
// import { VariantForm } from "@/components/forms/variant-form";
import { notFound } from "next/navigation";

export default async function VariantEditPage({ params: { variantId } }: { params: { variantId: string } }) {
  const variantResult = await getVariantById(variantId);

  if (!variantResult.success) {
    console.error(variantResult.message);
    notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Update Variant</h2>
      </div>
      <VariantForm initialData={variantResult.data} />
    </div>
  );
};