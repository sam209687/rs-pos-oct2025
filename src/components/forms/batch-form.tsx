"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";
import { createBatch, generateBatchNumber, updateBatch } from "@/actions/batch.actions";
import { batchSchema } from "@/lib/schemas";
import { useBatchStore, IPopulatedBatch } from "@/store/batch.store";
import { IPopulatedProduct } from "@/lib/models/product";
import { ICategory } from "@/lib/models/category";
import { useProductStore } from "@/store/product.store"; 
import { generateProductCodeForUI } from "@/actions/product.actions";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface BatchFormProps {
  initialData?: IPopulatedBatch | null;
}

type FormValuesWithCategory = z.infer<typeof batchSchema> & { category: string };

export function BatchForm({ initialData }: BatchFormProps) {
  const [isPending, startTransition] = useTransition();
  const { products, selectedProductCode, fetchProducts, setSelectedProductCode, isLoading, updateBatch: updateBatchInStore, categories, fetchCategories } = useBatchStore();
  const router = useRouter();

  const isEditing = !!initialData;

  const form = useForm<FormValuesWithCategory>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      category: initialData?.product?.category?._id?.toString() || "", 
      product: initialData?.product?._id?.toString() || "",
      batchNumber: initialData?.batchNumber || "",
      vendorName: initialData?.vendorName || "",
      qty: initialData?.qty || 0,
      price: initialData?.price || 0,
      perUnitPrice: initialData?.perUnitPrice || 0,
      oilCakeProduced: initialData?.oilCakeProduced || 0,
      oilExpelled: initialData?.oilExpelled || 0,
    },
  });
  
  const batchNumberValue = form.watch("batchNumber");
  const selectedCategory = form.watch("category");
  const isEdibleOil = categories.find(cat => cat._id?.toString() === selectedCategory)?.name === "Edible Oil";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
      if (name === "product") {
        const selectedProduct = products.find(p => p.category?._id?.toString() === value.category && p._id?.toString() === value.product);
        if (selectedProduct) {
          setSelectedProductCode(selectedProduct.productCode);
        } else {
          setSelectedProductCode(null);
        }
      } else if (name === "price" || name === "qty") {
        const price = form.getValues("price");
        const qty = form.getValues("qty");
        if (price > 0 && qty > 0) {
          const perUnitPrice = price / qty;
          form.setValue("perUnitPrice", perUnitPrice);
        } else {
          form.setValue("perUnitPrice", 0);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, products, setSelectedProductCode]);

  const handleGenerateBatch = async () => {
    if (!selectedProductCode) {
      toast.error("Please select a product first.");
      return;
    }
    // ✅ FIX: Use the correct server action and pass the product code
    const result = await generateBatchNumber(selectedProductCode);
    if (result.success) {
      form.setValue("batchNumber", result.data);
    }
  };

  async function onSubmit(values: FormValuesWithCategory) {
    startTransition(async () => {
      const schemaValidatedData = batchSchema.parse(values);
      const formData = new FormData();
      
      formData.append("product", schemaValidatedData.product);
      formData.append("batchNumber", schemaValidatedData.batchNumber);
      formData.append("vendorName", schemaValidatedData.vendorName);
      formData.append("qty", schemaValidatedData.qty.toString());
      formData.append("price", schemaValidatedData.price.toString());
      if (schemaValidatedData.perUnitPrice !== undefined) {
        formData.append("perUnitPrice", schemaValidatedData.perUnitPrice.toString());
      }
      if (schemaValidatedData.oilExpelled !== undefined) {
        formData.append("oilExpelled", schemaValidatedData.oilExpelled.toString());
      }
      if (schemaValidatedData.oilCakeProduced !== undefined) {
        formData.append("oilCakeProduced", schemaValidatedData.oilCakeProduced.toString());
      }
      
      let result;
      if (isEditing && initialData) {
        result = await updateBatch(initialData._id, formData);
        if (result.success && result.data) {
          updateBatchInStore(result.data);
        }
      } else {
        result = await createBatch(formData);
      }

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/batch");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending || isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a category" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category._id?.toString()} value={category._id?.toString()}>{category.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending || isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a product" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products && products.length > 0 ? (
                      products.filter(p => p.category?._id?.toString() === selectedCategory).map((product) => (
                        <SelectItem key={product._id?.toString()} value={product._id?.toString()}>{product.productName}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-products" disabled>No products available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormItem>
            <FormLabel>Product Code</FormLabel>
            <FormControl>
              <Input value={selectedProductCode || ""} disabled={true} />
            </FormControl>
          </FormItem>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vendorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Vendor name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Per Unit Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={form.watch("perUnitPrice")}
                readOnly={true}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
              />
            </FormControl>
          </FormItem>

          {isEdibleOil && (
            <>
              <FormField
                control={form.control}
                name="oilExpelled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oil Expelled (In Ltrs)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

        </div>
        
        {isEdibleOil && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Volume consumed to produce 1 Ltr (KG)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={
                    (form.watch("qty") && form.watch("oilExpelled")) 
                      ? (form.watch("qty") / form.watch("oilExpelled")).toFixed(2)
                      : "0.00"
                  }
                  readOnly={true}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Price of consumed volume</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={
                    (form.watch("perUnitPrice") && form.watch("qty") && form.watch("oilExpelled"))
                      ? (form.watch("perUnitPrice") * (form.watch("qty") / form.watch("oilExpelled"))).toFixed(2)
                      : "0.00"
                  }
                  readOnly={true}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                />
              </FormControl>
            </FormItem>
          </div>
        )}

        <div className="flex items-end gap-4">
          <FormField
            control={form.control}
            name="batchNumber"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Batch Number</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!isEditing && (
            <Button type="button" onClick={handleGenerateBatch} disabled={!selectedProductCode || isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Batch Number
            </Button>
          )}
        </div>

        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isPending || !batchNumberValue}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : isEditing ? (
              "Update Batch"
            ) : (
              "Add Batch"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}