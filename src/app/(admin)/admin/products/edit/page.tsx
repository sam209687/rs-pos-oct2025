import { redirect } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import ProductForm from "@/components/forms/ProductForm";
import { getProductById } from "@/actions/product.actions";

interface EditProductPageProps {
  searchParams: {
    id: string;
  };
}

const EditProductPage = async ({ searchParams }: EditProductPageProps) => {
  // Destructure 'id' from searchParams to correctly handle the dynamic API call
  const { id } = searchParams;

  if (!id) {
    redirect("/admin/products");
  }

  const productResult = await getProductById(id);

  if (!productResult.success) {
    // Handle case where product is not found or fetching fails
    redirect("/admin/products");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Edit Product" description="Edit an existing product" />
        <ProductForm initialData={productResult.data} />
      </div>
    </div>
  );
};

export default EditProductPage;