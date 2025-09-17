// src/app/api/cashier/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserModel } from '@/lib/models/user';
import { Types } from 'mongoose';

// GET a single cashier by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Cashier ID' }, { status: 400 });
    }

    const cashier = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires');

    if (!cashier || cashier.role !== 'cashier') {
      return NextResponse.json({ message: 'Cashier not found' }, { status: 404 });
    }

    return NextResponse.json(cashier, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching cashier:", error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// UPDATE a cashier by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const { id } = await params;
    const body = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Cashier ID' }, { status: 400 });
    }

    // Prepare fields for update. Only allow certain fields to be updated.
    const updateFields: { [key: string]: any } = {};
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.personalEmail !== undefined) updateFields.personalEmail = body.personalEmail; // Update personal email
    if (body.aadhaar !== undefined) updateFields.aadhaar = body.aadhaar;
    if (body.phone !== undefined) updateFields.phone = body.phone;
    if (body.storeLocation !== undefined) updateFields.storeLocation = body.storeLocation;
    if (body.email !== undefined) { // If login email is being updated, check for uniqueness
      const existingUser = await User.findOne({ email: body.email, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json({ message: 'Another user already exists with this login email.' }, { status: 409 });
      }
      updateFields.email = body.email; // Update login email
    }
    if (body.status !== undefined) updateFields.status = body.status;

    const updatedCashier = await User.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true }).select('-password -passwordResetToken -passwordResetExpires');

    if (!updatedCashier || updatedCashier.role !== 'cashier') {
      return NextResponse.json({ message: 'Cashier not found or not authorized to update' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cashier updated successfully', cashier: updatedCashier }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating cashier:", error);
    if (error.code === 11000) {
        return NextResponse.json({ message: 'A cashier with this email or Aadhaar already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE a cashier by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Cashier ID' }, { status: 400 });
    }

    const deletedCashier = await User.findByIdAndDelete(id);

    if (!deletedCashier || deletedCashier.role !== 'cashier') {
      return NextResponse.json({ message: 'Cashier not found or not authorized to delete' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cashier deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting cashier:", error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}