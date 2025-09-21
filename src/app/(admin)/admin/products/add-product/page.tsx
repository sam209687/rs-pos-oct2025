// src/app/(admin)/admin/products/add-product/page.tsx
import ProductForm from "@/components/forms/ProductForm";
import {Heading} from "@/components/ui/heading";
// import ProductForm from "@/components/forms/ProductForm";

const AddProductPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Add Product" description="Create a new product" />
        <ProductForm />
      </div>
    </div>
  );
};

export default AddProductPage;