"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createProduct, updateProduct, generateProductCodeForUI, ProductData } from "@/actions/product.actions";
import { productSchema } from "@/lib/schemas";
import { useProductStore } from "@/store/product.store";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { IProduct } from "@/lib/models/product";
import { IBrand } from "@/lib/models/brand";
import { ITax } from "@/lib/models/tax";
import { ICategory } from "@/lib/models/category";

interface ProductFormProps {
  initialData?: IProduct | null;
}

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { categories, brands, taxes, fetchFormData, isLoading } = useProductStore();

  const isEditing = !!initialData;
  const numberInputClass = "w-full [appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: initialData?.category || "",
      brand: initialData?.brand || "",
      productCode: initialData?.productCode || "",
      productName: initialData?.productName || "",
      description: initialData?.description || "",
      tax: initialData?.tax || "", 
      purchasePrice: initialData?.purchasePrice || 0,
      sellingPrice: initialData?.sellingPrice || 0,
    } as ProductFormValues,
  });

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  useEffect(() => {
    const categoryId = form.watch("category");
    
    const getAndSetProductCode = async (id: string) => {
      try {
        const productCodeResult = await generateProductCodeForUI(id);
        if (productCodeResult.success) {
          form.setValue("productCode", productCodeResult.data);
        } else {
          toast.error("Failed to generate product code. Please try again.");
          console.error(productCodeResult.message);
        }
      } catch (error) {
        toast.error("An unexpected error occurred while generating product code.");
        console.error("Failed to generate product code:", error);
      }
    };

    if (categoryId) {
      getAndSetProductCode(categoryId);
    } else {
      form.setValue("productCode", "");
    }
  }, [form.watch("category")]);

  // ✅ REMOVED: The useEffect for totalPrice calculation is no longer needed.
  
  const onSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      let result;

      const productData: ProductData = {
        ...values,
        productCode: values.productCode || "",
        tax: values.tax || "",
      };
      
      if (isEditing && initialData) {
        result = await updateProduct(initialData._id, productData);
      } else {
        result = await createProduct(productData);
      }

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/products");
      } else {
        toast.error(result.message);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product General Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sunflower Oil" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat: ICategory) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand: IBrand) => (
                      <SelectItem key={brand._id} value={brand._id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the product..." {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tax" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taxes.map((tax: ITax) => (
                      <SelectItem key={tax._id} value={tax._id}>{tax.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />

        {/* Inventory & Pricing Fields */}
        <h2 className="text-lg font-semibold mt-6">Inventory & Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="productCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code</FormLabel>
                <FormControl>
                  <Input {...field} disabled={true} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} className={numberInputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling/Board Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} className={numberInputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : isEditing ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;