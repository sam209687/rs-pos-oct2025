// src/lib/schemas/packingMaterialSchema.ts

import { z } from "zod";

export const packingMaterialSchema = z.object({
  name: z.string().min(1, "Name is required."),
  capacityVolume: z.coerce.number().min(1, "Volume/Capacity must be a positive number."),
  capacityUnit: z.string().min(1, "Unit is required."), // This is the ID string
  manufacturerName: z.string().min(1, "Manufacturer Name is required."),
  purchasedQuantity: z.coerce.number().min(0, "Purchased Qty cannot be negative."),
  stockAlertQuantity: z.coerce.number().min(0, "Stock Alert Qty cannot be negative."),
});

export type PackingMaterialFormValues = z.infer<typeof packingMaterialSchema>;