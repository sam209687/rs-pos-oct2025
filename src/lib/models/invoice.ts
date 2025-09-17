import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for a single item within an invoice
export interface IInvoiceItem {
  name: string;
  price: number;
  quantity: number;
  mrp?: number;
  gstRate?: number;
  hsn?:string;
}

// Interface for the main Invoice document
export interface IInvoice extends Document {
  _id: string;
  invoiceNumber: string;
  customer: Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  packingChargeDiscount: number;
  gstAmount: number;
  totalPayable: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  createdAt: Date;
  
}

const InvoiceItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  mrp: { type: Number },
  gstRate: { type: Number },
   hsn: { type: String },
}, { _id: false }); // _id is not needed for sub-documents

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    
  },
  customer: {
    type: Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  packingChargeDiscount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card'],
    required: true,
  },
}, { timestamps: true });

const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;