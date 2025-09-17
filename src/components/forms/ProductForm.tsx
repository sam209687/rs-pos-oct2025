"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";
import QRCode from 'qrcode';

import { createProduct, updateProduct, generateProductCodeForUI } from "@/actions/product.actions";
import { getCategories } from "@/actions/category.actions";
import { getBrands } from "@/actions/brand.actions";
import { getUnits } from "@/actions/unit.actions";
import { getTaxes } from "@/actions/tax.actions";
import { productSchema } from "@/lib/schemas";
import { useProductStore } from "@/store/product.store";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, QrCode, XCircle } from "lucide-react";

interface IProduct {
  _id: string;
  category: string;
  brand: string;
  productCode: string;
  productName: string;
  description: string;
  unit: string;
  tax: string;
  purchasePrice: number;
  packingCharges: number;
  laborCharges: number;
  electricityCharges: number;
  others1: number;
  others2: number;
  totalPrice: number;
  stockQuantity: number;
  stockAlertQuantity: number;
  image?: string;
  qrCode?: string;
}

interface ICategory { _id: string; name: string; codePrefix?: string; }
interface IBrand { _id: string; name: string; }
interface IUnit { _id: string; unitName: string; }
interface ITax { _id: string; taxName: string; }

interface ProductFormProps {
  initialData?: IProduct | null;
}

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { categories, brands, units, taxes, setCategories, setBrands, setUnits, setTaxes } = useProductStore();

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(initialData?.qrCode || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);

  const isEditing = !!initialData;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: initialData?.category || "",
      brand: initialData?.brand || "",
      productCode: initialData?.productCode || "",
      productName: initialData?.productName || "",
      description: initialData?.description || "",
      unit: initialData?.unit || "",
      tax: initialData?.tax || "", 
      purchasePrice: initialData?.purchasePrice || 0,
      packingCharges: initialData?.packingCharges || 0,
      laborCharges: initialData?.laborCharges || 0,
      electricityCharges: initialData?.electricityCharges || 0,
      others1: initialData?.others1 || 0,
      others2: initialData?.others2 || 0,
      totalPrice: initialData?.totalPrice || 0,
      stockQuantity: initialData?.stockQuantity || 0,
      stockAlertQuantity: initialData?.stockAlertQuantity || 0,
      image: initialData?.image || "", // Use initial image path
      qrCode: initialData?.qrCode || "", // Use initial QR code path
    } as ProductFormValues,
  });

  // Fetch initial data for dropdowns and store in Zustand
  useEffect(() => {
    const fetchData = async () => {
      const [catResult, brandResult, unitResult, taxResult] = await Promise.all([
        getCategories(),
        getBrands(),
        getUnits(),
        getTaxes(),
      ]);

      if (catResult.success) setCategories(catResult.data);
      if (brandResult.success) setBrands(brandResult.data);
      if (unitResult.success) setUnits(unitResult.data);
      if (taxResult.success) setTaxes(taxResult.data);
    };

    fetchData();
  }, [setCategories, setBrands, setUnits, setTaxes]);

  // Watch for category change to generate product code
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
  }, [form.watch("category"), form.setValue]);

  // Watch for price changes to update total price
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ([
        "purchasePrice",
        "packingCharges",
        "laborCharges",
        "electricityCharges",
        "others1",
        "others2"
      ].includes(name as string)) {
        const total = (Number(value.purchasePrice) || 0) +
                      (Number(value.packingCharges) || 0) +
                      (Number(value.laborCharges) || 0) +
                      (Number(value.electricityCharges) || 0) +
                      (Number(value.others1) || 0) +
                      (Number(value.others2) || 0);
        form.setValue("totalPrice", total);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Reset form value for image field as it's a file, not a string
      form.setValue("image", file as any);
    } else {
      setImageFile(null);
      setImagePreview(null);
      form.setValue("image", "");
    }
  };

  const handleGenerateQr = async () => {
    const values = form.getValues();

    if (!values.productCode || !values.productName || values.productCode.trim() === "" || values.productName.trim() === "") {
      toast.error("Product Code and Product Name are required to generate QR code.");
      return;
    }

    const qrData = JSON.stringify({
      productCode: values.productCode,
      productName: values.productName,
      purchasePrice: values.purchasePrice,
      totalPrice: values.totalPrice,
    });

    try {
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      const blob = await fetch(qrCodeUrl).then(res => res.blob());
      const file = new File([blob], 'product-qr.png', { type: 'image/png' });
      setQrCodeFile(file);
      setQrCodePreview(URL.createObjectURL(file));
      form.setValue("qrCode", file as any); // Set form value for QR code
      toast.success("QR Code generated successfully!");
    } catch (err) {
      toast.error("Failed to generate QR Code.");
    }
  };
  
  const onSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      let result;
      const formData = new FormData();
      
      // Upload image and QR code files first if they exist
      let imagePath = isEditing && initialData?.image ? initialData.image : "";
      let qrCodePath = isEditing && initialData?.qrCode ? initialData.qrCode : "";

      if (imageFile) {
        const imageUploadData = new FormData();
        imageUploadData.append("file", imageFile);
        const imageRes = await fetch("/api/upload", {
          method: "POST",
          body: imageUploadData,
        });
        const imageData = await imageRes.json();
        if (imageData.success) {
          imagePath = imageData.data.url;
        } else {
          toast.error("Image upload failed.");
          return;
        }
      }

      if (qrCodeFile) {
        const qrCodeUploadData = new FormData();
        qrCodeUploadData.append("file", qrCodeFile);
        const qrCodeRes = await fetch("/api/upload", {
          method: "POST",
          body: qrCodeUploadData,
        });
        const qrCodeData = await qrCodeRes.json();
        if (qrCodeData.success) {
          qrCodePath = qrCodeData.data.url;
        } else {
          toast.error("QR Code upload failed.");
          return;
        }
      }

      // Now prepare the final form data for the server action
      Object.keys(values).forEach(key => {
        const value = values[key as keyof ProductFormValues];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });
      
      // Append the paths from the file uploads
      if (imagePath) formData.set("image", imagePath);
      if (qrCodePath) formData.set("qrCode", qrCodePath);
      
      if (isEditing && initialData) {
        result = await updateProduct(initialData._id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/products");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem key={unit._id} value={unit._id}>{unit.unitName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <SelectItem key={tax._id} value={tax._id}>{tax.taxName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
        
        {/* Inventory Fields */}
        <h2 className="text-lg font-semibold mt-6">Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packingCharges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Packing Charges</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="laborCharges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labor Charges</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="electricityCharges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Electricity Charges</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="others1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Others-1</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="others2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Others-2</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price</FormLabel>
                <FormControl>
                  <Input {...field} disabled={true} className="font-bold text-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity (SKU)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
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
                  <Input type="number" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image and QR Code Section */}
        <h2 className="text-lg font-semibold mt-6">Images & QR Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <Input type="file" onChange={handleImageChange} disabled={isPending} />
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
          <div>
            <FormLabel>Generate QR Code</FormLabel>
            <p className="text-sm text-muted-foreground mb-2">
              Generate a QR code from product details.
            </p>
            <Button type="button" onClick={handleGenerateQr} disabled={isPending} className="mb-4">
              <QrCode className="mr-2 h-4 w-4" /> Generate QR Code
            </Button>
            {qrCodePreview && (
              <div className="relative w-48 h-48 mt-2">
                <Image 
                  src={qrCodePreview} 
                  alt="QR Code Preview" 
                  fill
                  style={{ objectFit: 'contain' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => { setQrCodePreview(null); setQrCodeFile(null); form.setValue("qrCode", ""); }}
                  className="absolute top-0 right-0 p-1"
                >
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
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