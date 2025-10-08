// src/actions/user.actions.ts
"use server";

import { connectToDatabase } from "@/lib/db";
import { getUserModel } from "@/lib/models/user";

const User = getUserModel();

// ✅ NEW: Server action to get the details of a single user
export async function getAuthenticatedUser(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId).lean();

    // ✅ ADDED: Console log to check if the user is fetched
    console.log("Fetching user from DB for ID:", userId);
    console.log("User fetched:", user);

    if (!user) {
      return { success: false, message: "User not found." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { success: false, message: "Failed to fetch user." };
  }
}