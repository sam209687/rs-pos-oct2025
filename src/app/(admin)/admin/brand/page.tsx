import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandTable } from '@/components/tables/BrandTable';

import { connectToDatabase } from '@/lib/db';
import Brand from '@/lib/models/brand';

// This function fetches data on the server
async function getBrands() {
  await connectToDatabase();
  const brands = await Brand.find({}).sort({ createdAt: -1 });
  // We need to serialize the data to pass it from a Server Component to a Client Component.
  return JSON.parse(JSON.stringify(brands));
}

export default async function BrandPage() {
  const brands = await getBrands();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Brands</h1>
          <p className="text-muted-foreground">
            A list of all the brands in your catalog.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/brand/add-brand">Add Brand</Link>
        </Button>
      </div>

      <BrandTable initialBrands={brands} />
    </div>
  );
}