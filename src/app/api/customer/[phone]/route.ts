// src/app/api/customer/[phone]/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/customer';

export async function GET(
  request: Request,
  { params }: { params: { phone: string } }
) {
  try {
    await connectToDatabase();
    
    const phonePrefix = params.phone; 

    // ✅ MODIFICATION 1: Allow partial search (e.g., minimum 3 digits)
    // We now look for partial matches starting from the beginning of the field.
    if (!phonePrefix || phonePrefix.length < 3 || phonePrefix.length > 10) {
      return NextResponse.json({ message: 'Enter 3 to 10 digits to search.' }, { status: 400 });
    }

    // ✅ MODIFICATION 2: Use MongoDB $regex for "starts with" search
    const customers = await Customer.find({ 
      phone: { $regex: `^${phonePrefix}` } 
    }).limit(10); // Limit results for performance

    // MODIFICATION 3: Check if results were found
    if (!customers || customers.length === 0) {
      return NextResponse.json({ message: 'No matching customers found.' }, { status: 404 });
    }

    // Return the array of matching customers
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch customer search results:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}