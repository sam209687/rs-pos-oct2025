import { UnitForm } from "@/components/forms/UnitForm";
import { IUnit } from "@/lib/models/unit";

interface EditUnitPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

async function getUnit(id: string): Promise<IUnit> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/unit/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch unit.");
    }

    return res.json();
}

export default async function EditUnitPage({ params }: EditUnitPageProps) {
    const unit = await getUnit(params.id);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Unit</h1>
            <UnitForm initialData={unit} />
        </div>
    );
}