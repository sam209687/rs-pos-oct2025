// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/db';
import { getUserModel, IUser } from '@/lib/models/user';
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const { email, otp, newPassword, confirmPassword, isInitialSetup } =
      await req.json();

    console.log("--- Reset Password API Request Received ---");
    console.log("Backend received payload:", {
      email,
      otp,
      newPassword,
      confirmPassword,
      isInitialSetup,
    });

    // 1. Basic Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "All required fields are missing." },
        { status: 400 }
      );
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      return NextResponse.json(
        { message: "New passwords do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or OTP." },
        { status: 400 }
      );
    }

    // --- OTP Validation and Password Reset/Setup ---
    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== otp ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return NextResponse.json(
        { message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.isPasswordResetRequested = false;

    // ✅ FIX: Set isAdminInitialSetupComplete to true after successful verification
    if (user.role === 'admin' && isInitialSetup) {
      user.isAdminInitialSetupComplete = true;
    }

    await user.save();
    
    const successMessage = isInitialSetup 
        ? "Admin account created successfully. You can now log in."
        : "Password reset successfully. You can now log in.";

    console.log(`Success: ${successMessage}`);

    return NextResponse.json(
      { message: successMessage },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}