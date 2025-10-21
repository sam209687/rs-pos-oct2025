// src/actions/customer.actions.ts
'use server';

import { connectToDatabase } from '@/lib/db';
import Customer, { ICustomer } from '@/lib/models/customer';

// ✅ FIX: Define DashboardCustomer as a clean, plain interface. 
// This resolves the Mongoose Document type incompatibility (Error 2322).
export interface DashboardCustomer {
    _id: string; // Mongoose ID
    phone: string;
    name: string;
    // Guaranteed string by the runtime logic (address || 'N/A')
    address: string; 
    date: string; // Formatted registration date
}

export async function getLatestCustomersAndCount(): Promise<{
  success: boolean;
  data: {
    newCustomers: DashboardCustomer[];
    totalCount: number;
  } | null;
  message?: string;
}> {
  try {
    // Assuming connectToDatabase is a named export
    await connectToDatabase(); 

    // 1. Get total count
    const totalCount = await Customer.countDocuments({});

    // 2. Get the latest 10 customers, sorting by creation date (descending)
    const rawCustomers = await Customer.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(); // Use .lean() for plain JS objects

    // 3. Format the data for the component
    const formattedCustomers: DashboardCustomer[] = rawCustomers.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name,
        phone: c.phone,
        // The || 'N/A' ensures the address property is always a string.
        address: c.address || 'N/A', 
        // Format the date for display
        date: new Date(c.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }),
    }));


    return {
      success: true,
      data: {
        newCustomers: formattedCustomers,
        totalCount,
      },
    };
  } catch (error) {
    console.error("Database Error: Failed to fetch customer data:", error);
    return { success: false, data: null, message: "Failed to fetch customer data." };
  }
}