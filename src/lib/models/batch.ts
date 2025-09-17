// src/lib/models/batch.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBatch extends Document {
  _id: string;
  product: Types.ObjectId;
  batchNumber: string;
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
  },
  { timestamps: true }
);

const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;