// src/lib/models/oec.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOec extends Document {
  product: Types.ObjectId;
  oilExpellingCharges: number;
}

const OecSchema: Schema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true, // Assuming one OEC entry per product
    },
    oilExpellingCharges: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Oec = mongoose.models.Oec || mongoose.model<IOec>('Oec', OecSchema);

export default Oec;