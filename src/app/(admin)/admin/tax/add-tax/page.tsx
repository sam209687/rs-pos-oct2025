import { TaxForm } from "@/components/forms/TaxForm";

export default function AddTaxPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add New Tax</h1>
            <TaxForm />
        </div>
    );
}