import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import AppError from '../../shared/appError';
import { ITextileProduct } from '../model/product.types';
// Define the Zod schema for product validation

export const addTextileProductSchema: z.ZodType<Omit<ITextileProduct, 'productId' | 'created_at' | 'updated_at'>> =
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'Product name is required' })
      .max(100, { message: 'Product name must not exceed 100 characters' })
      .regex(/^[a-zA-Z0-9 ]+$/, { message: 'Product name must only contain letters, numbers, and spaces' }),

    description: z
      .string()
      .trim()
      .min(1, { message: 'Product description is required' })
      .max(500, { message: 'Product description must not exceed 500 characters' }),

    category: z
      .string()
      .trim()
      .min(1, { message: 'Product category is required' })
      .max(50, { message: 'Product category must not exceed 50 characters' }),

    brand: z
      .string()
      .trim()
      .min(1, { message: 'Product brand is required' })
      .max(50, { message: 'Product brand must not exceed 50 characters' }),

    color: z
      .string()
      .trim()
      .min(1, { message: 'Product color is required' })
      .max(50, { message: 'Product color must not exceed 50 characters' }),

    price: z
      .number({ invalid_type_error: 'Price must be a number' })
      .positive({ message: 'Price must be a positive number' }),

    unit: z
      .string()
      .trim()
      .min(1, { message: 'Product unit is required' })
      .max(20, { message: 'Product unit must not exceed 20 characters' }),

    image_url: z.string().url({ message: 'Image URL must be a valid URL' }),

    stock_quantity: z
      .number({ invalid_type_error: 'Stock quantity must be a number' })
      .nonnegative({ message: 'Stock quantity must be zero or a positive number' }),

    weight: z
      .number({ invalid_type_error: 'Weight must be a number' })
      .positive({ message: 'Weight must be a positive number' }),

    dimensions: z.object({
      length: z
        .number({ invalid_type_error: 'Length must be a number' })
        .positive({ message: 'Length must be a positive number' }),

      width: z
        .number({ invalid_type_error: 'Width must be a number' })
        .positive({ message: 'Width must be a positive number' }),
    }),

    composition: z
      .string()
      .trim()
      .min(1, { message: 'Product composition is required' })
      .max(100, { message: 'Product composition must not exceed 100 characters' }),

    suitable_for: z
      .array(z.string().min(1, { message: 'Each suitable_for item must be a non-empty string' }))
      .nonempty({ message: 'At least one suitable_for value is required' }),

    care_instructions: z
      .string()
      .trim()
      .min(1, { message: 'Care instructions are required' })
      .max(300, { message: 'Care instructions must not exceed 300 characters' }),

    origin: z
      .string()
      .trim()
      .min(1, { message: 'Product origin is required' })
      .max(50, { message: 'Product origin must not exceed 50 characters' }),

    sustainability_rating: z
      .string()
      .trim()
      .min(1, { message: 'Sustainability rating is required' })
      .max(20, { message: 'Sustainability rating must not exceed 20 characters' }),

    texture: z
      .string()
      .trim()
      .min(1, { message: 'Product texture is required' })
      .max(50, { message: 'Product texture must not exceed 50 characters' }),

    fire_retardant: z.boolean(),
    water_resistant: z.boolean(),

    pattern: z
      .string()
      .trim()
      .min(1, { message: 'Product pattern is required' })
      .max(50, { message: 'Product pattern must not exceed 50 characters' }),

    tags: z
      .array(z.string().min(1, { message: 'Each tag must be a non-empty string' }))
      .nonempty({ message: 'At least one tag is required' }),
  });

// Middleware to validate the request body using the Zod schema
export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body using the Zod schema
  const reqBodyData: Omit<ITextileProduct, 'productId'> = req.body;
  const response = addTextileProductSchema.safeParse(reqBodyData);
  if (response.success) {
    next();
  } else {
    console.log('response.error', response.error);

    const firstError = response.error.errors[0];
    if (firstError.code === 'invalid_type' && firstError.message === 'Required') {
      next(new AppError('Please check all the field names', 400));
    } else if (firstError.code === 'invalid_type' && firstError.message !== 'Required') {
      next(new AppError(firstError.message, 400));
    } else {
      next(new AppError(firstError.message, 400));
    }
  }
};
