import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  _id: string;
  name: string;
}

const UnitSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Unit name is required.'],
    unique: true,
    trim: true,
  },
}, { timestamps: true });

const Unit = mongoose.models.Unit || mongoose.model<IUnit>('Unit', UnitSchema);

export default Unit;