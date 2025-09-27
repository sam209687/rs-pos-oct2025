"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { createBatch, generateBatchNumber } from "@/actions/batch.actions";
import { batchSchema } from "@/lib/schemas";
import { useBatchStore } from "@/store/batch.store";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type BatchFormValues = z.infer<typeof batchSchema>;

export function BatchForm() {
  const [isPending, startTransition] = useTransition();
  const { products, selectedProductCode, fetchProducts, setSelectedProductCode, isLoading } = useBatchStore();
  const router = useRouter();

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      product: "",
      batchNumber: "",
      vendorName: "",
      qty: 0,
      price: 0,
    },
  });
  
  const batchNumberValue = form.watch("batchNumber");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "product") {
        const selectedProduct = products.find(p => p._id === value.product);
        if (selectedProduct) {
          setSelectedProductCode(selectedProduct.productCode);
        } else {
          setSelectedProductCode(null);
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
    const result = await generateBatchNumber(selectedProductCode);
    if (result.success) {
      form.setValue("batchNumber", result.data);
    }
  };

  async function onSubmit(values: BatchFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("product", values.product);
      formData.append("batchNumber", values.batchNumber);
      formData.append("vendorName", values.vendorName);
      formData.append("qty", values.qty.toString());
      formData.append("price", values.price.toString());

      const result = await createBatch(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/batch"); // ✅ FIX: Redirect to the batch list page
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>{product.productName}</SelectItem>
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

        <div className="flex items-end gap-4">
          <FormField
            control={form.control}
            name="batchNumber"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Batch Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" onClick={handleGenerateBatch} disabled={!selectedProductCode || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Batch Number
          </Button>
        </div>

        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isPending || !batchNumberValue}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              "Add Batch"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}