// src/app/(admin)/admin/variants/edit-variant/page.tsx

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getVariantById } from '@/actions/variant.actions'; // Server action to fetch data
import VariantForm from "@/components/forms/variant-form"; // Your client component

interface EditVariantPageProps {
  params: {
    id: string; // The ID of the variant to edit, e.g., 68f4853c92ccbdfed87c44ae
  };
}

const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export default async function EditVariantPage({ params }: EditVariantPageProps) {
  // 1. Fetch the existing variant data based on the route ID
  const result = await getVariantById(params.id);

  // 2. Determine initialData: pass the fetched object or null if fetch failed
  const initialData = result.success ? result.data : null;
  
  // 3. Determine the heading and description
  const title = initialData ? "Edit Variant" : "Add Variant";
  const description = initialData ? `Edit existing variant: ${params.id}` : "Could not load variant data, defaulting to add mode.";

  // Render the form, passing the fetched data to trigger 'Edit Mode'
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <Suspense fallback={<Loading />}>
        {/* 4. PASS THE initialData PROP. This is what switches the form. */}
        <VariantForm initialData={initialData} />
      </Suspense>
    </>
  );
}