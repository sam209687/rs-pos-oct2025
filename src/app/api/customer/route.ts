// src/app/api/customer/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/customer';
import { customerSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const validatedData = customerSchema.parse(body);

    const newCustomer = await Customer.create(validatedData);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create customer:", error);
    if (error.code === 11000) { // Handle duplicate phone number
      return NextResponse.json({ message: 'A customer with this phone number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create customer.' }, { status: 500 });
  }
}