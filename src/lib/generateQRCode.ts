// src/lib/generateQRCode.ts
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';

/**
 * Generates and saves a QR code for the given data.
 * @param data The string content to encode in the QR code.
 * @param fileName The desired name of the output file (e.g., 'my-qr-code.png').
 * @returns The path to the saved QR code image.
 */
export const generateQRCode = async (data: string, fileName: string): Promise<string> => {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, fileName);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await QRCode.toFile(filePath, data);
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Failed to generate and save QR code:", error);
    throw new Error("Failed to generate and save QR code.");
  }
};