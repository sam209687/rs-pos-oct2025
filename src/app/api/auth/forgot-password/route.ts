// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserModel, IUser } from '@/lib/models/user';
import { sendOTP } from '@/lib/email';
// Import the new OTP generator
import { generateNumericOTP } from '@/lib/otp'; // <--- ADD THIS
import * as crypto from 'crypto';



export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const { email } = await req.json();

    console.log('Received forgot password request for email:', email);
    const initialAdminEmail = process.env.ADMIN_INITIAL_EMAIL;
    console.log('ADMIN_INITIAL_EMAIL from env:', initialAdminEmail);

    const user: IUser | null = await User.findOne({ email });
    console.log('User found in DB:', user ? user.email + ' (Role: ' + user.role + ')' : 'None');

    // --- Initial Admin Setup Flow ---
    if (!user && email === initialAdminEmail) {
      console.log('Entering Initial Admin Setup Flow...');

      let adminToUpdate: IUser | null = await User.findOne({
        email: initialAdminEmail,
        role: 'admin',
        isAdminInitialSetupComplete: false
      });

      if (!adminToUpdate) {
        adminToUpdate = await User.create({
          email: initialAdminEmail,
          password: 'TEMPORARY_PASSWORD_PLACEHOLDER',
          role: 'admin',
          isAdminInitialSetupComplete: false,
        });
        console.log(`Placeholder admin created for initial setup: ${initialAdminEmail}`);
      }

      if (adminToUpdate) {
        // Generate numeric OTP here
        const otp = generateNumericOTP(6); // <--- CHANGE IS HERE
        const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        adminToUpdate.passwordResetToken = otp;
        adminToUpdate.passwordResetExpires = otpExpires;
        adminToUpdate.isPasswordResetRequested = false;
        await adminToUpdate.save();

        console.log(`Sending OTP to initial admin: ${email}`);
        await sendOTP(email, otp);

        return NextResponse.json(
          {
            message: 'OTP sent to admin email. Please proceed to create your password.',
            initialSetup: true,
            email: email,
          },
          { status: 200 }
        );
      }
    }

    // --- Existing User (Admin/Cashier) Forgot Password Flow ---
    if (user) {
      console.log('Entering Existing User Flow (role:', user.role, ')...');
      if (user.role === 'admin') {
        // Generate numeric OTP here
        const otp = generateNumericOTP(6); // <--- CHANGE IS HERE
        const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        user.passwordResetToken = otp;
        user.passwordResetExpires = otpExpires;
        await user.save();

        console.log(`Sending OTP to existing admin: ${user.email}`);
        await sendOTP(user.email, otp);

        return NextResponse.json(
          { message: 'Password reset OTP sent to your email.' },
          { status: 200 }
        );
      } else if (user.role === 'cashier') {
        user.isPasswordResetRequested = true;
        user.passwordResetToken = crypto.randomBytes(20).toString('hex');
        user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();

        console.log(`Cashier ${user.email} requested password reset. Admin needs to initiate.`);

        return NextResponse.json(
          { message: 'Password reset request sent to admin. Please wait for admin response.' },
          { status: 200 }
        );
      }
    }

    console.log('Email not found in DB and not initial admin email. Returning generic message.');
    return NextResponse.json(
      { message: 'If your email is registered, a password reset OTP has been sent.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error.' }, { status: 500 });
  }
}