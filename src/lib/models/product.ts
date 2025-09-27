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
  sellingPrice: number; // ✅ NEW: Selling price field
  packingCharges: number;
  laborCharges: number;
  electricityCharges: number;
  others1: number;
  others2: number;
  totalPrice: number;
  // ✅ REMOVED: stockQuantity: number;
  // ✅ REMOVED: stockAlertQuantity: number;
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
  sellingPrice: { type: Number, required: true }, // ✅ NEW: Selling price schema field
  packingCharges: { type: Number, default: 0 },
  laborCharges: { type: Number, default: 0 },
  electricityCharges: { type: Number, default: 0 },
  others1: { type: Number, default: 0 },
  others2: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  // ✅ REMOVED: stockQuantity: { type: Number, required: true },
  // ✅ REMOVED: stockAlertQuantity: { type: Number, required: true },
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