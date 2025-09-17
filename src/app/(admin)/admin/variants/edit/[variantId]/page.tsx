// src/app/(admin)/admin/variants/edit/[variantId]/page.tsx

import { getVariantById, getProductsForVariant, getUnitsForVariant } from "@/actions/variant.actions";
import { VariantForm } from "@/components/forms/variant-form";
import { notFound } from "next/navigation";
import { IProduct } from "@/lib/models/product";
import { IUnit } from "@/lib/models/unit";

// ✅ FIX: Destructure `variantId` directly in the function signature
export default async function VariantEditPage({ params: { variantId } }: { params: { variantId: string } }) {
  // The 'variantId' constant is now directly available, no need for the line below
  // const { variantId } = params; 

  const productsResult = await getProductsForVariant();
  const unitsResult = await getUnitsForVariant();
  const variantResult = await getVariantById(variantId); // This now works correctly

  if (!variantResult.success) {
    console.error(variantResult.message);
    notFound();
  }

  const products = productsResult.success ? productsResult.data as IProduct[] : [];
  const units = unitsResult.success ? unitsResult.data as IUnit[] : [];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Update Variant</h2>
      </div>
      <VariantForm products={products} units={units} initialData={variantResult.data} />
    </div>
  );
};