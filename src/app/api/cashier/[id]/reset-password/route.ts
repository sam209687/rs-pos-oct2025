import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserModel } from '@/lib/models/user';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// The cost factor for bcrypt hashing. Higher is more secure but slower.
const password_hash_cost = 12;

// Utility function to generate a simple temporary password
function generateTempPassword(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Cashier ID' }, { status: 400 });
    }

    const cashier = await User.findById(id);

    if (!cashier || cashier.role !== 'cashier') {
      return NextResponse.json({ message: 'Cashier not found or not a cashier role' }, { status: 404 });
    }

    // Generate a new temporary password
    const tempPassword = generateTempPassword(8);
    
    // Hashing with bcryptjs
    const hashedPassword = await bcrypt.hash(tempPassword, password_hash_cost);

    // Update cashier's password and clear reset flags
    cashier.password = hashedPassword;
    cashier.isPasswordResetRequested = false;
    cashier.passwordResetToken = undefined;
    cashier.passwordResetExpires = undefined;

    await cashier.save();

    console.log(`--- Password Reset for ${cashier.name} (${cashier.email}) ---`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log(`Personal Email for sending: ${cashier.personalEmail || 'Not Available'}`);

    return NextResponse.json({ message: `Password reset successfully. Temporary password sent to ${cashier.personalEmail || 'cashier\'s personal email'}.` }, { status: 200 });

  } catch (error: any) {
    console.error("Error resetting cashier password:", error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}