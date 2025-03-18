import { oneProductMapped } from './../adapter/product.adapter';
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../../shared/apiResponse';
import asyncHandler from '../../shared/asyncHandler';
// import pool from '../../shared/dbConnect';

import { Product, ProductResponseModel } from '../model/product.model';
import AppError from '../../shared/appError';
import { allProductsMapped } from '../adapter/product.adapter';

// // At query level
// export const getAllProducts1 = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const client = await pool.connect();
//     const resData = await client.query(
//       `SELECT product_id AS productId,
//       product_name AS productName,
//       product_description AS productDescription,
//       price,
//       stock_quantity AS stockQuantity,
//       featured,
//       json_build_object('categoryName', categories.category_name ,'categoryId', categories.category_id) as category
//       FROM products
//       LEFT JOIN categories on products.category_id = categories.category_id;`,
//     );
//     client.release();

//     res.status(200).send(new ApiResponse(resData.rows, 'success'));
//   } catch (error: any) {
//     next(error);
//   }
// });

// Adapter pattern
export const getAllProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client: any = new Promise((resolve, reject) => {});
    const resData = await client.query(
      `SELECT 
        products.*,
        json_build_object(
          'category_name', categories.category_name ,
          'category_id', categories.category_id) 
        as category
      FROM products
      LEFT JOIN categories on products.category_id = categories.category_id;`,
    );
    // LIMIT 1000
    client.release();
    // console.log(resData.rows.length);
    // console.log('Started' + Date.now());
    const mappedValues = allProductsMapped(resData.rows);
    // console.log('Ended' + Date.now());
    res.status(200).send(new ApiResponse(mappedValues, 'success'));
  } catch (error: any) {
    next(error);
  }
});

// function pickRandom() {
//   const options = [1, 2, 4, 5];
//   const randomIndex = Math.floor(Math.random() * options.length);
//   return options[randomIndex];
// }

export const AddProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client: any = new Promise((resolve, reject) => {});

    const product: Omit<Product, 'productId'> = req.body;

    const { productName, productDescription, categoryId, price, stockQuantity, featured } = product;

    if (!categoryId) {
      return next(new AppError('Category id is required', 422));
    } else {
      const existsResult = await client.query({
        text: 'SELECT EXISTS (SELECT * FROM categories WHERE category_id = $1)',
        values: [categoryId],
      });

      if (!existsResult.rows[0].exists) {
        return next(new AppError('Category id not found', 422));
      }
    }
    // Add multiple Records
    // const values1000 = [];
    // for (let i = 1; i <= 20000; i++) {
    //   values1000.push(
    //     `('Product${i}', 'Description${i}', ${pickRandom()}, ${Math.random() * 100}, ${Math.floor(Math.random() * 100)}, ${i % 2 === 0})`,
    //   );
    // }

    // const resData = await client.query(
    //   `INSERT INTO products (product_name, product_description, category_id, price, stock_quantity, featured)
    //   VALUES ${values1000.join(', ')} RETURNING *;`,
    // );
    // client.release();
    // res.status(200).send(new ApiResponse(resData.rows[0], 'success'));

    const resData = await client.query(
      `INSERT INTO products (product_name, product_description, category_id, price, stock_quantity, featured)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [productName, productDescription, categoryId, price, stockQuantity, featured],
    );
    client.release();
    res.status(200).send(new ApiResponse(resData.rows[0], 'success'));
  } catch (error: any) {
    next(error);
  }
});

export const updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client: any = new Promise((resolve, reject) => {});

    const product: Omit<Product, 'productId'> = req.body;
    const { productName, productDescription, categoryId, price, stockQuantity, featured } = product;
    const product_ID = req.params.id;

    if (!product_ID) {
      return next(new AppError('Product id is required', 400));
    }

    const existsResult = await client.query({
      text: 'SELECT EXISTS (SELECT * FROM categories WHERE category_id = $1)',
      values: [categoryId],
    });

    if (!existsResult.rows[0].exists) {
      return next(new AppError('Category id not found', 422));
    }

    const resData: any = await new Promise((resolve, reject) => {});
    client.release();
    res.status(200).send(new ApiResponse(resData.rows.length ? resData.rows[0] : null, 'success'));
  } catch (error) {
    next(error);
  }
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client: any = new Promise((resolve, reject) => {});

    const product_ID = req.params.id;
    // const { rowCount } = await client.query<Product>('DELETE FROM products WHERE product_id > 1000');
    const { rowCount }: any = await new Promise((resolve, reject) => {});
    client.release();

    if (rowCount && rowCount > 0) {
      res.status(204).send(new ApiResponse(null, 'success'));
    } else {
      next(new AppError("Product doesn't exist", 400));
    }
  } catch (error) {
    next(error);
  }
});

export const getProductByID = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client: any = await new Promise((resolve, reject) => {});
    const result = await client.query({
      text: `
        SELECT 
          p.*, 
          json_build_object(
              'category_id', c.category_id,
              'category_name', c.category_name
          ) AS category
        FROM 
            products p
        LEFT JOIN 
            categories c 
        ON 
            p.category_id = c.category_id
        WHERE 
            p.product_id = $1;`,
      values: [req.params.id],
    });

    if (result.rowCount == 0) {
      return next(new AppError('Product not found', 404));
    }

    return res.status(200).send(new ApiResponse(oneProductMapped(result.rows[0]), 'success'));
  } catch (error) {
    next(error);
  }
});
