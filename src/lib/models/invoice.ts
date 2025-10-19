// src/lib/models/invoice.ts

import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './user'; 
import { ICustomer } from './customer'; 

export interface IInvoiceItem {
  name: string;
  price: number;
  quantity: number;
  variantId: Types.ObjectId | string; // FIX: Add variantId to interface
  mrp?: number;
  gstRate?: number;
  hsn?:string;
}

export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  customer: ICustomer | Types.ObjectId | string;
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  packingChargeDiscount: number;
  gstAmount: number;
  totalPayable: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  createdAt: Date;
  updatedAt: Date;
  billedBy: Partial<IUser> | Types.ObjectId | string;
  status: 'active' | 'cancelled';
}

const InvoiceItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variantId: { type: Types.ObjectId, ref: 'Variant', required: true }, // FIX: Add variantId to Schema
  mrp: { type: Number },
  gstRate: { type: Number },
   hsn: { type: String },
}, { _id: false });

// This line is now correct, using new Schema once.
const InvoiceSchema: Schema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: Types.ObjectId, ref: 'Customer', required: true },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  packingChargeDiscount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card'], required: true },
  billedBy: { type: Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
}, { timestamps: true });

// We still use Document for the Mongoose model itself
const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice & Document>('Invoice', InvoiceSchema);

export default Invoice;