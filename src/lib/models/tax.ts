import mongoose, { Schema, Document } from 'mongoose';

export interface ITax extends Document {
  _id: string;
  name: string;
  hsn: string; // Added HSN field
  gst: number; // Added GST field
}

const TaxSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Tax name is required.'],
    unique: true,
    trim: true,
  },
  hsn: {
    type: String,
    required: [true, 'HSN is required.'],
    trim: true,
  },
  gst: {
    type: Number,
    required: [true, 'GST is required.'],
  },
}, { timestamps: true });

const Tax = mongoose.models.Tax || mongoose.model<ITax>('Tax', TaxSchema);

export default Tax;