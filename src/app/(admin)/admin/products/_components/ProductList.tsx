// src/app/(admin)/admin/products/_components/ProductList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IProduct } from "@/lib/models/product";
import { deleteProduct } from "@/actions/product.actions";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns"; // Import the columns function

interface ProductListProps {
  products: IProduct[];
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
      setData(data.filter((product) => product._id !== id));
      router.refresh(); 
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };
    // Correctly call the columns function with only two arguments
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