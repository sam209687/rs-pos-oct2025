// src/app/(admin)/admin/variants/add-variant/page.tsx
import VariantForm from "@/components/forms/variant-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// import { VariantForm } from "@/components/forms/variant-form";

const AddVariantPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Create Variant" description="Create a new product variant" />
        <Separator />
        <VariantForm />
      </div>
    </div>
  );
};

export default AddVariantPage;