// src/app/(admin)/admin/currency/edit/[id]/page.tsx
import { getCurrencies } from "@/actions/currency.actions";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import CurrencyForm from "@/components/forms/CurrencyForm";

interface EditCurrencyPageProps {
  params: {
    id: string;
  };
}

const EditCurrencyPage = async ({ params }: EditCurrencyPageProps) => {
  const result = await getCurrencies();
  const currencies = result.success ? result.data : [];
  const initialData = currencies.find((c: any) => c._id === params.id) || null;

  if (!initialData) {
    return <div>Currency not found.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Heading title="Edit Currency" description="Update a currency symbol" />
      <Separator />
      <CurrencyForm initialData={initialData} />
    </div>
  );
};

export default EditCurrencyPage;