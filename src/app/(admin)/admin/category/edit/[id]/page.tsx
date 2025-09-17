import { CategoryForm } from "@/components/forms/CategoryForm";
import { ICategory } from "@/lib/models/category";

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

async function getCategory(id: string): Promise<ICategory> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch category.");
    }

    return res.json();
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
    const category = await getCategory(params.id);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
            <CategoryForm initialData={category} />
        </div>
    );
}