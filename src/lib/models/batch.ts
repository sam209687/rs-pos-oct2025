import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBatch extends Document {
  _id: string;
  product: Types.ObjectId;
  batchNumber: string;
  vendorName: string;
  qty: number;
  price: number;
  perUnitPrice?: number;
  oilCakeProduced?: number;
  oilExpelled?: number;
  createdAt: Date;
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
    vendorName: {
      type: String,
      required: [true, "Vendor name is required."],
      trim: true,
    },
    qty: {
      type: Number,
      required: [true, "Quantity is required."],
      min: [0, "Quantity cannot be negative."],
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    perUnitPrice: {
      type: Number,
    },
    oilCakeProduced: {
      type: Number,
      min: [0, "Oil cake produced cannot be negative."],
    },
    oilExpelled: {
      type: Number,
      min: [0, "Oil expelled cannot be negative."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;