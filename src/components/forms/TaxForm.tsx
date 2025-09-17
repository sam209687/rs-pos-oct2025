"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import * as z from "zod";

import { createTax, updateTax } from "@/actions/tax.actions"; // The import will now work
import { taxSchema } from "@/lib/schemas";
import { ITax } from "@/lib/models/tax";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface TaxFormProps {
  initialData?: ITax | null;
}

type TaxFormValues = z.infer<typeof taxSchema>;

export function TaxForm({ initialData }: TaxFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: initialData?.name || "",
      hsn: initialData?.hsn || "",
      gst: initialData?.gst || 0,
    },
  });

  const isEditing = !!initialData;

  async function onSubmit(values: TaxFormValues) {
    startTransition(async () => {
      let result;
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("hsn", values.hsn);
      formData.append("gst", values.gst.toString());

      if (isEditing && initialData?._id) {
        result = await updateTax(initialData._id.toString(), formData);
      } else {
        result = await createTax(formData);
      }

      if (result.success) {
        router.push("/admin/tax");
      } else {
        console.error(result.message);
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
              <FormLabel>Tax Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., GST" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hsn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HSN</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 8471" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="gst"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GST (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 18"
                  value={field.value === 0 ? "" : field.value} // Handle 0 value for a better user experience
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : parseFloat(value));
                  }}
                  disabled={isPending}
                />
              </FormControl>
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
            "Update Tax"
          ) : (
            "Add Tax"
          )}
        </Button>
      </form>
    </Form>
  );
}