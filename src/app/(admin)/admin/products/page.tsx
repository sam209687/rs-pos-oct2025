// src/app/(admin)/admin/products/page.tsx
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductList from "./_components/ProductList";
import { getProducts } from "@/actions/product.actions";

export default async function ProductsPage() {
  const productsResult = await getProducts();
  const products = productsResult.success ? productsResult.data : [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Products ({products.length})</h1>
          <Button asChild>
            <Link href="/admin/products/add-product">
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
          </Button>
        </div>
        <ProductList products={products} />
      </div>
    </div>
  );
}