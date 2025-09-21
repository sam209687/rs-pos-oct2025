// src/lib/models/product.ts
import mongoose, { Schema, model, models, Types, Document } from 'mongoose';
import { IBrand } from './brand';
import { ICategory } from './category';
import { ITax } from './tax';
import './brand';
import './category';
import './unit';
import './tax';
import './variant';

export interface IProduct extends Document {
  _id : string;
  category: Types.ObjectId;
  brand: Types.ObjectId;
  productCode: string;
  productName: string;
  description?: string;
  // ✅ REMOVED: unit: Types.ObjectId;
  tax: Types.ObjectId;
  purchasePrice: number;
  packingCharges: number;
  laborCharges: number;
  electricityCharges: number;
  others1: number;
  others2: number;
  totalPrice: number;
  stockQuantity: number;
  stockAlertQuantity: number;
  // ✅ REMOVED: image?: string;
  // ✅ REMOVED: qrCode?: string;
  createdAt: Date;
}

export interface IPopulatedProduct extends Omit<IProduct, 'brand' | 'category' | 'tax'> {
  brand: IBrand;
  category: ICategory;
  tax : ITax
}

const ProductSchema = new Schema({
  category: { type: Types.ObjectId, ref: 'Category', required: true },
  brand: { type: Types.ObjectId, ref: 'Brand', required: true },
  productCode: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  description: { type: String },
  // ✅ REMOVED: unit: { type: Types.ObjectId, ref: 'Unit', required: true },
  tax: { type: Types.ObjectId, ref: 'Tax', required: true },
  purchasePrice: { type: Number, required: true },
  packingCharges: { type: Number, default: 0 },
  laborCharges: { type: Number, default: 0 },
  electricityCharges: { type: Number, default: 0 },
  others1: { type: Number, default: 0 },
  others2: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  stockAlertQuantity: { type: Number, required: true },
  // ✅ REMOVED: image: { type: String },
  // ✅ REMOVED: qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

ProductSchema.pre('findOneAndDelete', async function (next) {
  try {
    const product = await this.model.findOne(this.getQuery());
    if (product) {
      const Variant = mongoose.model('Variant');
      await Variant.deleteMany({ product: product._id });
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;