// src/actions/currency.actions.ts
"use server";

import { revalidatePath } from "next/cache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Fetch all currencies
export const getCurrencies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency`, {
      cache: "no-store",
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, message: "Failed to fetch currencies." };
  }
};

// Create a new currency
export const createCurrency = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency`, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (result.success) {
      revalidatePath("/admin/currency");
    }
    return result;
  } catch (error) {
    return { success: false, message: "Failed to create currency." };
  }
};

// Update an existing currency
export const updateCurrency = async (id: string, formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency/${id}`, {
      method: "PUT",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (result.success) {
      revalidatePath("/admin/currency");
    }
    return result;
  } catch (error) {
    return { success: false, message: "Failed to update currency." };
  }
};

// Delete a currency
export const deleteCurrency = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.success) {
      revalidatePath("/admin/currency");
    }
    return result;
  } catch (error) {
    return { success: false, message: "Failed to delete currency." };
  }
};