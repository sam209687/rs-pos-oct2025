// src/components/forms/variant-form.tsx

"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, XCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { getProducts } from "@/actions/product.actions";
import { getUnits } from "@/actions/unit.actions";
import { createVariant, updateVariant } from "@/actions/variant.actions";
import { useVariantStore } from "@/store/variantStore";
import { variantSchema } from "@/lib/schemas";

// ✅ Import interfaces directly from your models to ensure consistency
import { IProduct } from "@/lib/models/product";
import { IVariant } from "@/lib/models/variant";
import { IUnit as MongooseUnit } from "@/lib/models/unit";

// ✅ Use the Mongoose IUnit interface, but give it a more descriptive name
interface IUnit extends MongooseUnit {}

interface VariantFormProps {
  initialData?: IVariant | null;
}

type VariantFormValues = z.infer<typeof variantSchema>;

const VariantForm: React.FC<VariantFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { products, units, setProducts, setUnits } = useVariantStore();

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditing = !!initialData;

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      product: initialData?.product || "",
      variantVolume: initialData?.variantVolume || 0,
      unit: initialData?.unit || "",
      variantColor: initialData?.variantColor || "",
      price: initialData?.price || 0,
      mrp: initialData?.mrp || 0, // ✅ FIX: This should now be a number, as the schema expects it
      image: initialData?.image || "",
      productTotalPrice: undefined,
      stockQuantity: undefined,
      calculatedPricePerUnit: undefined,
    } as VariantFormValues,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [productResult, unitResult] = await Promise.all([
        getProducts(),
        getUnits(),
      ]);

      if (productResult.success) {
        setProducts(productResult.data);
      }
      if (unitResult.success) {
        setUnits(unitResult.data);
      }
    };
    fetchData();
  }, [setProducts, setUnits]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      form.setValue("image", file);
    } else {
      setImageFile(null);
      setImagePreview(null);
      form.setValue("image", "");
    }
  };

  const onSubmit = async (values: VariantFormValues) => {
    startTransition(async () => {
      let result;
      let imagePath = initialData?.image || "";

      if (values.image instanceof File) {
        const formData = new FormData();
        formData.append("file", values.image);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          imagePath = data.data.url;
        } else {
          toast.error("Image upload failed.");
          return;
        }
      }

      const variantData = {
        ...values,
        mrp: Number(values.mrp),
        image: imagePath,
      };

      if (isEditing && initialData) {
        result = await updateVariant(initialData._id, variantData);
      } else {
        result = await createVariant(variantData);
      }

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/variants");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product: IProduct) => (
                      <SelectItem key={product._id} value={product._id}>{product.productName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="variantVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant Volume</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit: IUnit) => (
                      <SelectItem key={unit._id} value={unit._id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="variantColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Red, Blue" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mrp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MRP</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant Image</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => handleImageChange(e)} disabled={isPending} />
              </FormControl>
              {imagePreview && (
                <div className="relative w-48 h-48 mt-2">
                  <Image
                    src={imagePreview}
                    alt="Image Preview"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setImagePreview(null); setImageFile(null); form.setValue("image", ""); }}
                    className="absolute top-0 right-0 p-1"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

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
              "Update Variant"
            ) : (
              "Add Variant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VariantForm;