// src/lib/utils.ts
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import mongoose from "mongoose";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export const formatMongoData = (data: any | any[]): any | any[] => {
  if (!data) return data;

  const processObject = (item: any) => {
    // If it's a mongoose document, convert it to a plain object
    if (item instanceof mongoose.Document) {
      const obj = item.toObject({ getters: true });
      // Ensure the _id field is always a string
      obj._id = obj._id.toString();
      return obj;
    }
    return item;
  };

  if (Array.isArray(data)) {
    return data.map(processObject);
  } else {
    return processObject(data);
  }
};