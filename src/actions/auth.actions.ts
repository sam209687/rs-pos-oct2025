// src/actions/auth.actions.ts
"use server";

import { auth } from '@/lib/auth'; // Import NextAuth's auth function
import { connectToDatabase } from '@/lib/db';
import { getUserModel } from '@/lib/models/user';

const User = getUserModel();

// ✅ NEW: Server action to get the NextAuth.js session
export const getSessionUser = async () => {
  try {
    const session = await auth();
    console.log("Auth session:", session);

    if (!session?.user?.email) {
      return { success: false, message: "No session found." };
    }

    await connectToDatabase();
    // Fetch the full user document from the database using the email from the session
    const user = await User.findOne({ email: session.user.email }).lean();
    
    if (!user) {
      return { success: false, message: "User not found." };
    }

    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Failed to get session user:", error);
    return { success: false, message: "Failed to get session user." };
  }
};