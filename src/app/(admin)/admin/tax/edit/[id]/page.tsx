import { TaxForm } from "@/components/forms/TaxForm";
import { ITax } from "@/lib/models/tax";

interface EditTaxPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

async function getTax(id: string): Promise<ITax> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tax/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch tax.");
    }

    return res.json();
}

export default async function EditTaxPage({ params }: EditTaxPageProps) {
    const tax = await getTax(params.id);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Tax</h1>
            <TaxForm initialData={tax} />
        </div>
    );
}