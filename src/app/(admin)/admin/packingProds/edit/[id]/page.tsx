// src/app/(admin)/admin/packingProds/edit/[id]/page.tsx
import { PackingItemsForm } from '@/components/forms/packingItemsForm';
import { getPackingMaterialById } from '@/actions/packingMaterial.actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditPageProps {
    params: {
        id: string;
    };
}

export default async function EditPackingMaterialPage({ params }: EditPageProps) {
    const materialId = params.id;
    
    // Fetch the specific material data
    const materialResult = await getPackingMaterialById(materialId);

    if (!materialResult.success || !materialResult.data) {
        // Handle case where material ID is invalid or not found
        notFound();
    }

    const initialData = materialResult.data;

    return (
        <div className="container mx-auto py-8">
             <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Edit Packing Material</CardTitle>
                </CardHeader>
                <CardContent>
                    <PackingItemsForm initialData={initialData} />
                </CardContent>
            </Card>
        </div>
    );
}