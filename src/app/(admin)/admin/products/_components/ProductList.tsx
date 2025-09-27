// src/app/(admin)/admin/products/_components/ProductList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IPopulatedProduct } from "@/lib/models/product"; // ✅ FIX: Use the populated product type
import { deleteProduct } from "@/actions/product.actions";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface ProductListProps {
  products: IPopulatedProduct[]; // ✅ FIX: Use the populated product type
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(products);

  useEffect(() => {
    setData(products);
  }, [products]);

  const handleDelete = async (id: string) => {
    setLoading(true);
    const result = await deleteProduct(id);
    if (result.success) {
      toast.success("Product deleted successfully.");
      setData(data.filter((product) => product._id.toString() !== id));
      router.refresh(); 
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };
    
  const productColumns = columns(handleDelete, loading); 

  return (
    <div>
      <DataTable
        columns={productColumns}
        data={data}
        searchKey="productName"
      />
    </div>
  );
};

export default ProductList;