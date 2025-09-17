import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IStore extends Document {
  storeName: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  contactNumber: string;
  email: string;
  fssai?: string; // ✅ UPDATED: Optional FSSAI field
  pan?: string;   // ✅ NEW: Optional PAN field
  gst?: string;   // ✅ NEW: Optional GST field
  logo?: string;
  qrCode?: string;
  mediaUrl?: string; 
  mediaQRCode?: string; // ✅ NEW: Optional Media QR Code field
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  // ✅ REMOVED: fssaiTinPan field
  fssai: { // ✅ NEW
    type: String,
    trim: true,
  },
  pan: { // ✅ NEW
    type: String,
    trim: true,
  },
  gst: { // ✅ NEW
    type: String,
    trim: true,
  },
  logo: {
    type: String,
  },
  qrCode: {
    type: String,
  },
  mediaUrl: 
  { type: String, trim: true },

  mediaQRCode: { // ✅ NEW
    type: String,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'INACTIVE',
    required: true,
  },
}, { timestamps: true });

// Ensure only one store can be active at a time
StoreSchema.pre('save', async function (next) {
  if (this.isModified('status') && this.status === 'ACTIVE') {
    // Correctly reference the model
    await (this.constructor as mongoose.Model<IStore>).updateMany(
      { _id: { $ne: this._id } },
      { $set: { status: 'INACTIVE' } }
    );
  }
  next();
});

const Store = models.Store || model<IStore>('Store', StoreSchema);

export default Store;