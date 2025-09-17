// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getUserModel, IUser } from "@/lib/models/user";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const { email, otp, newPassword, confirmPassword, isInitialSetup } =
      await req.json();

    console.log("--- Reset Password API Request Received ---");
    console.log(`Raw newPassword from request: "${newPassword}"`);
    console.log(`Raw confirmPassword from request: "${confirmPassword}"`);
    console.log("Backend received payload:", {
      email,
      otp,
      newPassword,
      confirmPassword,
      isInitialSetup,
    });

    // 1. Basic Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      // Ensure confirmNewPassword is received
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

    // IMPORTANT: Add password strength validation here
    // This should align with any validation on your login/signup forms, or your Mongoose schema (minlength)
    if (newPassword.length < 8) {
      // Assuming min 8 characters based on common practices/your Mongoose schema `minlength: [6, ...]` and potential screenshot
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
    // You can add more complex regex checks for strong passwords (e.g., uppercase, lowercase, number, symbol)
    // Example: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(newPassword) for very strong

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or OTP." },
        { status: 400 }
      );
    }

    // --- Handle Initial Admin Setup (Create Account) Flow ---
    if (isInitialSetup) {
      if (user.role !== "admin" || user.isAdminInitialSetupComplete) {
        return NextResponse.json(
          { message: "Admin account already set up or role mismatch." },
          { status: 409 }
        );
      }

      // VERIFY OTP for initial setup
      // VERIFY OTP for initial setup (assuming OTP also needs trimming for comparison if it's alphanumeric)
      // Ensure user.passwordResetToken is storing the OTP string, not an object.
      if (
        !user.passwordResetToken ||
        user.passwordResetToken !== otp ||
        !user.passwordResetExpires ||
        user.passwordResetExpires < new Date()
      ) {
        // It's good to clear these on invalid attempt too, to prevent brute force
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save(); // Save to clear tokens
        return NextResponse.json(
          { message: "Invalid or expired OTP." },
          { status: 400 }
        );
      }

      console.log(
        `[RESET API - Before Hash] newPassword (trimmed): "${newPassword.trim()}"`
      ); // CRITICAL LOG
      console.log(
        `[RESET API - Before Hash] newPassword char codes: [${[...newPassword.trim()].map((char) => char.charCodeAt(0)).join(", ")}]`
      );

      const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
      user.password = hashedPassword;
      user.isAdminInitialSetupComplete = true;
      user.passwordResetToken = undefined; // Clear the OTP
      user.passwordResetExpires = undefined; // Clear the expiry

      await user.save();
      console.log(
        `Admin account setup complete for ${email}. New password hashed and saved.`
      );
      return NextResponse.json(
        { message: "Admin account setup complete. You can now log in." },
        { status: 200 }
      );
    } else {
      // --- Existing Admin/Cashier Password Reset Flow ---

      // VERIFY OTP for existing user reset
      if (
        !user.passwordResetToken ||
        user.passwordResetToken !== otp ||
        !user.passwordResetExpires ||
        user.passwordResetExpires < new Date()
      ) {
        // Clear on invalid attempt
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save(); // Save to clear tokens
        return NextResponse.json(
          { message: "Invalid or expired OTP. Please request a new reset." },
          { status: 400 }
        );
      }

      console.log(
        `[RESET API - Before Hash] newPassword (trimmed): "${newPassword.trim()}"`
      ); // CRITICAL LOG
      +console.log(
        `[RESET API - Before Hash] newPassword char codes: [${[...newPassword.trim()].map((char) => char.charCodeAt(0)).join(", ")}]`
      );

      const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.isPasswordResetRequested = false; // Reset this flag if it was set

      await user.save();
      console.log(
        `Password reset successfully for ${email}. New password hashed and saved.`
      );
      return NextResponse.json(
        { message: "Password reset successfully. You can now log in." },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
