/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../../shared/apiResponse';
import asyncHandler from '../../shared/asyncHandler';
import pool from '../../shared/dbConnect';
import AppError from '../../shared/appError';

export const getCartByUserId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();
    const { id } = req.params;
    const { rows } = await client.query('SELECT * FROM cart WHERE user_id = $1', [id]);

    res.status(200).send(new ApiResponse(rows, 'success'));
  } catch (error) {
    next(error);
  }
});

export const AddToCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();

    const values: { userId: number; productId: number } = req.body;

    // Check if Product exists in the products table
    const existsResult = await client.query({
      text: 'SELECT EXISTS (SELECT * FROM products WHERE product_id = $1)',
      values: [values.productId],
    });

    if (!existsResult.rows[0].exists) {
      return next(new AppError('product not found', 422));
    }

    // Check if the product already exists in the user's cart
    const { rowCount } = await client.query('SELECT 1 FROM cart WHERE user_id = $1 AND product_id = $2', [
      values.userId,
      values.productId,
    ]);

    if (rowCount && rowCount > 0) {
      return next(new AppError('Product already exists in the cart.', 400));
    }

    // Check if enough quantity is available in the products table
    const productQuery = await client.query('SELECT stock_quantity FROM products WHERE product_id = $1', [
      values.productId,
    ]);

    const product = productQuery.rows[0];
    if (!product || product.quantity < 1) {
      return next(new AppError('Not enough quantity available in stock.', 400));
    }

    const { rows } = await client.query(
      'INSERT INTO cart (user_id, product_id, order_quantity) VALUES ($1, $2, $3) RETURNING *',
      [values.userId, values.productId, 1],
    );

    // Reduce the quantity from the products table
    await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2', [
      1,
      values.productId,
    ]);

    return res.status(201).send(new ApiResponse(rows[0], 'success'));
  } catch (error) {
    next(error);
  }
});

export const deleteFromCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();

    // Retrieve the product_id and quantity from the cart before deleting
    const cartQuery = await client.query('SELECT product_id, order_quantity FROM cart WHERE cart_id = $1', [
      req.params.id,
    ]);
    const cartItem = cartQuery.rows[0];
    if (!cartItem) {
      return next(new AppError('Cart item not found', 404));
    }

    const result = await client.query('DELETE FROM cart WHERE cart_id = $1', [req.params.id]);

    if (result.rowCount == 0) {
      return next(new AppError('Cart item not found', 404));
    }

    const { product_id, order_quantity } = cartItem;
    // Restore the quantity in the products table
    await client.query('UPDATE products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2', [
      order_quantity,
      product_id,
    ]);

    return res.status(204).send(new ApiResponse(null, 'success'));
  } catch (error) {
    next(error);
  }
});
