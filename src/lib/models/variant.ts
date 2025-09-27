// src/lib/models/variant.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { IPopulatedProduct, IProduct } from './product';
import { IUnit } from './unit';

export interface IVariant extends Document {
  _id: string;
  product: Types.ObjectId | IProduct;
  variantVolume: number;
  unit: Types.ObjectId | IUnit;
  variantColor?: string;
  price: number;
  mrp: number;
  discount: number;
  stockQuantity: number; // ✅ NEW: Stock quantity field
  stockAlertQuantity: number; // ✅ NEW: Stock alert quantity field
  image: string;
  qrCode?: string;
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
      required: [true, "Product is required."],
    },
    variantVolume: {
      type: Number,
      required: [true, "Variant volume is required."],
    },
    unit: {
      type: Types.ObjectId,
      ref: 'Unit',
      required: [true, "Unit is required."],
    },
    variantColor: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
    },
    mrp: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0
    },
    stockQuantity: { // ✅ NEW: Stock quantity schema field
      type: Number,
      required: true,
      default: 0
    },
    stockAlertQuantity: { // ✅ NEW: Stock alert quantity schema field
      type: Number,
      required: true,
      default: 0
    },
    image: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

const Variant = mongoose.models.Variant || mongoose.model<IVariant>('Variant', VariantSchema);

export default Variant;