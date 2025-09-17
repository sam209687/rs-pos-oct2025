// src/lib/generate-prod-code.ts
import Product from "@/lib/models/product";
import { connectToDatabase } from "@/lib/db";

export const generateProductCode = async (codePrefix: string) => {
  try {
    await connectToDatabase();

    // Find the last product with the given prefix
    const lastProduct = await Product.findOne({
      productCode: new RegExp(`^${codePrefix}\\d{4}$`),
    }).sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastProduct) {
      // Extract the numerical part, convert to a number, and increment
      const lastNumber = parseInt(lastProduct.productCode.slice(codePrefix.length));
      nextNumber = lastNumber + 1;
    }

    // Pad the number with leading zeros to ensure a length of 4
    const paddedNumber = String(nextNumber).padStart(4, "0");
    
    // Combine the prefix and the padded number
    return `${codePrefix}${paddedNumber}`;
  } catch (error) {
    console.error("Error generating product code:", error);
    return codePrefix; // Fallback to just the prefix in case of an error
  }
};