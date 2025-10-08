"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Message from "@/lib/models/message";
import { getUserModel } from "@/lib/models/user";
import { messageSchema } from "@/lib/schemas";
import { z } from "zod";
import { Types } from "mongoose";

const User = getUserModel();

// ✅ FIX: Update the conversations aggregation pipeline to use Types.ObjectId
export const getConversations = async (userId: string) => {
  try {
    await connectToDatabase();

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: new Types.ObjectId(userId) }, { recipient: new Types.ObjectId(userId) }],
        },
      },
      {
        $project: {
          withUser: {
            $cond: {
              if: { $eq: ["$sender", new Types.ObjectId(userId)] },
              then: "$recipient",
              else: "$sender",
            },
          },
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$withUser",
          lastMessageAt: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          user: "$userDetails",
          lastMessageAt: 1,
        },
      },
    ]);

    return { success: true, data: JSON.parse(JSON.stringify(conversations)) };
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return { success: false, message: "Failed to fetch conversations." };
  }
};

export const getAllUsersForMessaging = async () => {
    try {
        await connectToDatabase();
        const users = await User.find({}, '_id name role').lean();
        return { success: true, data: JSON.parse(JSON.stringify(users)) };
    } catch (error) {
        console.error("Failed to fetch all users:", error);
        return { success: false, message: "Failed to fetch users." };
    }
};

export const getMessages = async (userId: string, recipientId: string) => {
  try {
    await connectToDatabase();

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    }).sort({ createdAt: 1 }).lean();

    await Message.updateMany(
      { sender: recipientId, recipient: userId, read: false },
      { read: true }
    );

    return { success: true, data: JSON.parse(JSON.stringify(messages)) };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { success: false, message: "Failed to fetch messages." };
  }
};

export const createMessage = async (data: z.infer<typeof messageSchema>) => {
  try {
    const validatedData = messageSchema.parse(data);
    await connectToDatabase();

    const newMessage = new Message(validatedData);
    await newMessage.save();

    revalidatePath("/admin/messages");

    return { success: true, data: JSON.parse(JSON.stringify(newMessage)), message: "Message sent successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Failed to create message:", error);
    return { success: false, message: "Failed to send message." };
  }
};