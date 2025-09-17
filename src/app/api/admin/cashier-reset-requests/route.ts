// src/app/api/admin/cashier-reset-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserModel } from '@/lib/models/user';
import { auth } from '@/lib/auth'; // Ensure you import auth for session

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const User = getUserModel();

    // Find cashiers who have requested a password reset
    const resetRequests = await User.find({
      role: 'cashier',
      isPasswordResetRequested: true,
    }).select('_id name email personalEmail'); // Select relevant fields

    return NextResponse.json(resetRequests, { status: 200 });

  } catch (error: any) {
    console.error('API Error fetching cashier reset requests:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}