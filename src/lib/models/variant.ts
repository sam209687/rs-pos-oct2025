// src/lib/models/variant.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { IProduct, IPopulatedProduct } from './product';
import { IUnit } from './unit';
import './product';
import './unit';

export interface IVariant extends Document {
  _id: string;
  product: Types.ObjectId;
  variantVolume: number;
  unit: Types.ObjectId;
  variantColor?: string;
  price: number;
  mrp: number;
  discount?: number;
  stockQuantity: number;
  stockAlertQuantity: number;
  image?: string;
  qrCode?: string;
  packingCharges: number; // ✅ NEW: Packing charges field
  laborCharges: number; // ✅ NEW: Labor charges field
  electricityCharges: number; // ✅ NEW: Electricity charges field
  others1: number; // ✅ NEW: Other 1 charges field
  others2: number; // ✅ NEW: Other 2 charges field
  createdAt: Date;
}

export interface IPopulatedVariant extends Omit<IVariant, 'product' | 'unit'> {
  product: IPopulatedProduct;
  unit: IUnit;
}

const VariantSchema: Schema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantVolume: {
      type: Number,
      required: true,
    },
    unit: {
      type: Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    variantColor: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
    stockQuantity: {
      type: Number,
      required: true,
    },
    stockAlertQuantity: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    packingCharges: { type: Number, default: 0 }, // ✅ NEW: Packing charges
    laborCharges: { type: Number, default: 0 }, // ✅ NEW: Labor charges
    electricityCharges: { type: Number, default: 0 }, // ✅ NEW: Electricity charges
    others1: { type: Number, default: 0 }, // ✅ NEW: Other 1 charges
    others2: { type: Number, default: 0 }, // ✅ NEW: Other 2 charges
  },
  {
    timestamps: true,
  }
);

const Variant = mongoose.models.Variant || mongoose.model<IVariant>('Variant', VariantSchema);

export default Variant;