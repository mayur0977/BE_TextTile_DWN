import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import AppError from '../../shared/appError';
import { CategoryRequest } from '../model/categories.model';

// Define the Zod schema for category validation
export const addCategorySchema: z.ZodType<CategoryRequest> = z.object({
  categoryName: z
    .string()
    .trim()
    .min(1, { message: 'Category name is required' })
    .max(30, { message: 'Category name must not exceed 30 characters' })
    .regex(/^[a-zA-Z0-9 ]+$/, 'Category name must only contain letters, numbers, and spaces'),
});

// Middleware to validate the request body using the Zod schema
export const validateCategory = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body using the Zod schema
  const reqBodyData: CategoryRequest = req.body;
  const response = addCategorySchema.safeParse(reqBodyData);
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
