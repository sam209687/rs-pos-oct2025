// src/components/forms/BrandForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react"; // Added useState
import * as z from "zod";
import Image from "next/image"; // Added Image component

import { brandSchema } from "@/lib/schemas";
import { createBrand, updateBrand } from "@/actions/brand.actions";
import { IBrand } from "@/lib/models/brand";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface BrandFormProps {
  initialData?: IBrand | null;
}

export function BrandForm({ initialData }: BrandFormProps) {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const router = useRouter();

  const form = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const isEditing = !!initialData;

  function onSubmit(values: z.infer<typeof brandSchema>) {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.image) {
      formData.append("image", values.image);
    }
    
    startTransition(async () => {
      let result;
      if (isEditing && initialData?._id) {
        result = await updateBrand(initialData._id, formData);
      } else {
        result = await createBrand(formData);
      }
      
      if (result.success) {
        router.push("/admin/brand");
      } else {
        console.error(result.errors);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Nike" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    field.onChange(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                  disabled={isPending}
                />
              </FormControl>
              {imagePreview && (
                <div className="relative h-40 w-40 mt-4 rounded-md overflow-hidden mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Image Preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : isEditing ? (
            "Update Brand"
          ) : (
            "Add Brand"
          )}
        </Button>
      </form>
    </Form>
  );
}