// src/app/(admin)/admin/store-settings/edit/[id]/page.tsx
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getStores } from "@/actions/store.actions";
import { StoreForm } from "@/components/forms/StoreForm";

interface EditStorePageProps {
  params: {
    id: string;
  };
}

const EditStorePage = async ({ params }: EditStorePageProps) => {
  const result = await getStores();
  const stores = result.success ? result.data : [];
  const initialData = stores.find((store: any) => store._id === params.id) || null;

  if (!initialData) {
    return <div>Store not found.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Heading title="Edit Store" description="Update a store setting" />
      <Separator />
      <StoreForm initialData={initialData} />
    </div>
  );
};

export default EditStorePage;