/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../../shared/apiResponse';
import asyncHandler from '../../shared/asyncHandler';
import pool from '../../shared/dbConnect';
import { Category } from '../model/categories.model';
import AppError from '../../shared/appError';
import { allCategoriesMapped, oneCategoryMapped } from '../adapter/categories.adapter';

export const getAllCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM categories');

    const mappedCategories = allCategoriesMapped(result.rows);
    res.status(200).send(new ApiResponse(mappedCategories, 'success'));
  } catch (error) {
    next(error);
  }
});

export const createCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();

    const values: Category = req.body;
    if (!values.categoryName) {
      return next(new AppError('Category Name is required', 422));
    }

    const existsResult = await client.query({
      text: 'SELECT EXISTS (SELECT * FROM categories WHERE category_name = $1)',
      values: [values.categoryName],
    });

    if (existsResult.rows[0].exists) {
      return next(new AppError(`Category ${values.categoryName} already exists`, 409));
    }

    const result = await client.query({
      text: 'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
      values: [values.categoryName],
    });

    const mappedCategory = oneCategoryMapped(result.rows[0]);
    return res.status(201).send(new ApiResponse(mappedCategory, 'success'));
  } catch (error) {
    next(error);
  }
});

export const updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();

    const values: Category = req.body;
    const categoryId = req.params.id;
    if (!values.categoryName) {
      return next(new AppError('Category Name is required', 422));
    } else {
      const existsResult = await client.query({
        text: 'SELECT EXISTS (SELECT * FROM categories WHERE category_name = $1)',
        values: [values.categoryName],
      });

      if (existsResult.rows[0].exists) {
        return next(new AppError(`Category ${values.categoryName} already exists`, 409));
      }
    }

    const result = await client.query({
      text: `
            UPDATE categories
            SET category_name = $1 
            WHERE category_id = $2
            RETURNING *
        `,
      values: [values.categoryName, categoryId],
    });

    if (result.rowCount === 0) {
      return next(new AppError('Category not found', 404));
    }
    // console.log('result.rows[0]', result.rows[0]);

    const mappedCategory = oneCategoryMapped(result.rows[0]);
    return res.status(200).send(new ApiResponse(mappedCategory, 'success'));
  } catch (error: any) {
    next(error);
  }
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();
    const countResult = await client.query({
      text: 'SELECT COUNT(*) FROM products WHERE category_id = $1',
      values: [req.params.id],
    });

    if (countResult.rows[0].count > 0) {
      return next(new AppError(`Category is being used in ${countResult.rows[0].count} product(s)`, 409));
    }

    const result = await client.query({
      text: 'DELETE FROM categories WHERE category_id = $1',
      values: [req.params.id],
    });

    if (result.rowCount == 0) {
      return next(new AppError('Category not found', 404));
    }

    return res.status(204).send(new ApiResponse(null, 'success'));
  } catch (error: any) {
    next(error);
  }
});
