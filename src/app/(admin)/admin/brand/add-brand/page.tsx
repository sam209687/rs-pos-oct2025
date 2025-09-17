import { BrandForm } from '@/components/forms/BrandForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddBrandPage() {
  return (
    <div className="container mx-auto py-8 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a New Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandForm />
        </CardContent>
      </Card>
    </div>
  );
}