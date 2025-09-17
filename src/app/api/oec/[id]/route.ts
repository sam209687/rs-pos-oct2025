// src/app/api/oec/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Oec from '@/lib/models/oec';
import mongoose from 'mongoose';

// GET a single OEC by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OEC ID.' },
        { status: 400 }
      );
    }

    const oec = await Oec.findById(id)
      .populate({ path: 'product', select: 'productName productCode' });

    if (!oec) {
      return NextResponse.json(
        { success: false, message: 'OEC not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: oec });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch OEC.' },
      { status: 500 }
    );
  }
}

// PUT (update) an OEC by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { product, oilExpellingCharges } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OEC ID.' },
        { status: 400 }
      );
    }

    const updatedOec = await Oec.findByIdAndUpdate(
      id,
      { product, oilExpellingCharges },
      { new: true, runValidators: true }
    );

    if (!updatedOec) {
      return NextResponse.json(
        { success: false, message: 'OEC not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'OEC updated successfully!', data: updatedOec }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update OEC.' },
      { status: 500 }
    );
  }
}

// DELETE an OEC by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OEC ID.' },
        { status: 400 }
      );
    }

    const deletedOec = await Oec.findByIdAndDelete(id);

    if (!deletedOec) {
      return NextResponse.json(
        { success: false, message: 'OEC not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'OEC deleted successfully!' }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete OEC.' },
      { status: 500 }
    );
  }
}