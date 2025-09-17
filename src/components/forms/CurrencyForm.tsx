// src/components/forms/CurrencyForm.tsx
"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createCurrency, updateCurrency } from "@/actions/currency.actions";
// import { currencySchema } from "@/lib/schemas/currency";
import { currencySchema } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ICurrency {
  _id: string;
  sNo: string;
  currencySymbol: string;
}

interface CurrencyFormProps {
  initialData?: ICurrency | null;
}

type CurrencyFormValues = z.infer<typeof currencySchema>;

const CurrencyForm: React.FC<CurrencyFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = !!initialData;

  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      sNo: initialData?.sNo || "",
      currencySymbol: initialData?.currencySymbol || "",
    },
  });

  const onSubmit = (values: CurrencyFormValues) => {
    startTransition(async () => {
      let result;
      const formData = new FormData();
      formData.append("sNo", values.sNo);
      formData.append("currencySymbol", values.currencySymbol);

      if (isEditing && initialData) {
        result = await updateCurrency(initialData._id, formData);
      } else {
        result = await createCurrency(formData);
      }

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/currency");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>S/No</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 1" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currencySymbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., $" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : isEditing ? (
            "Update Currency"
          ) : (
            "Add Currency"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CurrencyForm;