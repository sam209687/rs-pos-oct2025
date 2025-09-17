// src/app/api/admin/cashier-reset-initiate/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserModel } from '@/lib/models/user';
import { sendOTP } from '@/lib/email';
import { generateNumericOTP } from '@/lib/otp';
import { auth } from '@/lib/auth'; // Ensure you import auth for session
import { Types } from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid cashier ID' }, { status: 400 });
    }

    await connectToDatabase();
    const User = getUserModel();

    const cashier = await User.findOne({ _id: id, role: 'cashier' });

    if (!cashier) {
      return NextResponse.json({ message: 'Cashier not found or not a cashier role.' }, { status: 404 });
    }

    const otp = generateNumericOTP(6); // Generate 4-digit OTP
    const otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hours from now

    // Store the OTP and its expiry in the cashier's document
    cashier.passwordResetToken = otp;
    cashier.passwordResetToken = otp;
    cashier.isPasswordResetRequested = false; // Mark request as handled
    await cashier.save();

    // Send OTP to cashier's personal email
    // if (cashier.personalEmail) {
    //   await sendOTP(cashier.personalEmail, otp, "Your Cashier Password Reset OTP");
    //   console.log(`OTP (${otp}) sent to ${cashier.personalEmail} for password reset.`);
    // } else {
    //   console.warn(`No personal email for cashier ${cashier.email}. OTP not sent via email.`);
    //   // Optionally, return an error or a message indicating email wasn't sent
    // }
    console.log(`OTP (${otp}) generated for cashier ${cashier.email}. Not sending email.`);
    return NextResponse.json(
      {
        message: 'Password reset OTP generated and sent to cashier.',
        otp: otp, // Return OTP to admin for display
        otpExpires: otpExpires.toISOString(), // Return expiry for frontend timer
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('API Error initiating cashier password reset:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}