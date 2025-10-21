// src/app/(admin)/admin/packingProds/add/page.tsx
import { PackingItemsForm } from '@/components/forms/packingItemsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming common UI components

export default function AddPackingMaterialPage() {
    return (
        <div className="container mx-auto py-8">
            <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Add New Packing Material</CardTitle>
                </CardHeader>
                <CardContent>
                    <PackingItemsForm initialData={null} />
                </CardContent>
            </Card>
        </div>
    );
}