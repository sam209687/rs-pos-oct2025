// src/lib/models/product.ts
import mongoose, { Schema, model, models, Types, Document } from 'mongoose';
import { IBrand } from './brand';
import { ICategory } from './category';
import { ITax } from './tax';
import './variant'; // ✅ NEW: Import the Variant model here

// (IProduct and IPopulatedProduct interfaces remain the same)
export interface IProduct extends Document {
  _id : string;
  category: Types.ObjectId;
  brand: Types.ObjectId;
  productCode: string;
  productName: string;
  description?: string;
  unit: Types.ObjectId;
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
  image?: string;
  qrCode?: string;
  createdAt: Date;
}

export interface IPopulatedProduct extends Omit<IProduct, 'brand' | 'category' | 'tax'> {
  brand: IBrand;
  category: ICategory;
  tax : ITax
}

const ProductSchema = new Schema({
  // ... (All your existing schema fields remain the same)
  category: { type: Types.ObjectId, ref: 'Category', required: true },
  brand: { type: Types.ObjectId, ref: 'Brand', required: true },
  productCode: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  description: { type: String },
  unit: { type: Types.ObjectId, ref: 'Unit', required: true },
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
  image: { type: String },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ✅ NEW: ADD THIS MIDDLEWARE FOR CASCADING DELETE
ProductSchema.pre('findOneAndDelete', async function (next) {
  try {
    // Get the product that is about to be deleted
    const product = await this.model.findOne(this.getQuery());
    
    if (product) {
      // Use mongoose.model to avoid circular dependency issues
      const Variant = mongoose.model('Variant');
      // Delete all variants that have this product's _id
      await Variant.deleteMany({ product: product._id });
    }
    next(); // Continue to delete the product
  } catch (error: any) {
    next(error);
  }
});


const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;