/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../../shared/apiResponse';
import asyncHandler from '../../shared/asyncHandler';

import AppError from '../../shared/appError';
import { allProductsMapped } from '../adapter/product.adapter';
import TextileProduct from '../model/product.model';
import { ITextileProduct } from '../model/product.types';

// Adapter pattern
export const getAllProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await TextileProduct.find();

    res.status(200).send(new ApiResponse(products, 'success'));
  } catch (error: any) {
    next(error);
  }
});

export const AddProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product: ITextileProduct = req.body;

    const newProduct = await TextileProduct.create(product);

    res.status(200).send(new ApiResponse(newProduct, 'success'));
  } catch (error: any) {
    next(error);
  }
});

export const updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await TextileProduct.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return next(new AppError('No Product found with that ID', 404));
    }
    res.status(200).send(new ApiResponse(tour, 'success'));
  } catch (error) {
    next(error);
  }
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await TextileProduct.findByIdAndDelete(req.params.id);
    if (!tour) {
      return next(new AppError('No Product found with that ID', 404));
    }
  } catch (error) {
    next(error);
  }
});

export const getProductByID = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await TextileProduct.findById(req.params.id);

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    return res.status(200).send(new ApiResponse(product, 'success'));
  } catch (error) {
    next(error);
  }
});
