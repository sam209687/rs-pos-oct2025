// src/lib/models/packingMaterial.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPackingMaterial extends Document {
  _id: string;
  name: string;
  capacityVolume: number; // e.g., 500
  capacityUnit: Schema.Types.ObjectId; // Reference to Unit model (ml, L, kg, etc.)
  manufacturerName: string;
  purchasedQuantity: number;
  stockAlertQuantity: number;
  // Note: 'balance' is a derived field, calculated on the fly in actions/store.
}

const PackingMaterialSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Material name is required.'],
    trim: true,
  },
  capacityVolume: {
    type: Number,
    required: [true, 'Volume/Capacity is required.'],
    min: [0, 'Volume/Capacity must be positive.'],
  },
  capacityUnit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: [true, 'Unit is required.'],
  },
  manufacturerName: {
    type: String,
    required: [true, 'Manufacturer name is required.'],
    trim: true,
  },
  purchasedQuantity: {
    type: Number,
    required: [true, 'Purchased quantity is required.'],
    min: [0, 'Purchased quantity cannot be negative.'],
  },
  stockAlertQuantity: {
    type: Number,
    required: [true, 'Stock alert quantity is required.'],
    min: [0, 'Stock alert quantity cannot be negative.'],
  },
}, { timestamps: true });

// Populate the unit when finding
PackingMaterialSchema.pre('find', function() {
    this.populate('capacityUnit');
});

PackingMaterialSchema.pre('findOne', function() {
    this.populate('capacityUnit');
});


const PackingMaterial = mongoose.models.PackingMaterial || mongoose.model<IPackingMaterial>('PackingMaterial', PackingMaterialSchema);

export default PackingMaterial;