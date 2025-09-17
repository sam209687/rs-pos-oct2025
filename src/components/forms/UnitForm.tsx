"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import * as z from "zod";

import { unitSchema } from "@/lib/schemas";
import { createUnit, updateUnit } from "@/actions/unit.actions";
import { IUnit } from "@/lib/models/unit";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface UnitFormProps {
  initialData?: IUnit | null;
}

export function UnitForm({ initialData }: UnitFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof unitSchema>>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const isEditing = !!initialData;

  async function onSubmit(values: z.infer<typeof unitSchema>) {
    startTransition(async () => {
      let result;
      const formData = new FormData();
      formData.append("name", values.name);

      if (isEditing && initialData?._id) {
        result = await updateUnit(initialData._id.toString(), formData);
      } else {
        result = await createUnit(formData);
      }

      if (result.success) {
        router.push("/admin/unit");
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
              <FormLabel>Unit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., kg" {...field} disabled={isPending} />
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
            "Update Unit"
          ) : (
            "Add Unit"
          )}
        </Button>
      </form>
    </Form>
  );
}