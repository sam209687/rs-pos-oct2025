// src/app/(admin)/admin/variants/add-variant/page.tsx
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getProductsForVariant, getUnitsForVariant } from "@/actions/variant.actions";
import { VariantForm } from "@/components/forms/variant-form";

const AddVariantPage = async () => {
  const productsResult = await getProductsForVariant();
  const unitsResult = await getUnitsForVariant();

  console.log("Products Result:", productsResult);
  console.log("Units Result:", unitsResult);

  const products = productsResult.success ? productsResult.data : [];
  const units = unitsResult.success ? unitsResult.data : [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Create Variant" description="Create a new product variant" />
        <Separator />
        <VariantForm products={products} units={units} />
      </div>
    </div>
  );
};

export default AddVariantPage;