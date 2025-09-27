"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";
import QRCode from "qrcode";
import { Loader2, QrCode, XCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  createVariant,
  updateVariant,
  VariantData,
} from "@/actions/variant.actions";
import { useVariantStore } from "@/store/variantStore";
import { variantSchema } from "@/lib/schemas";
import { IPopulatedVariant } from "@/lib/models/variant";
import { IUnit } from "@/lib/models/unit";
import { IPopulatedProduct } from "@/lib/models/product";

interface VariantFormProps {
  initialData?: IPopulatedVariant | null;
}

type VariantFormValues = z.infer<typeof variantSchema>;

const numberInputStyles = `
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

const VariantForm: React.FC<VariantFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    products,
    units,
    fetchFormData,
    fetchProductDetails,
    productDetails,
    isLoading,
  } = useVariantStore();

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(
    initialData?.qrCode || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditing = !!initialData;

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      product: initialData?.product._id || "",
      variantVolume: initialData?.variantVolume || 0,
      unit: initialData?.unit._id || "",
      variantColor: initialData?.variantColor || "",
      price: initialData?.price || 0,
      mrp: initialData?.mrp || 0,
      discount: initialData?.discount || 0,
      stockQuantity: initialData?.stockQuantity || 0,
      stockAlertQuantity: initialData?.stockAlertQuantity || 0,
      image: initialData?.image || undefined,
      qrCode: initialData?.qrCode || undefined,
    } as VariantFormValues,
  });

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  useEffect(() => {
    const selectedProductId = form.watch("product");
    if (selectedProductId) {
      fetchProductDetails(selectedProductId);
    } else {
      useVariantStore.setState({ productDetails: { productCode: "", totalPrice: 0 } });
    }
  }, [form.watch("product"), fetchProductDetails]);

  const calculateDiscount = (price: number, mrp: number): number => {
    if (mrp <= 0) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "price" || name === "mrp") {
        const price = Number(value.price);
        const mrp = Number(value.mrp);
        const calculatedDiscount = calculateDiscount(price, mrp);
        form.setValue("discount", calculatedDiscount);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      form.setValue("image", file);
    } else {
      setImageFile(null);
      setImagePreview(null);
      form.setValue("image", undefined);
    }
  };

  const onGenerateQrCode = async () => {
    const values = form.getValues();
    if (!productDetails.productCode) {
      toast.error("Product code is required to generate QR code.");
      return;
    }

    const qrData = JSON.stringify({
      productCode: productDetails.productCode,
      price: values.price,
      mrp: values.mrp,
      discount: values.discount,
      variantVolume: values.variantVolume,
      unit: values.unit,
      variantColor: values.variantColor,
      stockQuantity: values.stockQuantity,
      stockAlertQuantity: values.stockAlertQuantity,
    });

    try {
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      setQrCodePreview(qrCodeUrl);
      toast.success("QR Code generated successfully!");
      form.setValue("qrCode", qrCodeUrl);
    } catch (err) {
      toast.error("Failed to generate QR Code.");
    }
  };

  const onSubmit = async (values: VariantFormValues) => {
    startTransition(async () => {
      let result;
      let imagePath = isEditing ? initialData?.image || "" : "";
      let qrCodePath = isEditing ? initialData?.qrCode || "" : "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
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

      if (qrCodePreview) {
        const qrCodeBlob = await fetch(qrCodePreview).then((res) => res.blob());
        const qrCodeFormData = new FormData();
        qrCodeFormData.append(
          "file",
          new File([qrCodeBlob], "variant-qr.png", { type: "image/png" })
        );
        const res = await fetch("/api/upload", {
          method: "POST",
          body: qrCodeFormData,
        });
        const data = await res.json();
        if (data.success) {
          qrCodePath = data.data.url;
        } else {
          toast.error("QR Code upload failed.");
          return;
        }
      }

      const variantData: VariantData = {
        ...values,
        mrp: Number(values.mrp),
        price: Number(values.price),
        variantVolume: Number(values.variantVolume),
        discount: Number(values.discount),
        stockQuantity: Number(values.stockQuantity),
        stockAlertQuantity: Number(values.stockAlertQuantity),
        image: imagePath,
        qrCode: qrCodePath,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style>{numberInputStyles}</style>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product: IPopulatedProduct) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.productName}
                        </SelectItem>
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
                <Input value={productDetails.productCode} disabled />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Product Total Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={productDetails.totalPrice}
                  disabled
                />
              </FormControl>
            </FormItem>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="variantVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Volume</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onWheel={(e) => e.currentTarget.blur()}
                      disabled={isPending}
                      className={numberInputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit: IUnit) => (
                        <SelectItem key={unit._id} value={unit._id}>
                          {unit.name}
                        </SelectItem>
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
                    <Input
                      placeholder="e.g., Red, Blue"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price of Variant</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onWheel={(e) => e.currentTarget.blur()}
                      disabled={isPending}
                      className={numberInputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground">Discount</p>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">
                  {form.watch("discount")}%
                </span>
              </div>
            </div>
            <FormField
              control={form.control}
              name="mrp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MRP</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onWheel={(e) => e.currentTarget.blur()}
                      disabled={isPending}
                      className={numberInputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity (SKU)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onWheel={(e) => e.currentTarget.blur()}
                      disabled={isPending}
                      className={numberInputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockAlertQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Alert Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onWheel={(e) => e.currentTarget.blur()}
                      disabled={isPending}
                      className={numberInputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Variant Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={handleImageChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  {imagePreview && (
                    <div className="relative w-48 h-48 mt-2">
                      <Image
                        src={imagePreview}
                        alt="Image Preview"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          form.setValue("image", undefined);
                        }}
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
            <div>
              <FormLabel>QR Code</FormLabel>
              <p className="text-sm text-muted-foreground mb-2">
                Generate a QR code.
              </p>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={onGenerateQrCode}
                  disabled={isPending}
                >
                  <QrCode className="mr-2 h-4 w-4" /> Generate QR Code
                </Button>
              </div>
              {qrCodePreview && (
                <div className="relative w-48 h-48 mt-2">
                  <Image
                    src={qrCodePreview}
                    alt="QR Code Preview"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setQrCodePreview(null);
                      form.setValue("qrCode", undefined);
                    }}
                    className="absolute top-0 right-0 p-1"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
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
    </>
  );
};

export default VariantForm;