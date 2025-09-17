import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Omit<Document, '_id'> { // Exclude the original _id from Document
  _id: string; // Explicitly define _id as a string
  name: string;
  imageUrl: string;
}

const BrandSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required.'],
    unique: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Brand image URL is required.'],
  },
}, { timestamps: true });

const Brand = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;