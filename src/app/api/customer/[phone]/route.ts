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
    const { phone } = params;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ message: 'A valid 10-digit phone number is required.' }, { status: 400 });
    }

    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return NextResponse.json({ message: 'Customer not found.' }, { status: 404 });
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}