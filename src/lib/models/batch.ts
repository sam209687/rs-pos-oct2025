import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBatch extends Document {
  _id: string;
  product: Types.ObjectId;
  batchNumber: string;
  vendorName: string; // ✅ NEW: Vendor name
  qty: number; // ✅ NEW: Quantity
  price: number; // ✅ NEW: Price
}

const BatchSchema: Schema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: [true, "Product is required."],
    },
    batchNumber: {
      type: String,
      required: [true, "Batch number is required."],
      unique: true,
      trim: true,
    },
    vendorName: { // ✅ NEW: Vendor name schema field
      type: String,
      required: [true, "Vendor name is required."],
      trim: true,
    },
    qty: { // ✅ NEW: Quantity schema field
      type: Number,
      required: [true, "Quantity is required."],
      min: [0, "Quantity cannot be negative."],
    },
    price: { // ✅ NEW: Price schema field
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
  },
  { timestamps: true }
);

const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;