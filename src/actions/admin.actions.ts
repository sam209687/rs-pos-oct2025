// src/lib/actions/admin.actions.ts
"use server";

import { connectToDatabase } from "@/lib/db";
import { getUserModel } from "@/lib/models/user";

/**
 * Counts the number of cashier users who have the 'isPasswordResetRequested' flag set to true.
 * @returns {Promise<{count: number}>} An object containing the count of pending requests.
 */
export async function getResetRequestsCount(): Promise<{ count: number }> {
  try {
    await connectToDatabase();
    const User = getUserModel();

    const count = await User.countDocuments({
      role: 'cashier',
      isPasswordResetRequested: true,
    });

    return { count };
  } catch (error) {
    console.error("Failed to fetch reset request count:", error);
    return { count: 0 };
  }
}