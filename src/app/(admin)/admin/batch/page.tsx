// src/app/(admin)/admin/batch/page.tsx
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getProductsForBatch } from "@/actions/batch.actions";
import { BatchForm } from "@/components/forms/batch-form";

const BatchPage = async () => {
  const productsResult = await getProductsForBatch();
  const products = productsResult.success ? productsResult.data : [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Generate Batch" description="Generate and manage product batch numbers" />
        <Separator />
        <BatchForm products={products} />
      </div>
    </div>
  );
};

export default BatchPage;