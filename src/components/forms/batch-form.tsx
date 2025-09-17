"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { createBatch, generateBatchNumber } from "@/actions/batch.actions";
import { getProductsForBatch } from "@/actions/batch.actions";
import { batchSchema } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface IProduct {
  _id: string;
  productName: string;
  productCode: string;
}

interface BatchFormProps {
  products: IProduct[];
}

type BatchFormValues = z.infer<typeof batchSchema>;

export function BatchForm({ products }: BatchFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      product: "",
      batchNumber: "",
    },
  });

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
  }, [form, products]);

  async function onSubmit(values: BatchFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("product", values.product);
      formData.append("batchNumber", values.batchNumber);

      const result = await createBatch(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/dashboard"); // Redirect to a different page after success
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>{product.productName}</SelectItem>
                    ))}
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
          <Button type="submit" disabled={isPending || !form.getValues("batchNumber")}>
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