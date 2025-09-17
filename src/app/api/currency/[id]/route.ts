// src/app/api/currency/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Currency from '@/lib/models/currency';
import { currencySchema } from '@/lib/schemas';

// GET a single currency by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const currency = await Currency.findById(params.id);

    if (!currency) {
      return NextResponse.json({ success: false, message: 'Currency not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: currency });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch currency.' }, { status: 500 });
  }
}

// PUT (update) a single currency by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const validation = currencySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: 'Invalid form data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedCurrency = await Currency.findByIdAndUpdate(params.id, validation.data, { new: true });

    if (!updatedCurrency) {
      return NextResponse.json({ success: false, message: 'Currency not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Currency updated successfully!', data: updatedCurrency });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update currency.' }, { status: 500 });
  }
}

// DELETE a single currency by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deletedCurrency = await Currency.findByIdAndDelete(params.id);

    if (!deletedCurrency) {
      return NextResponse.json({ success: false, message: 'Currency not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Currency deleted successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete currency.' }, { status: 500 });
  }
}