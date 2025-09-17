// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Function to generate a unique file name
const generateUniqueFileName = (originalName: string) => {
  const fileExtension = path.extname(originalName);
  const fileName = path.basename(originalName, fileExtension);
  const uniqueId = Date.now();
  return `${fileName}-${uniqueId}${fileExtension}`;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded." }, { status: 400 });
    }

    const uniqueFileName = generateUniqueFileName(file.name);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, uniqueFileName);

    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;
    
    return NextResponse.json({ success: true, data: { url: fileUrl } });
  } catch (error) {
    console.error("File upload failed:", error);
    return NextResponse.json({ success: false, message: "File upload failed." }, { status: 500 });
  }
}