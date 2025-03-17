import { NextFunction, Request, Response } from 'express';
import pool from '../../shared/dbConnect';

import ApiResponse from '../../shared/apiResponse';
import AppError from '../../shared/appError';
import { Product, ProductResponseModel } from '../model/product.model';
import { AddProduct, deleteProduct, getAllProducts, getProductByID, updateProduct } from './product.controller';

jest.mock('../../shared/dbConnect'); // Mock the database pool

let client: any;
let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

const defaultDescribe = () => {
  beforeAll(() => {
    client = {
      connect: jest.fn(),
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(client);
  });

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    client.release();
  });
};

describe('getAllProducts', () => {
  defaultDescribe();
  it('Should return 200 and list of products on success', async () => {
    client.query.mockResolvedValue({
      rows: [
        {
          product_name: 'Test Product',
          product_id: 1,
          product_description: 'Test Description',
          price: 200,
          stock_quantity: 10,
          featured: false,
          category: { category_name: 'Test Category', category_id: 1 },
        },
      ],
    });

    await getAllProducts(req as Request, res as Response, next);

    const expectedResult: ProductResponseModel[] = [
      {
        productId: 1,
        productName: 'Test Product',
        productDescription: 'Test Description',
        price: 200,
        stockQuantity: 10,
        featured: false,
        category: {
          categoryId: 1,
          categoryName: 'Test Category',
        },
      },
    ];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(expectedResult, 'success'));
  });

  it('Should call next with error on exception', async () => {
    client.query.mockRejectedValue(new Error('Database error'));

    await getAllProducts(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database error'));
  });
});
// Add product test cases
describe('AddProduct', () => {
  defaultDescribe();

  it('Should return 422 if categoryId is missing', async () => {
    req.body = { productName: 'Test Product', price: 100 };

    await AddProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category id is required', 422));
  });

  it('Should return 422 if categoryId does not exist', async () => {
    client.query.mockResolvedValue({ rows: [{ exists: false }], rowCount: 0 });

    req.body = { productName: 'Test Product', categoryId: 999, price: 100 };

    await AddProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category id not found', 422));
  });

  it('Should add a product and return 200 on success', async () => {
    const mockProducts: Product[] = [
      {
        productId: 1,
        productName: 'Product 1',
        productDescription: 'Description 1',
        categoryId: 1,
        price: 10,
        stockQuantity: 5,
        featured: true,
      },
    ];

    client.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
    client.query.mockResolvedValueOnce({ rows: mockProducts });

    req.body = {
      productName: 'Test Product',
      productDescription: 'A great product',
      categoryId: 1,
      price: 100,
      stockQuantity: 50,
      featured: true,
    };

    await AddProduct(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(mockProducts[0], 'success'));
  });

  it('Should call next with error on exception', async () => {
    client.query.mockRejectedValue(new Error('Database Error'));

    req.body = {
      productName: 'Test Product',
      productDescription: 'A great product',
      categoryId: 1,
      price: 100,
      stockQuantity: 50,
      featured: true,
    };

    await AddProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});

// Update product test cases
describe('updateProduct', () => {
  defaultDescribe();

  it('Should return 400 if any productId is missing in URL params', async () => {
    req.params = { notAnId: 1 } as unknown as Request['params'];
    req.body = {
      productName: 'Test',
      productDescription: 'Description 1',
      categoryId: 1,
      price: 10,
      stockQuantity: 5,
      featured: true,
    };

    await updateProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Product id is required', 400));
  });

  it('Should return 422 if categoryId does not exist', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    req.body = {
      productName: 'Test',
      productDescription: 'Description 1',
      categoryId: 1,
      price: 10,
      stockQuantity: 5,
      featured: true,
    };
    client.query.mockResolvedValue({ rows: [{ exists: false }], rowCount: 0 });

    await updateProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category id not found', 422));
  });

  it('Should update product and return 200 on success', async () => {
    const mockProducts: Product[] = [
      {
        productId: 1,
        productName: 'Product',
        productDescription: 'Description 1',
        categoryId: 1,
        price: 100,
        stockQuantity: 50,
        featured: true,
      },
    ];

    client.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
    client.query.mockResolvedValueOnce({ rows: mockProducts });
    req.params = { id: 1 } as unknown as Request['params'];
    req.body = {
      productName: 'Test Product',
      productDescription: 'A great product',
      categoryId: 1,
      price: 100,
      stockQuantity: 50,
      featured: true,
    };

    await updateProduct(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(mockProducts[0], 'success'));
  });

  it('Should call next with error on exception', async () => {
    client.query.mockRejectedValue(new Error('Database Error'));
    req.params = { id: 1 } as unknown as Request['params'];
    req.body = {
      productName: 'Test Product',
      productDescription: 'A great product',
      categoryId: 1,
      price: 100,
      stockQuantity: 50,
      featured: true,
    };

    await updateProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});
// Delete product test cases
describe('deleteProduct', () => {
  defaultDescribe();

  it('Should delete product and return 204 on success', async () => {
    client.query.mockResolvedValueOnce({ rowCount: 1 });

    req.params = { id: 1 } as unknown as Request['params'];

    await deleteProduct(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(null, 'success'));
  });

  it('Should return 400 if product not found', async () => {
    client.query.mockResolvedValueOnce({ rowCount: 0 });

    req.params = { id: 1 } as unknown as Request['params'];

    await deleteProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError("Product doesn't exist", 400));
  });

  it('Should call next with error on exception', async () => {
    client.query.mockRejectedValue(new Error('Database Error'));
    req.params = { id: 1 } as unknown as Request['params'];

    await deleteProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});

// Get product by ID
describe('getProductByID', () => {
  defaultDescribe();

  it('Should return 200 and product on success', async () => {
    client.query.mockResolvedValue({
      rows: [
        {
          product_name: 'Test Product',
          product_id: 1,
          product_description: 'Test Description',
          price: 200,
          stock_quantity: 10,
          featured: false,
          category: { category_name: 'Test Category', category_id: 1 },
        },
      ],
    });
    req.params = { id: 1 } as unknown as Request['params'];

    await getProductByID(req as Request, res as Response, next);

    const expectedResult: ProductResponseModel = {
      productId: 1,
      productName: 'Test Product',
      productDescription: 'Test Description',
      price: 200,
      stockQuantity: 10,
      featured: false,
      category: {
        categoryId: 1,
        categoryName: 'Test Category',
      },
    };

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      new ApiResponse(
        expectedResult,

        'success',
      ),
    );
  });

  it('Should return 404 if product not found', async () => {
    client.query.mockResolvedValue({
      rowCount: 0,
    });
    req.params = { id: 1 } as unknown as Request['params'];

    await getProductByID(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Product not found', 404));
  });

  it('Should call next with error on exception', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    client.query.mockRejectedValue(new Error('Database error'));

    await getProductByID(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database error'));
  });
});
