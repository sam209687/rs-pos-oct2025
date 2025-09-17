// src/lib/models/currency.ts
import { Schema, model, models } from 'mongoose';

const CurrencySchema = new Schema({
  sNo: {
    type: String,
    required: true,
    unique: true,
  },
  currencySymbol: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Currency = models.Currency || model('Currency', CurrencySchema);

export default Currency;