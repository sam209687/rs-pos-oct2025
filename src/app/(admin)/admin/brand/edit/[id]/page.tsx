"use client";

import { BrandForm } from "@/components/forms/BrandForm";
import { IBrand } from "@/lib/models/brand";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { notFound } from "next/navigation";

interface EditBrandPageProps {
  params: {
    id: string;
  };
}

export default function EditBrandPage({ params }: EditBrandPageProps) {
  const [initialData, setInitialData] = useState<IBrand | null>(null);
  const [loading, setLoading] = useState(true);

  // Correct way to access the id: directly destructure it from the params object.
  const { id } = params;

  useEffect(() => {
    async function fetchBrand() {
      try {
        const response = await fetch(`/api/brand/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            return notFound();
          }
          throw new Error("Failed to fetch brand.");
        }
        const brandData: IBrand = await response.json();
        setInitialData(brandData);
      } catch (error) {
        console.error("Error fetching brand:", error);
        toast.error("Failed to load brand data.");
      } finally {
        setLoading(false);
      }
    }
    fetchBrand();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <BrandForm initialData={initialData} />;
}