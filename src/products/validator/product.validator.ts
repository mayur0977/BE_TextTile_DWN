import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import AppError from '../../shared/appError';
import { Product } from '../model/product.model';

// Define the Zod schema for product validation
export const addProductSchema: z.ZodType<Omit<Product, 'productId'>> = z.object({
  productName: z
    .string()
    .trim()
    .min(1, { message: 'Product name is required' })
    .max(10, { message: 'Product name must not exceed 10 characters' })
    .regex(/^[a-zA-Z0-9 ]+$/, 'Product name must only contain letters, numbers, and spaces')
    .refine((val) => !/\d{3}/.test(val), { message: 'Product name must not have 3 consecutive digits' }),
  productDescription: z
    .string()
    .trim()
    .min(1, { message: 'Product description is required' })
    .max(100, { message: 'Product description must not exceed 100 characters' }),

  categoryId: z
    .number({ invalid_type_error: 'Category Id must be a number' })
    .positive({ message: 'Category id must be a positive number' }),

  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive({ message: 'Price must be a positive number' }),

  stockQuantity: z
    .number({ invalid_type_error: 'Stock quantity must be a number' })
    .positive({ message: 'Stock quantity must be a positive number' }),

  featured: z.boolean({ invalid_type_error: 'Featured must be a selected value from yes/no' }),
});

// Middleware to validate the request body using the Zod schema
export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body using the Zod schema
  const reqBodyData: Omit<Product, 'productId'> = req.body;
  const response = addProductSchema.safeParse(reqBodyData);
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
