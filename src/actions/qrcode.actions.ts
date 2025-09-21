// src/actions/qrcode.actions.ts
"use server";

import { connectToDatabase } from "@/lib/db";
import Variant from "@/lib/models/variant";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";

export const generateVariantQRCode = async (variantId: string) => {
  try {
    await connectToDatabase();
    const variant = await Variant.findById(variantId).populate("product unit");

    if (!variant) {
      return { success: false, message: "Variant not found." };
    }

    // Construct the data to be encoded in the QR code
    const qrData = {
      variantId: variant._id,
      productName: variant.product.productName,
      price: variant.price,
      variantVolume: variant.variantVolume,
      unit: variant.unit.unitName,
    };

    // Define the path to save the QR code image
    const qrCodeDir = path.join(process.cwd(), "public", "qrcodes");
    await fs.mkdir(qrCodeDir, { recursive: true });
    const qrCodeFileName = `variant-${variant._id}.png`;
    const qrCodePath = path.join(qrCodeDir, qrCodeFileName);
    const qrCodeUrl = `/qrcodes/${qrCodeFileName}`;

    // Generate the QR code as a data URL and save it as a file
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    await fs.writeFile(qrCodePath, base64Data, "base64");
    
    // Update the variant in the database with the QR code URL
    variant.qrCode = qrCodeUrl;
    await variant.save();

    return { success: true, message: "QR Code generated and saved successfully!" };
  } catch (error) {
    console.error("Failed to generate QR Code:", error);
    return { success: false, message: "Failed to generate QR Code." };
  }
};