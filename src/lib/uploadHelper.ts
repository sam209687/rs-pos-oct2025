// src/lib/uploadHelper.ts
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const uploadFile = async (file: File | undefined, prefix: string): Promise<string | undefined> => {
  if (!file || file.size === 0) return undefined;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitize the filename to prevent path traversal issues
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
  const filename = `${Date.now()}-${prefix}-${sanitizedFileName}`;
  const uploadDir = join(process.cwd(), 'public/uploads');
  const path = join(uploadDir, filename);
  
  // Ensure the upload directory exists
  const fs = require('fs');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await writeFile(path, buffer);
  return `/uploads/${filename}`;
};