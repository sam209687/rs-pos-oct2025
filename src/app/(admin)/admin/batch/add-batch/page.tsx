import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BatchForm } from "@/components/forms/batch-form";

const AddBatchPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Generate Batch" description="Generate and manage product batch numbers" />
        <Separator />
        <BatchForm />
      </div>
    </div>
  );
};

export default AddBatchPage;