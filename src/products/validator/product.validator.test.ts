import { validateProduct } from './product.validator';
import { Request, Response, NextFunction } from 'express';
import { Product } from '../model/product.model';
import AppError from '../../shared/appError';

// Mock request and response objects
const mockRequest = (body: Partial<Omit<Product, 'productId'>>) =>
  ({
    body,
  }) as Request;

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Validate Product Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when the request body is valid', () => {
    const validProduct = {
      productName: 'product',
      productDescription: 'This is a valid product description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(validProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should return an error if any field is missing from the request', () => {
    const invalidProduct = {
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Please check all the field names', 400));
  });

  it('should return an error if productName is missing', () => {
    const invalidProduct = {
      productName: '',
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Product name is required', 400));
  });

  it('should return an error if productName exceeds 10 characters', () => {
    const invalidProduct = {
      productName: 'InvalidProductName',
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new AppError('Product name must not exceed 10 characters', 400));
  });
  it('should return an error if productName contain special characters', () => {
    const invalidProduct = {
      productName: '@@ree',
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(
      new AppError('Product name must only contain letters, numbers, and spaces', 400),
    );
  });
  it('should return an error if productName contain 3 consecutive digits', () => {
    const invalidProduct = {
      productName: 'rer2324',
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new AppError('Product name must not have 3 consecutive digits', 400));
  });
  it('should return an error if fieldName type is string but contain only number', () => {
    const invalidProduct: any = {
      productName: 22,
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new AppError('Expected string, received number', 400));
  });

  it('should return an error if productDescription is missing its value', () => {
    const invalidProduct = {
      productName: 'product',
      productDescription: '',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new AppError('Product description is required', 400));
  });
  it('should return an error if productDescription have 100+ characters', () => {
    const invalidProduct = {
      productName: 'product',
      productDescription: 'a'.repeat(101),
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new AppError('Product description must not exceed 100 characters', 400));
  });

  it('should return an error if categoryId is not a number', () => {
    const invalidProduct: any = {
      productName: 'product',
      productDescription: 'Description',
      categoryId: 'not_a_number',
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Category Id must be a number', 400));
  });
  it('should return an error if categoryId is negative number', () => {
    const invalidProduct: any = {
      productName: 'product',
      productDescription: 'Description',
      categoryId: -10,
      price: 10.99,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Category id must be a positive number', 400));
  });

  it('should return an error if price is not a number', () => {
    const invalidProduct: any = {
      productName: 'product',
      productDescription: 'Description',
      categoryId: 1,
      price: 'not_a_number',
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Price must be a number', 400));
  });

  it('should return an error if price is not positive', () => {
    const invalidProduct = {
      productName: 'product',
      productDescription: 'Description',
      categoryId: 1,
      price: -5,
      stockQuantity: 100,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Price must be a positive number', 400));
  });

  it('should return an error if stockQuantity is not a number', () => {
    const invalidProduct: any = {
      productName: 'product',
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 'not_number',
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Stock quantity must be a number', 400));
  });

  it('should return an error if stockQuantity is zero or negative number', () => {
    const invalidProduct = {
      productName: 'product',
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 0,
      featured: true,
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Stock quantity must be a positive number', 400));
  });

  it('should return an error if featured is not a boolean', () => {
    const invalidProduct: any = {
      productName: 'product',
      productDescription: 'Description',
      categoryId: 1,
      price: 10.99,
      stockQuantity: 100,
      featured: 'not_boolean',
    };

    const req = mockRequest(invalidProduct);
    const res = mockResponse();

    validateProduct(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Featured must be a selected value from yes/no', 400));
  });
});
