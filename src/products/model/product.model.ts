import { ITextileProduct } from './product.types';
import mongoose from 'mongoose';

// Define the schema for the textile product
const textileProductSchema = new mongoose.Schema<ITextileProduct>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  stock_quantity: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  dimensions: {
    length: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: false,
    },
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
  tags: [
    {
      type: String,
    },
  ],
  composition: {
    type: String,
    required: true,
  },
  suitable_for: [
    {
      type: String,
    },
  ],
  care_instructions: {
    type: String,
  },
  origin: {
    type: String,
  },
  sustainability_rating: {
    type: String,
  },
  texture: {
    type: String,
  },
  fire_retardant: {
    type: Boolean,
    default: false,
  },
  water_resistant: {
    type: Boolean,
    default: false,
  },
  pattern: {
    type: String,
  },
});
// Middleware to update the 'updatedAt' field before each save
textileProductSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});
// Create a model based on the schema
const TextileProduct = mongoose.model('TextileProduct', textileProductSchema);

export default TextileProduct;
