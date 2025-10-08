// src/app/(admin)/admin/variants/add-variant/page.tsx
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
// ✅ FIX: Change the named import back to a default import
import VariantForm from "@/components/forms/variant-form";

const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export default function AddVariantPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Add Variant" description="Add a new product variant." />
      </div>
      <Separator />
      <Suspense fallback={<Loading />}>
        <VariantForm />
      </Suspense>
    </>
  );
}