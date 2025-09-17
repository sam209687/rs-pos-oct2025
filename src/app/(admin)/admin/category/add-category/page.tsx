import { CategoryForm } from "@/components/forms/CategoryForm";

export default function AddCategoryPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
            <CategoryForm />
        </div>
    );
}