import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './user'; // Assuming you have IUser
import { ICustomer } from './customer'; // Assuming you have ICustomer

export interface IInvoiceItem {
  name: string;
  price: number;
  quantity: number;
  mrp?: number;
  gstRate?: number;
  hsn?:string;
}

// ✅ FIX: This interface no longer extends Document. It's a plain object.
export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  customer: ICustomer | Types.ObjectId | string; // Allow for populated object
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  packingChargeDiscount: number;
  gstAmount: number;
  totalPayable: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  createdAt: Date;
  updatedAt: Date;
  billedBy: Partial<IUser> | Types.ObjectId | string; // Allow for populated object
  status: 'active' | 'cancelled';
}

const InvoiceItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  mrp: { type: Number },
  gstRate: { type: Number },
   hsn: { type: String },
}, { _id: false });

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