import fs from 'fs/promises';
import path from 'path';

/**
 * Uploads a file to a specified public directory.
 * @param file The file object (from FormData, typically a Next.js File type).
 * @param subfolder The subfolder within public/image/ (e.g., 'brand', 'product').
 * @returns The public URL path of the uploaded image.
 * @throws Error if file operations fail or directory cannot be created.
 */
export async function uploadImage(file: File, subfolder: string): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('No file provided for upload.');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'image', subfolder);

  try {
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating upload directory ${uploadDir}:`, error);
    throw new Error(`Failed to create upload directory.`);
  }

  // Sanitize filename and make it unique
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  try {
    // Convert File to Buffer and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return the public URL path
    return `/image/${subfolder}/${uniqueFilename}`;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw new Error(`Failed to upload image.`);
  }
}

/**
 * Deletes an image from the public directory.
 * @param imageUrl The public URL path of the image (e.g., /image/brand/123-image.png).
 * @returns True if deletion was successful, false if file not found, throws on other errors.
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || !imageUrl.startsWith('/image/')) {
    console.warn(`Invalid image URL for deletion: ${imageUrl}`);
    return false; // Not a managed image URL
  }

  const relativePath = imageUrl.substring(1); // Remove leading slash
  const fullPath = path.join(process.cwd(), 'public', relativePath);

  try {
    await fs.unlink(fullPath);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`Attempted to delete non-existent file: ${fullPath}`);
      return false; // File not found, consider it deleted
    }
    console.error(`Error deleting image ${fullPath}:`, error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}