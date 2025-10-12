// src/app/api/admin/cashiers/reset-password/routeModule.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserModel, IUser } from '@/lib/models/user';
import argon2 from 'argon2'; // Changed from bcryptjs
import { auth } from '@/lib/auth';

// Helper to check admin role
async function checkAdminAuth() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  return null; // No error, proceed
}

export async function POST(req: NextRequest) {
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    await connectToDatabase();
    const User = getUserModel();
    const { cashierName, email, phone, aadhaar, storeLocation } = await req.json();

    // Validate inputs
    if (!cashierName || !email || !phone || !aadhaar || !storeLocation) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // Check for existing email or aadhaar
    const existingUser = await User.findOne({ $or: [{ email }, { aadhaar }] });
    if (existingUser) {
      return NextResponse.json({ message: 'Email or Aadhaar already registered.' }, { status: 409 });
    }

    // Generate username: firstFourLettersOfName + lastFourDigitsOfAadhaar + @rs.com
    const username = `${cashierName.substring(0, 4).toLowerCase()}${aadhaar.substring(aadhaar.length - 4)}@rs.com`;
    const defaultPassword = username; // Default password is the username
    
    // ✅ CHANGED: Hashing with Argon2
    const hashedPassword = await argon2.hash(defaultPassword);

    const newCashier = await User.create({
      name: cashierName,
      email,
      phone,
      aadhaar,
      storeLocation,
      username,
      password: hashedPassword,
      role: 'cashier',
    });

    return NextResponse.json({ message: 'Cashier account created successfully!', cashier: newCashier }, { status: 201 });
  } catch (error: any) {
    console.error('Create cashier API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    await connectToDatabase();
    const User = getUserModel();
    const cashiers = await User.find({ role: 'cashier' }).select('-password -passwordResetToken -passwordResetExpires'); // Exclude sensitive fields

    return NextResponse.json({ cashiers }, { status: 200 });
  } catch (error: any) {
    console.error('Get cashiers API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    await connectToDatabase();
    const User = getUserModel();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Cashier ID is required.' }, { status: 400 });
    }

    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ message: 'Cashier not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cashier deleted successfully!' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete cashier API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error.' }, { status: 500 });
  }
}