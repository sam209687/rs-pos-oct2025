import { UnitForm } from "@/components/forms/UnitForm";

export default function AddUnitPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add New Unit</h1>
            <UnitForm />
        </div>
    );
}