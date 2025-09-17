// src/app/api/currency/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Currency from '@/lib/models/currency';
// import { currencySchema } from '@/lib/schemas/currency';
import { currencySchema } from '@/lib/schemas';

// GET all currencies
export async function GET() {
  try {
    await connectToDatabase();
    const currencies = await Currency.find({}).sort({ sNo: 'asc' });
    return NextResponse.json({ success: true, data: currencies });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch currencies.' }, { status: 500 });
  }
}

// POST a new currency
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const validation = currencySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: 'Invalid form data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newCurrency = new Currency(validation.data);
    await newCurrency.save();
    return NextResponse.json({ success: true, message: 'Currency added successfully!', data: newCurrency }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to add currency.' }, { status: 500 });
  }
}