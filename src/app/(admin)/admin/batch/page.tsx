import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BatchTable } from "@/components/tables/batchTable";
import { getBatches } from "@/actions/batch.actions";

const BatchListPage = async () => {
  const batchesResult = await getBatches();
  const batches = batchesResult.success ? batchesResult.data : [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Batch List" description="View and manage all created batches" />
        <Separator />
        <BatchTable initialBatches={batches} />
      </div>
    </div>
  );
};

export default BatchListPage;